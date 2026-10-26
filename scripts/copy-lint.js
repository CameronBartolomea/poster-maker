#!/usr/bin/env node
//
// Usage: node scripts/copy-lint.js [posters/specific-file.html]
//
// Mechanical copy linter per design-system/copywriting-guide.md. Catches
// what's checkable by pattern matching: em/en dashes in prose, banned
// clichés, excessive exclamation points, emoji. Does NOT and cannot judge
// tone, voice, or whether copy "sounds AI-generated" beyond these
// mechanical signals — that's a human read, see the guide.

const fs = require("fs");
const path = require("path");

const POSTERS_DIR = "posters";

const BANNED_PHRASES = [
  "unlock your potential",
  "navigate today's market",
  "navigate the market",
  "your trusted partner",
  "your journey starts here",
  "take the next step",
  "turn your dreams into reality",
  "look no further",
  "in today's world",
  "in today's fast-paced",
  "game changer",
  "game-changer",
  "seamless experience",
  "best-in-class",
  "world-class",
  "cutting-edge",
  "state-of-the-art",
  "unparalleled",
  "exceptional service",
  "dream home awaits",
  "whether you're",
  "at the end of the day",
];

// Matches emoji ranges broadly.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function extractVisibleText(html) {
  // Only the <body> is actually visible on the rendered flyer — <title>
  // and other <head> content never appear on the page itself.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let text = bodyMatch ? bodyMatch[1] : html;
  // Strip <style>/<script> blocks, then strip tags, decode a few common entities.
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·");
  return text;
}

function checkFile(filePath) {
  const html = fs.readFileSync(filePath, "utf-8");
  const text = extractVisibleText(html);
  const issues = [];

  // Em dash / en dash — either as literal unicode chars or raw entities
  // left unescaped in source.
  const dashMatches = text.match(/[—–]/g);
  if (dashMatches) {
    issues.push(
      `Found ${dashMatches.length} em/en dash character(s) in visible text. Rewrite with a period, comma, or "instead of" construction.`
    );
  }

  const lowerText = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase)) {
      issues.push(`Banned cliche found: "${phrase}"`);
    }
  }

  const exclaims = (text.match(/!/g) || []).length;
  if (exclaims > 1) {
    issues.push(`${exclaims} exclamation points found — default to zero, one at most if it earns its place.`);
  }

  if (EMOJI_RE.test(text)) {
    issues.push("Emoji found in visible text — not allowed unless explicitly requested for this piece.");
  }

  return issues;
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
    const issues = checkFile(file);
    console.log(`\n${file}`);
    if (issues.length === 0) {
      console.log("  OK — no mechanical copy issues found.");
    }
    for (const i of issues) {
      console.log(`  FLAG: ${i}`);
      anyIssues = true;
    }
  }

  console.log("");
  process.exit(anyIssues ? 1 : 0);
}

main();
