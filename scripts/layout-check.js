#!/usr/bin/env node
//
// Usage: node scripts/layout-check.js posters/<file>.html
//
// Automated layout QA using a real headless browser (Playwright), not
// guesswork. Loads the poster at its exact intended dimensions and checks:
//
//   1. Clipping — any element with visible content (text or image) whose
//      box extends past the page bounds. Catches the "chip wrapped
//      behind the contact card" class of bug.
//   2. Overlap — any two unrelated elements with visible content whose
//      boxes significantly intersect. Catches the "email text touching
//      the QR code" class of bug.
//   3. Contrast (basic) — text color vs its background, flagged if the
//      computed contrast ratio is below WCAG AA (4.5:1) for body-sized
//      text. Heuristic, not a full WCAG audit.
//
// This does NOT verify the design looks good — that still needs the
// screenshot to be visually reviewed. It only catches mechanical layout
// defects that are checkable from box geometry and color math.

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
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

function parseRgb(str) {
  const m = str.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return { rgb: [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])], a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
}

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/layout-check.js posters/<file>.html");
    process.exit(1);
  }

  const html = fs.readFileSync(file, "utf-8");
  const dims = parseDimensions(html);
  const absolutePath = path.resolve(file);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: dims.cssWidth, height: dims.cssHeight } });
  await page.goto(`file://${absolutePath}`, { waitUntil: "networkidle" });
  // Neutralize the fit-to-window preview script so measurements are at
  // true 1:1 scale regardless of viewport.
  await page.evaluate(() => {
    document.body.style.transform = "none";
    document.body.style.position = "static";
  });

  const data = await page.evaluate(() => {
    const pageRect = document.body.getBoundingClientRect();
    const els = Array.from(document.body.querySelectorAll("*"));
    const nodes = [];

    for (const el of els) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;

      // Only consider elements that directly own visible content: own
      // (non-whitespace) text not from a child element, or an <img>.
      const ownText = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join("")
        .trim();
      const isImg = el.tagName === "IMG";
      if (!ownText && !isImg) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      nodes.push({
        el,
        tag: el.tagName,
        cls: el.className && typeof el.className === "string" ? el.className : "",
        text: ownText.slice(0, 40),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
        color: style.color,
        bgColor: style.backgroundColor,
        fontSize: parseFloat(style.fontSize),
      });
    }

    // Compute overlap pairs here, where DOM references (contains()) are
    // still available to exclude ancestor/descendant pairs (e.g. a label
    // div and the <span> it wraps around part of its own text).
    function intersectArea(a, b) {
      const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
      const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
      return x * y;
    }
    const overlaps = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue; // ancestor/descendant — not a real overlap
        const area = intersectArea(a.rect, b.rect);
        if (area <= 0) continue;
        const smaller = Math.min(a.rect.width * a.rect.height, b.rect.width * b.rect.height);
        const ratio = area / smaller;
        if (ratio > 0.15) {
          overlaps.push({
            ratio,
            detail: `<${a.tag.toLowerCase()}> "${a.text}" overlaps <${b.tag.toLowerCase()}> "${b.text}" by ${Math.round(ratio * 100)}% of the smaller element's area`,
          });
        }
      }
    }

    const results = nodes.map(({ el, ...rest }) => rest);
    return { pageRect: { width: pageRect.width, height: pageRect.height }, els: results, overlaps };
  });

  await browser.close();

  const issues = [];
  const TOLERANCE = 1; // px

  // 1. Clipping
  for (const el of data.els) {
    const { rect } = el;
    if (rect.x < -TOLERANCE || rect.y < -TOLERANCE || rect.right > data.pageRect.width + TOLERANCE || rect.bottom > data.pageRect.height + TOLERANCE) {
      issues.push({
        type: "clipping",
        severity: "fail",
        detail: `<${el.tag.toLowerCase()} class="${el.cls}"> "${el.text}" extends outside the page bounds (box: ${Math.round(rect.x)},${Math.round(rect.y)} ${Math.round(rect.width)}x${Math.round(rect.height)}; page: ${Math.round(data.pageRect.width)}x${Math.round(data.pageRect.height)})`,
      });
    }
  }

  // 2. Overlap between unrelated elements (ancestor/descendant pairs
  // already excluded inside the browser context, where contains() works).
  for (const o of data.overlaps) {
    issues.push({
      type: "overlap",
      severity: o.ratio > 0.4 ? "fail" : "warn",
      detail: o.detail,
    });
  }

  // 3. Basic contrast check (text elements only, skip near-empty backgrounds we can't resolve)
  for (const el of data.els) {
    if (!el.text || el.fontSize === 0) continue;
    const fg = parseRgb(el.color);
    const bg = parseRgb(el.bgColor);
    if (!fg || !bg || bg.a === 0) continue; // transparent bg — can't check without compositing ancestors, skip
    const ratio = contrastRatio(fg.rgb, bg.rgb);
    const isLarge = el.fontSize >= 18;
    const minRatio = isLarge ? 3 : 4.5;
    if (ratio < minRatio) {
      issues.push({
        type: "contrast",
        severity: "warn",
        detail: `<${el.tag.toLowerCase()}> "${el.text}" contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA (${minRatio}:1 for ${isLarge ? "large" : "body"} text) against its own declared background — verify against the actual rendered background if this element sits on an image/gradient`,
      });
    }
  }

  console.log(`\n${file}  (${data.pageRect.width}x${data.pageRect.height})`);
  if (issues.length === 0) {
    console.log("  OK — no clipping, overlap, or contrast issues detected.");
  }
  const fails = issues.filter((i) => i.severity === "fail");
  const warns = issues.filter((i) => i.severity === "warn");
  for (const i of fails) console.log(`  FAIL [${i.type}]: ${i.detail}`);
  for (const i of warns) console.log(`  WARN [${i.type}]: ${i.detail}`);
  console.log("");

  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
