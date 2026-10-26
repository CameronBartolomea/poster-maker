#!/usr/bin/env node
//
// Audit trail for SHL flyers: what was drafted, every automated QA
// result for it, and whether/when Cameron approved it. Nothing in this
// repo is ever sent or published on its own — this is the paper trail
// for what was drafted and what got an explicit go-ahead.
//
// Usage:
//   node scripts/audit-log.js add <posters/file.html> --type <type>
//       [--note "..."] [--variants "concept A; concept B; concept C"]
//       [--evaluation "why this one was chosen"]
//       [--layout-family "split-stack|icon-rail|timeline|stacked-editorial|..."]
//
// --layout-family is how layout-family diversity gets enforced with
// actual teeth instead of just a line in components.md: "add" checks it
// against the most recent APPROVED entry of the same --type and prints
// a visible warning (not a block — see compliance-check.js precedent of
// flagging, not certifying) if the new flyer reuses the same family as
// the last approved one of that type. See critique-v1-realtor-flyer.md
// finding #2 ("the system only had one layout family") for why this
// exists.
//   node scripts/audit-log.js approve <posters/file.html> --by "<name>" [--note "..."]
//   node scripts/audit-log.js list [--file <posters/file.html>]
//   node scripts/audit-log.js report [--file <posters/file.html>]   (human-readable QA report, latest entry)
//
// Log lives at audit/flyer-log.json (array, newest entries appended).
// "add" runs compliance-check, copy-lint, and layout-check and records
// every result — it does not hand-wave a pass.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

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

function runCheck(script, file) {
  try {
    const out = execFileSync("node", [script, file], { encoding: "utf-8" });
    return { status: "pass", output: out.trim() };
  } catch (e) {
    const out = (e.stdout || "").toString();
    const hasFail = /FAIL/.test(out);
    return { status: hasFail ? "fail" : "warn", output: out.trim() };
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
  const variants = flagArg(args, "--variants") || null;
  const evaluation = flagArg(args, "--evaluation") || null;
  const layoutFamily = flagArg(args, "--layout-family") || null;

  console.log(`Running QA checks on ${file}...`);
  const compliance = runCheck("scripts/compliance-check.js", file);
  const copy = runCheck("scripts/copy-lint.js", file);
  const layout = runCheck("scripts/layout-check.js", file);

  const entries = loadLog();
  const entry = {
    id: entries.length + 1,
    file,
    type,
    content_hash: fileHash(file),
    created_at: new Date().toISOString(),
    status: "draft",
    qa: {
      compliance: compliance.status,
      copy: copy.status,
      layout: layout.status,
    },
    qa_detail: {
      compliance: compliance.output,
      copy: copy.output,
      layout: layout.output,
    },
    creative_variants_considered: variants ? variants.split(";").map((s) => s.trim()) : null,
    evaluation_notes: evaluation,
    layout_family: layoutFamily,
    visual_review: "pending_human_review", // automated checks never certify this
    approved_by: null,
    approved_at: null,
    note,
  };
  entries.push(entry);
  saveLog(entries);

  console.log(`\nLogged entry #${entry.id} for ${file}`);
  console.log(`  compliance: ${compliance.status}  |  copy: ${copy.status}  |  layout: ${layout.status}`);
  console.log(`  visual_review: pending_human_review (automated checks cannot certify this — look at the screenshot)`);
  if (compliance.status === "fail" || copy.status === "fail" || layout.status === "fail") {
    console.log(`\n  At least one check FAILED. Fix before requesting approval. Run with --file to see full detail via "report".`);
  }

  if (layoutFamily) {
    const sameType = entries
      .filter((e) => e.type === type && e.file !== file && e.layout_family)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastApprovedSameType = sameType.find((e) => e.status === "approved");
    const reused = lastApprovedSameType && lastApprovedSameType.layout_family === layoutFamily;
    if (reused) {
      console.log(
        `\n  LAYOUT-FAMILY WARNING: this flyer reuses the "${layoutFamily}" layout family, same as the most ` +
        `recently approved "${type}" flyer (${lastApprovedSameType.file}, approved ${lastApprovedSameType.approved_at}). ` +
        `Not a block — some flyer types legitimately want a consistent family — but confirm this is a deliberate ` +
        `choice, not a default fallback to the one layout that's easiest to reuse.`
      );
    }
  } else {
    console.log(`\n  Note: no --layout-family recorded for this entry. Pass one so family-diversity gets tracked across "${type}" flyers.`);
  }
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
  const hash = fileHash(file);
  const candidates = entries.filter((e) => e.file === file);
  if (candidates.length === 0) {
    console.error(`No log entry for ${file} yet — run "add" first.`);
    process.exit(1);
  }
  const latest = candidates[candidates.length - 1];
  if (latest.content_hash !== hash) {
    console.error(`File has changed since it was logged (hash mismatch). Run "add" again before approving.`);
    process.exit(1);
  }
  if (latest.qa && (latest.qa.compliance === "fail" || latest.qa.copy === "fail" || latest.qa.layout === "fail")) {
    console.error(`Refusing to approve: this entry has a FAILED automated check (compliance:${latest.qa.compliance} copy:${latest.qa.copy} layout:${latest.qa.layout}). Fix and re-run "add" first.`);
    process.exit(1);
  }
  latest.status = "approved";
  latest.visual_review = "reviewed_ok";
  latest.approved_by = by;
  latest.approved_at = new Date().toISOString();
  if (note) latest.note = (latest.note ? latest.note + " | " : "") + note;
  saveLog(entries);

  // Lock in the approved render as the visual regression baseline —
  // approval means "this is now correct," so always refresh the baseline
  // to match, not just fill it in if missing.
  try {
    execFileSync("node", ["scripts/save-baseline.js", file], { encoding: "utf-8" });
    console.log(`Baseline updated to this approved render.`);
  } catch (e) {
    console.log(`Warning: could not update visual baseline (${e.message.split("\n")[0]}).`);
  }

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
    const qa = e.qa ? `compliance:${e.qa.compliance} copy:${e.qa.copy} layout:${e.qa.layout}` : `compliance:${e.compliance_check || "n/a"}`;
    console.log(
      `#${e.id}  ${e.file}  [${e.type}]  ${e.status.toUpperCase()}  ${qa}  visual:${e.visual_review || "n/a"}  created:${e.created_at}${
        e.approved_by ? `  approved_by:${e.approved_by}@${e.approved_at}` : ""
      }`
    );
    if (e.note) console.log(`     note: ${e.note}`);
  }
}

