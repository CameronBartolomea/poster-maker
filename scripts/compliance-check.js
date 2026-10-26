#!/usr/bin/env node
//
// Usage: node scripts/compliance-check.js [posters/specific-file.html]
//
// Lightweight compliance linter for mortgage marketing flyers. Not legal
// advice and not a substitute for review — it just catches the common,
// mechanical misses before a flyer goes out:
//
//   1. Missing NMLS number(s) somewhere on the flyer
//   2. Missing Equal Housing Opportunity badge reference
//   3. Any rate/APR-looking number, which must be verified against that
//      day's actual rate sheet before this flyer is approved (never
//      estimated) — flagged, not blocked, since this script can't know
//      what the current rate sheet says
//
// Run this before adding a flyer to the audit log as "approved".

const fs = require("fs");
const path = require("path");

const POSTERS_DIR = "posters";

function checkFile(filePath) {
  const html = fs.readFileSync(filePath, "utf-8");
  const issues = [];
  const warnings = [];

  if (!/NMLS/i.test(html)) {
    issues.push("No NMLS number found anywhere on the flyer.");
  }

  if (!/equal-housing|equal housing/i.test(html)) {
    issues.push("No Equal Housing Opportunity badge/reference found.");
  }

  // Rate/APR-looking numbers: e.g. "6.25%", "6.250% APR"
  const rateMatches = html.match(/\b\d{1,2}\.\d{1,3}\s*%/g);
  if (rateMatches) {
    warnings.push(
      `Contains rate-looking number(s): ${rateMatches.join(", ")} — verify each against the current rate sheet before approving. Never approve an estimated/guessed rate.`
    );
  }

  return { issues, warnings };
}

function main() {
  const args = process.argv.slice(2);
  let files;

  if (args[0]) {
    files = [args[0]];
  } else {
    files = fs
      .readdirSync(POSTERS_DIR)
      .filter((f) => f.endsWith(".html"))
      .map((f) => path.join(POSTERS_DIR, f));
  }

  let anyIssues = false;

  for (const file of files) {
    const { issues, warnings } = checkFile(file);
    console.log(`\n${file}`);
    if (issues.length === 0 && warnings.length === 0) {
      console.log("  OK — no issues found.");
    }
    for (const i of issues) {
      console.log(`  FAIL: ${i}`);
      anyIssues = true;
    }
    for (const w of warnings) {
      console.log(`  WARN: ${w}`);
    }
  }

  console.log("");
  process.exit(anyIssues ? 1 : 0);
}

main();
