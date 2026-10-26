#!/usr/bin/env node
//
// Usage: node scripts/save-baseline.js posters/<file>.html
//
// Renders the poster and overwrites audit/baselines/<name>.png with it,
// unconditionally. Called by `audit-log.js approve` — approval means
// "this is now correct," so the baseline should move to match. Don't
// run this manually outside of approval unless you mean to reset the
// comparison point without an approval record.

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { parseDimensions } = require("./dimensions");

const BASELINE_DIR = path.join("audit", "baselines");

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/save-baseline.js posters/<file>.html");
    process.exit(1);
  }

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

  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const name = path.basename(file, ".html");
  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  fs.writeFileSync(baselinePath, buf);
  // Clear any stale diff from a previous comparison.
  const diffPath = path.join(BASELINE_DIR, `${name}.diff.png`);
  if (fs.existsSync(diffPath)) fs.unlinkSync(diffPath);

  console.log(`Baseline saved: ${baselinePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
