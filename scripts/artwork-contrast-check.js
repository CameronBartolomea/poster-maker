#!/usr/bin/env node
//
// Usage: node scripts/artwork-contrast-check.js posters/<file>.html
//
// Round 3 finding: Cameron caught a real defect none of the existing
// automated checks could have caught — a dark vector illustration
// (hero-asymmetric-b) sitting on a near-black background, "nearly
// disappears into the background." layout-check.js's contrast check
// only compares TEXT color against its own declared CSS background —
// it has never looked at an <img> or <svg> illustration at all. This
// script closes that gap: it renders the poster, finds every
// meaningful artwork element (<img>, top-level <svg>), and measures
// the ACTUAL RENDERED PIXELS — the artwork's own area against a ring
// immediately outside it — rather than trusting any CSS declaration.
// That matters because the real defect here was two declared colors
// that are individually fine but visually collide; a DOM-level check
// of declared values would miss it exactly like layout-check.js did.
//
// This is a genuine, different kind of check from layout-check.js's
// text-contrast pass: pixel sampling against the real composited
// screenshot, not computed-style introspection. It does NOT replace
// an actual visual look at the screenshot — it catches the "nearly
// invisible" class of failure, not whether the artwork is tasteful,
// well-scaled, or communicates anything. That judgment still needs a
// human/AI visual read.

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { parseDimensions } = require("./dimensions");