function cmdReport(args) {
  const file = flagArg(args, "--file") || args[0];
  const entries = loadLog().filter((e) => !file || e.file === file);
  if (entries.length === 0) {
    console.log("No audit log entries.");
    return;
  }
  const e = entries[entries.length - 1];
  console.log(`\n=== QA Report: ${e.file} (entry #${e.id}) ===`);
  console.log(`Type: ${e.type}`);
  console.log(`Status: ${e.status}`);
  console.log(`Created: ${e.created_at}`);
  if (e.approved_by) console.log(`Approved by: ${e.approved_by} at ${e.approved_at}`);
  console.log(`\n--- Compliance check (${e.qa?.compliance}) ---\n${e.qa_detail?.compliance || "n/a"}`);
  console.log(`\n--- Copy lint (${e.qa?.copy}) ---\n${e.qa_detail?.copy || "n/a"}`);
  console.log(`\n--- Layout check (${e.qa?.layout}) ---\n${e.qa_detail?.layout || "n/a"}`);
  console.log(`\n--- Visual review ---\n${e.visual_review} (automated tooling cannot certify design quality or legal compliance — a human/AI reviewer must look at the actual rendered page)`);
  if (e.creative_variants_considered) {
    console.log(`\n--- Creative variants considered ---`);
    for (const v of e.creative_variants_considered) console.log(`  - ${v}`);
    console.log(`Evaluation: ${e.evaluation_notes || "(none recorded)"}`);
  }
  console.log("");
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "add") return cmdAdd(rest);
  if (cmd === "approve") return cmdApprove(rest);
  if (cmd === "list") return cmdList(rest);
  if (cmd === "report") return cmdReport(rest);
  console.error("Usage: node scripts/audit-log.js <add|approve|list|report> ...");
  process.exit(1);
}

main();
