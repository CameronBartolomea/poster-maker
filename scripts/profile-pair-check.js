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

function checkFile(filePath, ownerId, otherId) {
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
    if (!html.includes(value)) {
      issues.push(`FAIL: ${filePath} is missing ${ownerId}'s ${label} ("${value}") — expected it to be present.`);
    }
  }
  const ownerQrFile = owner.qr.split("/").pop();
  if (!html.includes(ownerQrFile)) {
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

function main() {
  const [fileA, fileB] = process.argv.slice(2);
  if (!fileA || !fileB) {
    console.error("Usage: node scripts/profile-pair-check.js <cameron-file.html> <robert-file.html>");
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
    issues = issues.concat(checkFile(fileA, "cameron", "robert"));
    issues = issues.concat(checkFile(fileB, "robert", "cameron"));
  } else if (aIsRobert) {
    issues = issues.concat(checkFile(fileA, "robert", "cameron"));
    issues = issues.concat(checkFile(fileB, "cameron", "robert"));
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
