#!/usr/bin/env node
//
// Usage: node scripts/profile-pair-check.js <cameron-file.html> <robert-file.html>
//
// Cameron's instruction: "Validate that names, emails, phone numbers,
// NMLS numbers, DRE numbers, headshots, and QR codes never get mixed
// between profiles." This is that validation, run on an actual rendered
// PAIR of outputs (not just the source data) — it checks the real,
// final HTML that would be printed, not just data/people.json.
//
// For each of the two files, it checks:
//   - the OWNER's name, NMLS, DRE, email, cell, and QR filename are
//     present
//   - the OTHER person's name, NMLS, DRE, email, cell, and QR filename
//     are NOT present anywhere in the file
//   - no headshot path from the other person's profile appears

const fs = require("fs");
const { getProfile } = require("./profiles");

function checkFile(filePath, ownerId, otherId, expectedOwnerFields) {
  const html = fs.readFileSync(filePath, "utf-8");
  const owner = getProfile(ownerId);
  const other = getProfile(otherId);
  const issues = [];

  const ownerFields = {
    "full name": owner.full_name,
    "NMLS": owner.nmls,
    "DRE": owner.dre,
    "email": owner.email,
    "cell": owner.cell,
  };
  for (const [label, value] of Object.entries(ownerFields)) {
    if (!expectedOwnerFields.has(label)) continue; // not expected on this piece — e.g. a front side that intentionally carries only name/NMLS and points to the back for full contact
    if (!html.includes(value)) {
      issues.push(`FAIL: ${filePath} is missing ${ownerId}'s ${label} ("${value}") — expected it to be present.`);
    }
  }
  const ownerQrFile = owner.qr.split("/").pop();
  if (expectedOwnerFields.has("QR") && !html.includes(ownerQrFile)) {
    issues.push(`FAIL: ${filePath} does not reference ${ownerId}'s QR code ("${ownerQrFile}").`);
  }

  const otherFields = {
    "full name": other.full_name,
    "NMLS": other.nmls,
    "DRE": other.dre,
    "email": other.email,
    "cell": other.cell,
  };
  for (const [label, value] of Object.entries(otherFields)) {
    if (html.includes(value)) {
      issues.push(`FAIL: ${filePath} (built for ${ownerId}) contains ${otherId}'s ${label} ("${value}") — cross-contamination between profiles.`);
    }
  }
  const otherQrFile = other.qr.split("/").pop();
  if (html.includes(otherQrFile)) {
    issues.push(`FAIL: ${filePath} (built for ${ownerId}) references ${otherId}'s QR code ("${otherQrFile}") — wrong QR code.`);
  }
  for (const [variant, relPath] of Object.entries(other.headshot || {})) {
    const fname = relPath.split("/").pop();
    if (html.includes(fname)) {
      issues.push(`FAIL: ${filePath} (built for ${ownerId}) references ${otherId}'s headshot ("${fname}") — wrong headshot.`);
    }
  }

  return issues;
}

const ALL_OWNER_FIELDS = new Set(["full name", "NMLS", "DRE", "email", "cell", "QR"]);

function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const ownerFieldsArg = process.argv.find((a) => a.startsWith("--owner-fields="));
  // Which of the owner's own fields this piece is expected to carry.
  // Defaults to all of them (the normal case: a single-sided flyer that
  // stands alone). Pass --owner-fields="full name,NMLS" for a piece
  // that intentionally carries only some fields by design (e.g. the
  // front of a two-sided print piece whose back carries full contact)
  // — the cross-contamination check (the other person's fields must
  // NEVER appear) still runs unconditionally either way.
  const expectedOwnerFields = ownerFieldsArg
    ? new Set(ownerFieldsArg.slice("--owner-fields=".length).split(",").map((s) => s.trim()))
    : ALL_OWNER_FIELDS;

  const [fileA, fileB] = args;
  if (!fileA || !fileB) {
    console.error('Usage: node scripts/profile-pair-check.js <cameron-file.html> <robert-file.html> [--owner-fields="full name,NMLS,DRE,email,cell,QR"]');
    process.exit(1);
  }
  if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
    console.error("Both files must exist.");
    process.exit(1);
  }

  // Figure out which file belongs to which person by checking which
  // name appears, rather than assuming file order.
  const htmlA = fs.readFileSync(fileA, "utf-8");
  const cameron = getProfile("cameron");
  const robert = getProfile("robert");
  const aIsCameron = htmlA.includes(cameron.full_name) && !htmlA.includes(robert.full_name);
  const aIsRobert = htmlA.includes(robert.full_name) && !htmlA.includes(cameron.full_name);

  let issues = [];
  if (aIsCameron) {
    issues = issues.concat(checkFile(fileA, "cameron", "robert", expectedOwnerFields));
    issues = issues.concat(checkFile(fileB, "robert", "cameron", expectedOwnerFields));
  } else if (aIsRobert) {
    issues = issues.concat(checkFile(fileA, "robert", "cameron", expectedOwnerFields));
    issues = issues.concat(checkFile(fileB, "cameron", "robert", expectedOwnerFields));
  } else {
    issues.push(`Could not determine which file belongs to which person from name content alone (${fileA} contains cameron=${htmlA.includes(cameron.full_name)}, robert=${htmlA.includes(robert.full_name)}).`);
  }

  console.log(`\nProfile pair check: ${fileA}  <->  ${fileB}`);
  if (issues.length === 0) {
    console.log("  OK — each file carries only its own owner's contact info, licensing numbers, QR code, and headshot. No cross-contamination.");
  } else {
    for (const i of issues) console.log(`  ${i}`);
  }
  console.log("");
  process.exit(issues.length > 0 ? 1 : 0);
}

main();