function relLuminance([r, g, b]) {
  const srgb = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1) + 0.05;
  const l2 = relLuminance(rgb2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

// NOTE: sharp .stats() on a chained .extract() was tested and found to
// return the full image's stats instead of the cropped region's (verified
// by comparing against a manual mean over the raw decoded buffer, which
// gave correct per-region values while .stats() gave identical numbers
// for every region regardless of crop). Computing the mean manually off
// .raw().toBuffer() sidesteps whatever that bug is.
async function rawRegionMean(imgBuffer, left, top, width, height) {
  const raw = await sharp(imgBuffer)
    .extract({ left, top, width, height })
    .removeAlpha()
    .raw()
    .toBuffer();
  const channels = 3;
  let sum = [0, 0, 0];
  const n = raw.length / channels;
  for (let i = 0; i < raw.length; i += channels) {
    sum[0] += raw[i];
    sum[1] += raw[i + 1];
    sum[2] += raw[i + 2];
  }
  return [sum[0] / n, sum[1] / n, sum[2] / n];
}

async function meanColor(imgBuffer, pageW, pageH, rect) {
  const x = Math.max(0, Math.round(rect.x));
  const y = Math.max(0, Math.round(rect.y));
  const w = Math.min(Math.round(rect.width), pageW - x);
  const h = Math.min(Math.round(rect.height), pageH - y);
  if (w <= 0 || h <= 0) return null;
  return rawRegionMean(imgBuffer, x, y, w, h);
}

// Sample a ring of bands just outside an element's bbox, clipped to the
// page, and return the area-weighted average color across whichever
// bands actually fit. This is the "what's really behind this artwork"
// ground truth — not a CSS background-color guess.
async function ringColor(imgBuffer, pageW, pageH, rect, margin = 10, thickness = 14) {
  const bands = [
    // top
    { x: rect.x - margin, y: rect.y - margin - thickness, width: rect.width + margin * 2, height: thickness },
    // bottom
    { x: rect.x - margin, y: rect.y + rect.height + margin, width: rect.width + margin * 2, height: thickness },
    // left
    { x: rect.x - margin - thickness, y: rect.y - margin, width: thickness, height: rect.height + margin * 2 },
    // right
    { x: rect.x + rect.width + margin, y: rect.y - margin, width: thickness, height: rect.height + margin * 2 },
  ];
  let total = [0, 0, 0];
  let weight = 0;
  for (const b of bands) {
    const x = Math.max(0, Math.round(b.x));
    const y = Math.max(0, Math.round(b.y));
    const right = Math.min(pageW, Math.round(b.x + b.width));
    const bottom = Math.min(pageH, Math.round(b.y + b.height));
    const w = right - x;
    const h = bottom - y;
    if (w <= 1 || h <= 1) continue;
    const mean = await rawRegionMean(imgBuffer, x, y, w, h);
    const area = w * h;
    total[0] += mean[0] * area;
    total[1] += mean[1] * area;
    total[2] += mean[2] * area;
    weight += area;
  }
  if (weight === 0) return null;
  return [total[0] / weight, total[1] / weight, total[2] / weight];
}

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/artwork-contrast-check.js posters/<file>.html");
    process.exit(1);
  }

  const html = fs.readFileSync(file, "utf-8");
  const dims = parseDimensions(html);
  const absolutePath = path.resolve(file);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: dims.cssWidth, height: dims.cssHeight }, deviceScaleFactor: 1 });
  await page.goto(`file://${absolutePath}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.body.style.transform = "none";
    document.body.style.position = "static";
  });

  const MIN_SIDE = 45; // px — below this, treat as a small icon/QR, not "artwork" worth a contrast judgement

  const candidates = await page.evaluate((MIN_SIDE) => {
    const out = [];
    const seen = new Set();
    const els = Array.from(document.body.querySelectorAll("img, svg"));
    for (const el of els) {
      // Skip icon <symbol> definitions and anything inside a display:none defs block.
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;
      // Skip an <svg> that's purely a hidden symbol registry.
      if (el.tagName.toLowerCase() === "svg" && el.querySelector("symbol") && el.style.display === "none") continue;
      // Skip <img> or <svg> nested inside another candidate <svg> (shouldn't happen, but be safe).
      const rect = el.getBoundingClientRect();
      if (rect.width < MIN_SIDE || rect.height < MIN_SIDE) continue;
      const key = `${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)},${Math.round(rect.height)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className && typeof el.className === "string" ? el.className : el.getAttribute("class") || "",
        src: el.tagName.toLowerCase() === "img" ? el.getAttribute("src") : null,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      });
    }
    return out;
  }, MIN_SIDE);

  const screenshotBuffer = await page.screenshot({ clip: { x: 0, y: 0, width: dims.cssWidth, height: dims.cssHeight } });
  await browser.close();

  if (candidates.length === 0) {
    console.log(`\n${file}`);
    console.log("  No artwork elements (img/svg) at or above the size threshold found — nothing to check.");
    console.log("");
    process.exit(0);
  }

  const issues = [];
  const results = [];

  for (const c of candidates) {
    // Foreground: center crop at 45% of the element's own box, to sample
    // the actual illustration rather than its edges (anti-aliasing) or
    // any transparent padding near the box edge.
    const fw = c.rect.width * 0.45;
    const fh = c.rect.height * 0.45;
    const fgRect = {
      x: c.rect.x + (c.rect.width - fw) / 2,
      y: c.rect.y + (c.rect.height - fh) / 2,
      width: fw,
      height: fh,
    };
    const fg = await meanColor(screenshotBuffer, dims.cssWidth, dims.cssHeight, fgRect);
    const bg = await ringColor(screenshotBuffer, dims.cssWidth, dims.cssHeight, c.rect);

    if (!fg || !bg) {
      results.push({ c, note: "could not sample (element at page edge or too small) — skipped" });
      continue;
    }

    const ratio = contrastRatio(fg, bg);
    const label = `<${c.tag}${c.cls ? ` class="${c.cls}"` : ""}${c.src ? ` src="${c.src.split("/").pop()}"` : ""}> at ${Math.round(c.rect.x)},${Math.round(c.rect.y)} (${Math.round(c.rect.width)}x${Math.round(c.rect.height)})`;
    const fgHex = "#" + fg.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
    const bgHex = "#" + bg.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

    let severity = "pass";
    if (ratio < 1.5) severity = "fail";
    else if (ratio < 2.2) severity = "warn";

    results.push({ c, ratio, fgHex, bgHex, severity, label });
    if (severity !== "pass") {
      issues.push({
        type: "artwork-contrast",
        severity,
        detail: `${label} — artwork color ~${fgHex} against surrounding ~${bgHex}, contrast ratio ${ratio.toFixed(2)}:1 (${severity === "fail" ? "below 1.5:1 — likely reads as nearly invisible" : "below 2.2:1 — likely reads as flat/muddy"})`,
      });
    }
  }

  console.log(`\n${file}  (${dims.cssWidth}x${dims.cssHeight})`);
  if (issues.length === 0) {
    console.log(`  OK — ${results.length} artwork element(s) checked, all show adequate contrast against their surroundings.`);
  }
  for (const r of results) {
    if (!r.ratio) continue;
    const tag = r.severity === "fail" ? "FAIL" : r.severity === "warn" ? "WARN" : "info";
    console.log(`  ${tag} [artwork-contrast]: ${r.label} — ${r.fgHex} vs ${r.bgHex} — ${r.ratio.toFixed(2)}:1`);
  }
  for (const r of results) {
    if (r.note) console.log(`  SKIP: <${r.c.tag}> at ${Math.round(r.c.rect.x)},${Math.round(r.c.rect.y)} — ${r.note}`);
  }
  console.log("");

  const fails = issues.filter((i) => i.severity === "fail");
  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
