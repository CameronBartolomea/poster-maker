#!/usr/bin/env node
//
// Usage: node scripts/visual-diff.js posters/<file>.html
//
// Compares the current render against the last-approved baseline for
// this flyer (audit/baselines/<name>.png). No baseline yet → just saves
// one and reports "baseline created". A baseline is only ever written
// here or by scripts/audit-log.js on approve — this command on its own
// never overwrites an existing baseline, so you can run it freely while
// iterating.
//
// Diff image (if any pixels differ) is written to
// audit/baselines/<name>.diff.png for visual inspection.

const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch").default || require("pixelmatch");
const fs = require("fs");
const path = require("path");
const { parseDimensions } = require("./dimensions");

const BASELINE_DIR = path.join("audit", "baselines");

async function render(file) {
  const html = fs.readFileSync(file, "utf-8");
  const dims = parseDimensions(html);
  const absolutePath = path.resolve(file);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: dims.cssWidth, height: dims.cssHeight } });
  await page.goto(`file://${absolutePath}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.body.style.transform = "none";
    document.body.style.position = "static";
  });
  const buf = await page.screenshot({ type: "png" });
  await browser.close();
  return buf;
}

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/visual-diff.js posters/<file>.html");
    process.exit(1);
  }

  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const name = path.basename(file, ".html");
  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  const diffPath = path.join(BASELINE_DIR, `${name}.diff.png`);

  const currentBuf = await render(file);

  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, currentBuf);
    console.log(`No baseline existed — saved current render as the baseline: ${baselinePath}`);
    console.log("This is NOT the same as approval. Baselines just track visual changes going forward.");
    process.exit(0);
  }

  const baselinePng = PNG.sync.read(fs.readFileSync(baselinePath));
  const currentPng = PNG.sync.read(currentBuf);

  if (baselinePng.width !== currentPng.width || baselinePng.height !== currentPng.height) {
    console.log(`Dimensions changed: baseline ${baselinePng.width}x${baselinePng.height} vs current ${currentPng.width}x${currentPng.height}. Treating as a full change — review manually.`);
    fs.writeFileSync(path.join(BASELINE_DIR, `${name}.current.png`), currentBuf);
    process.exit(1);
  }

  const { width, height } = baselinePng;
  const diffPng = new PNG({ width, height });
  const diffPixels = pixelmatch(baselinePng.data, currentPng.data, diffPng.data, width, height, { threshold: 0.1 });
  const totalPixels = width * height;
  const diffPct = (diffPixels / totalPixels) * 100;

  if (diffPixels > 0) {
    fs.writeFileSync(diffPath, PNG.sync.write(diffPng));
  }

  console.log(`\n${file}`);
  console.log(`  Baseline: ${baselinePath}`);
  console.log(`  Changed pixels: ${diffPixels} / ${totalPixels} (${diffPct.toFixed(3)}%)`);
  if (diffPixels === 0) {
    console.log("  No visual difference from the approved baseline.");
  } else {
    console.log(`  Visual diff written to ${diffPath} — review it before re-approving.`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
