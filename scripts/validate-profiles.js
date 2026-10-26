#!/usr/bin/env node
//
// Usage: node scripts/validate-profiles.js
//
// Checks data/people.json (the machine-readable profile source every
// template-rendering script reads from) against two independent sources
// of truth, so the two can never silently drift apart:
//
//   1. design-system/business-rules.md — the human-readable NMLS/DRE
//      table and contact list Cameron confirmed. Every number in
//      people.json is compared against it digit-for-digit.
//   2. The actual filesystem — every headshot/QR path referenced in
//      people.json must exist on disk, so a render never silently
//      points at a missing asset.
//
// This does not verify the NUMBERS THEMSELVES are correct against any
// external record (NMLS Consumer Access, the DRE license lookup) — it
// verifies people.json agrees with the one in-repo document Cameron
// has already confirmed. If business-rules.md itself is ever wrong,
// this script will happily validate the wrong number — it catches
// drift between the two files, not real-world accuracy.

const fs = require("fs");
const path = require("path");
const { getAll } = require("./profiles");

const RULES_PATH = path.join(__dirname, "..", "design-system", "business-rules.md");

function digitsOnly(s) {
  return (s || "").replace(/\D/g, "");
}

function main() {
  const issues = [];
  const data = getAll();
  const rulesText = fs.existsSync(RULES_PATH) ? fs.readFileSync(RULES_PATH, "utf-8") : null;

  if (!rulesText) {
    console.error(`FAIL: ${RULES_PATH} not found — cannot cross-check people.json against it.`);
    process.exit(1);
  }

  // --- 1. NMLS/DRE table cross-check ---
  // Table rows look like: | Cameron Bartolomea | Mortgage Loan Officer | #2777999 | #02279518 |
  function findTableNmlsDre(nameMatch) {
    // A markdown table cell may contain an escaped pipe ("\|") that is
    // NOT a column boundary — e.g. "President \| Mortgage Consultant".
    // Match "any run of characters that aren't an unescaped pipe" for
    // the role cell instead of a plain [^|]*.
    const cell = `(?:\\\\.|[^|])*`;
    const rowRe = new RegExp(`\\|\\s*${nameMatch}${cell}\\|${cell}\\|\\s*#?(\\d+)\\s*\\|\\s*#?(\\d+)\\s*\\|`);
    const m = rulesText.match(rowRe);
    return m ? { nmls: m[1], dre: m[2] } : null;
  }

  const checks = [
    { label: "company", nameMatch: "Strategic Home Loans, Inc\\.", jsonNmls: data.company.nmls, jsonDre: data.company.dre },
    { label: "cameron", nameMatch: "Cameron Bartolomea", jsonNmls: data.profiles.cameron.nmls, jsonDre: data.profiles.cameron.dre },
    { label: "robert", nameMatch: "Robert Bartolomea", jsonNmls: data.profiles.robert.nmls, jsonDre: data.profiles.robert.dre },
  ];

  for (const c of checks) {
    const found = findTableNmlsDre(c.nameMatch);
    if (!found) {
      issues.push(`Could not find a business-rules.md table row for "${c.label}" to cross-check against.`);
      continue;
    }
    if (found.nmls !== digitsOnly(c.jsonNmls)) {
      issues.push(`${c.label}: NMLS mismatch — people.json has "${c.jsonNmls}", business-rules.md table has "${found.nmls}".`);
    }
    if (found.dre !== digitsOnly(c.jsonDre)) {
      issues.push(`${c.label}: DRE mismatch — people.json has "${c.jsonDre}", business-rules.md table has "${found.dre}".`);
    }
  }

  // --- 2. Contact line cross-check (cell + email) ---
  function checkContactLine(label, cell, email) {
    const cellDigits = digitsOnly(cell);
    if (!rulesText.includes(cellDigits.length === 10 ? formatPhoneForSearch(cellDigits) : cellDigits)) {
      // Fall back to a loose digit-sequence search across the whole text.
      const allDigitsText = digitsOnly(rulesText);
      if (!allDigitsText.includes(cellDigits)) {
        issues.push(`${label}: cell number "${cell}" (digits ${cellDigits}) not found anywhere in business-rules.md.`);
      }
    }
    if (!rulesText.includes(email)) {
      issues.push(`${label}: email "${email}" not found verbatim in business-rules.md.`);
    }
  }
  function formatPhoneForSearch(d) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }

  checkContactLine("cameron", data.profiles.cameron.cell, data.profiles.cameron.email);
  checkContactLine("robert", data.profiles.robert.cell, data.profiles.robert.email);

  if (!rulesText.includes(data.company.office_address)) {
    issues.push(`company: office_address "${data.company.office_address}" not found verbatim in business-rules.md.`);
  }
  if (!rulesText.includes(data.company.web)) {
    issues.push(`company: web "${data.company.web}" not found verbatim in business-rules.md.`);
  }

  // --- 3. Asset file existence ---
  const repoRoot = path.join(__dirname, "..");
  function checkAssetExists(label, relPath) {
    const full = path.join(repoRoot, relPath);
    if (!fs.existsSync(full)) {
      issues.push(`${label}: referenced asset does not exist on disk: ${relPath}`);
    }
  }
  for (const id of Object.keys(data.profiles)) {
    const p = data.profiles[id];
    checkAssetExists(`${id}.qr`, p.qr);
    for (const [variant, rel] of Object.entries(p.headshot || {})) {
      checkAssetExists(`${id}.headshot.${variant}`, rel);
    }
  }

  // --- 4. Cross-contamination sanity check within people.json itself ---
  // Cameron's own NMLS/DRE/email/cell must not equal Robert's, and vice
  // versa — guards against a copy-paste error inside people.json itself.
  const c = data.profiles.cameron;
  const r = data.profiles.robert;
  for (const field of ["nmls", "dre", "email", "cell", "full_name", "qr"]) {
    if (c[field] === r[field]) {
      issues.push(`cameron and robert have the IDENTICAL value for "${field}" ("${c[field]}") — this field must be unique per person. Likely a copy-paste error in people.json.`);
    }
  }

  console.log("\nProfile validation (data/people.json vs design-system/business-rules.md + filesystem)");
  if (issues.length === 0) {
    console.log("  OK — all NMLS/DRE numbers, contact info, and asset paths check out, and no fields are shared between Cameron and Robert.");
  } else {
    for (const i of issues) console.log(`  FAIL: ${i}`);
  }
  console.log("");
  process.exit(issues.length > 0 ? 1 : 0);
}

main();
