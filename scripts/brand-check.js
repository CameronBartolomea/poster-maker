#!/usr/bin/env node
//
// Usage: node scripts/brand-check.js posters/<file>.html
//
// Round 3 ask #3: "verify the official Strategic Home Loans logo is
// embedded correctly in every relevant template and that its
// proportions, colors, and clear space are preserved." Round 2 found
// the logo had never actually been used anywhere in this repo — every
// flyer recreated "STRATEGIC HOME LOANS" as styled CSS text instead.
// Two new pieces fixed that for themselves, but nothing checks it
// automatically, so a future flyer could silently regress back to
// recreating the wordmark. This script makes that a real, repeatable
// check instead of something that has to be remembered.
//
// What it checks, for any flyer type that plausibly needs the logo
// (skips explicitly logo-free pieces, e.g. a capability test that says
// so, by checking a --expect-logo / --no-logo flag):
//   1. Presence — at least one <img> referencing the real logo asset
//      under assets/brand/logo/ (not a styled text recreation).
//   2. Proportion — the logo's RENDERED aspect ratio matches the
//      source file's true aspect ratio within 1%. Catches accidental
//      width/height stretching (one CSS dimension set, not both, with
//      object-fit not set to contain).
//   3. Clear space — no other visible element's box intrudes into a
//      margin around the logo at least 0.25x the logo's own height
//      (a simple, conservative clear-space heuristic, not the brand
//      guideline's exact spec, which isn't written down anywhere in
//      this repo yet — see note below).
//
// Honest limitation: there is no documented formal clear-space value
// or a reversed/white logo asset in assets/brand/logo/ — the dark-
// background technique used so far derives a white version with a CSS
// filter (brightness(0) invert(1)) rather than using an authorized
// reversed file. This script accepts that technique for now but flags
// it explicitly so it stays a visible, not a silent, decision.

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { parseDimensions } = require("./dimensions");

