#!/usr/bin/env node
//
// Simple audit trail for SHL flyers — a record of what was created, when,
// its compliance-check result, and whether/when Cameron approved it for
// use. Nothing in this repo is ever sent or published on its own; this log
// is just the paper trail for what was drafted and what got the go-ahead.
//
// Usage:
//   node scripts/audit-log.js add <posters/file.html> --type <type> [--note "..."]
//   node scripts/audit-log.js approve <posters/file.html> --by "<name>" [--note "..."]
//   node scripts/audit-log.js list [--file <posters/file.html>]
//
// Log lives at audit/flyer-log.json (array, newest entries appended).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const LOG_PATH = path.join("audit", "flyer-log.json");

function loadLog() {
  fs.mkdirSync("audit", { recursive: true });
  if (!fs.existsSync(LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
}

function saveLog(entries) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(entries, null, 2) + "\n");
}

function fileHash(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

function flagArg(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

function runComplianceCheck(filePath) {
  try {
    execSync(`node scripts/compliance-check.js ${filePath}`, { stdio: "pipe" });
    return "pass";
  } catch (e) {
    const out = e.stdout ? e.stdout.toString() : "";
    return out.includes("WARN") && !out.includes("FAIL") ? "warn" : "fail";
  }
}

function cmdAdd(args) {
  const file = args[0];
  if (!file || !fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }
  const type = flagArg(args, "--type") || "unspecified";
  const note = flagArg(args, "--note") || "";
  const complianceResult = runComplianceCheck(file);

  const entries = loadLog();
  const entry = {
    id: entries.length + 1,
    file,
    type,
    content_hash: fileHash(file),
    created_at: new Date().toISOString(),
    status: "draft",
    compliance_check: complianceResult,
    approved_by: null,
    approved_at: null,
    note,
  };
  entries.push(entry);
  saveLog(entries);
  console.log(`Logged entry #${entry.id} for ${file} — status: draft, compliance: ${complianceResult}`);
}

function cmdApprove(args) {
  const file = args[0];
  const by = flagArg(args, "--by");
  const note = flagArg(args, "--note") || "";
  if (!file || !by) {
    console.error('Usage: node scripts/audit-log.js approve <file> --by "<name>" [--note "..."]');
    process.exit(1);
  }
  const entries = loadLog();
  // find latest entry for this file + current content hash
  const hash = fileHash(file);
  const candidates = entries.filter((e) => e.file === file);
  if (candidates.length === 0) {
    console.error(`No log entry for ${file} yet — run "add" first.`);
    process.exit(1);
  }
  const latest = candidates[candidates.length - 1];
  if (latest.content_hash !== hash) {
    console.error(
      `File has changed since it was logged (hash mismatch). Run "add" again to log the current version before approving.`
    );
    process.exit(1);
  }
  latest.status = "approved";
  latest.approved_by = by;
  latest.approved_at = new Date().toISOString();
  if (note) latest.note = (latest.note ? latest.note + " | " : "") + note;
  saveLog(entries);
  console.log(`Entry #${latest.id} for ${file} marked approved by ${by}.`);
}

function cmdList(args) {
  const file = flagArg(args, "--file");
  const entries = loadLog().filter((e) => !file || e.file === file);
  if (entries.length === 0) {
    console.log("No audit log entries.");
    return;
  }
  for (const e of entries) {
    console.log(
      `#${e.id}  ${e.file}  [${e.type}]  ${e.status.toUpperCase()}  compliance:${e.compliance_check}  created:${e.created_at}${
        e.approved_by ? `  approved_by:${e.approved_by}@${e.approved_at}` : ""
      }`
    );
    if (e.note) console.log(`     note: ${e.note}`);
  }
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "add") return cmdAdd(rest);
  if (cmd === "approve") return cmdApprove(rest);
  if (cmd === "list") return cmdList(rest);
  console.error("Usage: node scripts/audit-log.js <add|approve|list> ...");
  process.exit(1);
}

main();
