#!/usr/bin/env python3
"""
Multi-color vector tracing.

Round 2 of this project's artwork work used potrace to trace a raster
illustration into a single-color vector silhouette — infinitely
scalable, but a flat one-color mark, not the illustration's actual
palette. Cameron's round-3 feedback explicitly rejected that as the
system's only answer ("Don't limit the system to monochrome vector
silhouettes"). This script is the tested alternative: it separates an
illustration into several flat color regions and traces EACH one
separately, then recombines them into a single multi-color SVG. The
result is still a true vector (no resolution ceiling, no upscale
blur) but keeps real color instead of collapsing to one silhouette.

Pipeline:
  1. Sample the background color from the source image's corners.
  2. Separate foreground (illustration) pixels from background by
     color distance from that sampled background.
  3. K-means cluster the foreground pixels into N colors — this is
     the posterization step; it is why the output has flat color
     regions rather than the source's full gradient shading.
  4. For each color cluster, build a black/white mask and trace it
     with potrace (one closed-path shape per color).
  5. Recombine all traced layers into one <svg>, each as a colored
     <path>, ordered largest-area-first (base shapes under, detail
     colors on top).

Honest limitations (see design-system/artwork-capability-audit.md for
the tested writeup, not just this docstring):
  - This POSTERIZES. A source with smooth gradient shading becomes
    flat color bands. It is not a substitute for genuine multi-tone
    illustration, it is a tested way to get real (if simplified)
    color into a true vector shape.
  - Fine texture (soil grain, fine hatching) fragments into many
    small stray sub-paths at low --turdsize, or disappears entirely
    at high --turdsize. There is a real tradeoff to tune per image,
    not a value that works for every source.
  - Color-region edges are hard-antialiased in the source PNG, so
    adjacent color masks can leave 1px seams or tiny gaps at common
    boundaries. Usually invisible at display size; worth a visual
    check at hero scale.

Usage:
  python3 scripts/vectorize-color.py <input.png> <output.svg> \
      [--colors N] [--threshold T] [--turdsize S]

Requires: Pillow, numpy, scikit-learn, potrace (apt package).
"""
import sys
import os
import re
import subprocess
import argparse
import tempfile
import shutil

import numpy as np
from PIL import Image


def sample_background(arr):
    h, w, _ = arr.shape
    corners = [arr[0, 0], arr[0, w - 1], arr[h - 1, 0], arr[h - 1, w - 1]]
    return np.mean(corners, axis=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--colors", type=int, default=5, help="number of foreground color clusters")
    ap.add_argument("--threshold", type=float, default=28.0, help="color distance from sampled background to call a pixel foreground")
    ap.add_argument("--turdsize", type=int, default=8, help="potrace speckle-suppression size (higher = fewer stray specks, less fine detail)")
    ap.add_argument("--min-area", type=int, default=20, help="drop a color layer entirely below this many pixels")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(f"Input not found: {args.input}")
        sys.exit(1)

    im = Image.open(args.input).convert("RGB")
    arr = np.array(im).astype(np.float64)
    h, w, _ = arr.shape

    bg = sample_background(arr)
    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    fg_mask = dist > args.threshold
    fg_pixels = arr[fg_mask]

    if len(fg_pixels) < 10:
        print("Too few foreground pixels found above threshold — lower --threshold or check the source image.")
        sys.exit(1)

    from sklearn.cluster import KMeans

    n_colors = max(1, min(args.colors, len(fg_pixels)))
    km = KMeans(n_clusters=n_colors, n_init=4, random_state=0).fit(fg_pixels)
    labels_full = np.full((h, w), -1, dtype=int)
    labels_full[fg_mask] = km.labels_
    centers = km.cluster_centers_

    tmpdir = tempfile.mkdtemp(prefix="vectorize-color-")
    try:
        layers = []  # (area, transform, hexcolor, path_d)
        viewbox = None

        for ci in range(n_colors):
            mask = labels_full == ci
            area = int(mask.sum())
            if area < args.min_area:
                continue

            bw = np.where(mask, 0, 255).astype(np.uint8)
            pbm_path = os.path.join(tmpdir, f"layer{ci}.pbm")
            Image.fromarray(bw, mode="L").save(pbm_path)

            svg_path = os.path.join(tmpdir, f"layer{ci}.svg")
            subprocess.run(
                ["potrace", pbm_path, "-s", "-t", str(args.turdsize), "-o", svg_path],
                check=True, capture_output=True,
            )
            svg_text = open(svg_path).read()

            if viewbox is None:
                vb = re.search(r'viewBox="([^"]+)"', svg_text)
                viewbox = vb.group(1) if vb else f"0 0 {w} {h}"

            gm = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', svg_text, re.S)
            if not gm:
                continue
            transform, inner = gm.group(1), gm.group(2)
            paths = re.findall(r'<path[^>]*\bd="([^"]+)"', inner)
            if not paths:
                continue
            d_combined = " ".join(paths)

            r, g, b = [int(round(c)) for c in centers[ci]]
            hexcolor = f"#{r:02x}{g:02x}{b:02x}"
            layers.append((area, transform, hexcolor, d_combined))

        if not layers:
            print("No color layers survived tracing (all below --min-area, or potrace found nothing). Try a lower --threshold or --min-area.")
            sys.exit(1)

        # Largest area first: base/background shapes drawn under, smaller
        # detail-color regions drawn on top of them.
        layers.sort(key=lambda t: -t[0])
        transform = layers[0][1]  # identical across layers — same source dimensions

        total = h * w
        parts = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s">' % viewbox,
            '  <g transform="%s" stroke="none">' % transform,
        ]
        for area, _, hexcolor, d in layers:
            parts.append(f'    <path fill="{hexcolor}" d="{d}"/>')
        parts.append("  </g>")
        parts.append("</svg>")

        with open(args.output, "w") as f:
            f.write("\n".join(parts) + "\n")

        print(f"Wrote {args.output}")
        print(f"  viewBox: {viewbox}  |  {len(layers)} color layers (of {n_colors} clustered)")
        for area, _, hexcolor, _ in layers:
            print(f"    {hexcolor}  {100.0 * area / total:.1f}% of canvas")
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


if __name__ == "__main__":
    main()