const LOGO_DIR = "assets/brand/logo";

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error("Usage: node scripts/brand-check.js posters/<file>.html [--no-logo-expected]");
    process.exit(1);
  }
  const noLogoExpected = process.argv.includes("--no-logo-expected");

  const html = fs.readFileSync(file, "utf-8");
  const dims = parseDimensions(html);
  const absolutePath = path.resolve(file);

  // Build a lookup of real logo asset true aspect ratios.
  const logoFiles = fs.existsSync(LOGO_DIR) ? fs.readdirSync(LOGO_DIR).filter((f) => /\.(png|svg|jpg|jpeg)$/i.test(f)) : [];
  const logoRatios = {};
  for (const f of logoFiles) {
    if (/\.svg$/i.test(f)) continue; // vector — no fixed intrinsic ratio to check against here
    try {
      const meta = await sharp(path.join(LOGO_DIR, f)).metadata();
      logoRatios[f] = meta.width / meta.height;
    } catch (e) {
      /* skip unreadable */
    }
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: dims.cssWidth, height: dims.cssHeight } });
  await page.goto(`file://${absolutePath}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.body.style.transform = "none";
    document.body.style.position = "static";
  });

  const data = await page.evaluate(() => {
    const pageRect = document.body.getBoundingClientRect();
    const logoEls = [];
    const logos = [];
    const imgs = Array.from(document.body.querySelectorAll("img"));
    for (const el of imgs) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const src = el.getAttribute("src") || "";
      if (!/brand\/logo\//.test(src)) continue;
      // The "logo unit" that clear-space intrusion is judged against is
      // the logo's own small wrapper (its parent), not the bare <img> —
      // a caption/tagline sibling sitting directly under the logo inside
      // the same wrapper (e.g. "Westlake Village, CA") is part of the
      // lockup, not an intrusion into it. Walking up one level is a
      // reasonable default; if a template nests the logo deeper, widen
      // this on a per-case basis rather than loosening it globally.
      let unitEl = el.parentElement || el;
      // A logo wrapped in a padded "chip" (class contains "logo-chip",
      // the convention used for a logo placed on a light chip over a
      // dark background — see design-system/components.md #11b) has its
      // caption/tagline as a SIBLING of the chip, one level further up,
      // not a descendant of the chip itself. Climb one more level so
      // that caption is still recognized as part of the same lockup.
      if (unitEl.className && /logo-chip/.test(String(unitEl.className)) && unitEl.parentElement) {
        unitEl = unitEl.parentElement;
      }
      logoEls.push(unitEl);
      logos.push({
        src,
        filename: src.split("/").pop(),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
        filter: style.filter,
        _unitIndex: logoEls.length - 1,
      });
    }

    // All other visible content boxes (for clear-space check), same
    // definition as layout-check.js: own text or an <img>. Exclude
    // anything inside (or equal to) a logo's own unit wrapper, using a
    // live DOM contains() check — only possible here, inside the
    // browser context, before these elements get serialized away.
    const allEls = Array.from(document.body.querySelectorAll("*"));
    const others = [];
    for (const el of allEls) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;
      const ownText = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join("")
        .trim();
      const isImg = el.tagName === "IMG";
      if (!ownText && !isImg) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const insideSomeLogoUnit = logoEls.some((unitEl) => unitEl.contains(el));
      if (insideSomeLogoUnit) continue;
      others.push({ tag: el.tagName, text: ownText.slice(0, 30), rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom } });
    }

    // Also flag any text node whose content looks like a recreated wordmark.
    const bodyText = document.body.innerText || "";
    const suspiciousWordmark = /STRATEGIC\s+HOME\s+LOANS/i.test(bodyText);

    const resultLogos = logos.map(({ _unitIndex, ...rest }) => rest);

    return { pageRect: { width: pageRect.width, height: pageRect.height }, logos: resultLogos, others, suspiciousWordmark };
  });

  await browser.close();

  const issues = [];

  if (data.logos.length === 0) {
    if (noLogoExpected) {
      console.log(`\n${file}`);
      console.log("  No logo present — explicitly expected (--no-logo-expected passed). Skipping brand checks.");
      console.log("");
      process.exit(0);
    }
    issues.push({ severity: "fail", detail: "No <img> referencing assets/brand/logo/ found. If this flyer legitimately needs no logo, re-run with --no-logo-expected." });
    if (data.suspiciousWordmark) {
      issues.push({ severity: "fail", detail: 'Found the text "STRATEGIC HOME LOANS" in the page but no real logo image — this looks like a recreated wordmark instead of the official asset. Use the real file from assets/brand/logo/ instead.' });
    }
  } else {
    for (const logo of data.logos) {
      const trueRatio = logoRatios[logo.filename];
      if (trueRatio) {
        const renderedRatio = logo.rect.width / logo.rect.height;
        const pctOff = Math.abs(renderedRatio - trueRatio) / trueRatio;
        if (pctOff > 0.01) {
          issues.push({
            severity: "fail",
            detail: `Logo "${logo.filename}" is rendered at ${logo.rect.width.toFixed(0)}x${logo.rect.height.toFixed(0)} (ratio ${renderedRatio.toFixed(3)}), but its true aspect ratio is ${trueRatio.toFixed(3)} — off by ${(pctOff * 100).toFixed(1)}%. It is being stretched or squashed; set only one CSS dimension and let the other scale automatically, or use object-fit: contain.`,
          });
        }
      }
      if (logo.filter && logo.filter !== "none") {
        issues.push({
          severity: "warn",
          detail: `Logo "${logo.filename}" has CSS filter "${logo.filter}" applied (likely a dark-background reversal via brightness/invert). This is a derived white version, not an authorized reversed logo asset — acceptable as a documented stopgap, but Cameron should confirm this matches the brand guideline before it's used client-facing.`,
        });
      }
      // Clear space: margin = 0.25x logo's own rendered height, no other
      // element's box may intrude into that margin.
      const margin = logo.rect.height * 0.25;
      const zone = {
        x: logo.rect.x - margin,
        y: logo.rect.y - margin,
        right: logo.rect.right + margin,
        bottom: logo.rect.bottom + margin,
      };
      for (const o of data.others) {
        const ix = Math.max(0, Math.min(zone.right, o.rect.right) - Math.max(zone.x, o.rect.x));
        const iy = Math.max(0, Math.min(zone.bottom, o.rect.bottom) - Math.max(zone.y, o.rect.y));
        if (ix <= 0 || iy <= 0) continue;
        // Skip if it's the logo intersecting itself or fully contained within the logo's own box (e.g. no-op).
        const isSelf = o.rect.x === logo.rect.x && o.rect.y === logo.rect.y && o.rect.width === logo.rect.width;
        if (isSelf) continue;
        issues.push({
          severity: "warn",
          detail: `<${o.tag.toLowerCase()}> "${o.text}" intrudes into the logo's clear-space margin (${Math.round(margin)}px around "${logo.filename}").`,
        });
      }
    }
  }

  console.log(`\n${file}  (${data.pageRect.width}x${data.pageRect.height})`);
  if (issues.length === 0) {
    console.log(`  OK — ${data.logos.length} real logo asset(s) found, proportions and clear space look correct.`);
  }
  const fails = issues.filter((i) => i.severity === "fail");
  const warns = issues.filter((i) => i.severity === "warn");
  for (const i of fails) console.log(`  FAIL [brand]: ${i.detail}`);
  for (const i of warns) console.log(`  WARN [brand]: ${i.detail}`);
  console.log("");

  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
