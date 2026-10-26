#!/usr/bin/env node
//
// Usage: node scripts/render-person-flyer.js <template.html> --person <cameron|robert> --out <posters/output.html>
//
// This is the actual mechanism behind Cameron's standing rule: "Build
// this directly into the generation architecture using separate
// verified profiles and a reusable template system. Do not rely on
// remembering this instruction from our conversation." A person-branded
// flyer is never hand-written twice (once "for Cameron," once "for
// Robert") — it is written ONCE as a template with {{person.field}} /
// {{company.field}} placeholders, and this script substitutes verified
// values from data/people.json (via scripts/profiles.js) for whichever
// person is requested. Both outputs are generated from the identical
// template source and the identical substitution code path, so there is
// no hand-maintained duplicate where a value could be typed wrong or
// left over from the other person.
//
// Token syntax: {{person.full_name}}, {{person.title}}, {{person.nmls}},
// {{person.dre}}, {{person.cell}}, {{person.office}}, {{person.email}},
// {{person.qr}}, {{person.headshot.<variant>}}, {{company.legal_name}},
// {{company.nmls}}, {{company.dre}}, {{company.office_address}},
// {{company.web}}, {{company.main_line}}.
//
// Any token value that is an asset path (starts with "assets/") is
// automatically rewritten to "../assets/..." since rendered output
// lives in posters/. Template authors just write the bare data-relative
// path form of the token; this script handles the "../" prefix.
//
// Refuses to write output if ANY {{...}} token remains unresolved
// after substitution — a typo'd token fails loudly instead of shipping
// literal "{{...}}" text onto a flyer.

const fs = require("fs");
const path = require("path");
const { getProfile, getCompany } = require("./profiles");

function flagArg(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function main() {
  const args = process.argv.slice(2);
  const templatePath = args[0];
  const personId = flagArg(args, "--person");
  const outPath = flagArg(args, "--out");

  if (!templatePath || !personId || !outPath) {
    console.error("Usage: node scripts/render-person-flyer.js <template.html> --person <cameron|robert> --out <posters/output.html>");
    process.exit(1);
  }
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    process.exit(1);
  }

  const person = getProfile(personId); // throws on unknown id — fails loudly, not silently
  const company = getCompany();
  const context = { person, company };

  let html = fs.readFileSync(templatePath, "utf-8");

  const tokenRe = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
  const missing = [];
  html = html.replace(tokenRe, (full, dotted) => {
    let value = getByPath(context, dotted);
    if (value === undefined || value === null) {
      missing.push(dotted);
      return full; // leave unresolved so the post-check below catches it
    }
    if (typeof value === "object") {
      missing.push(`${dotted} (resolved to an object, not a leaf value — did you mean a more specific path?)`);
      return full;
    }
    value = String(value);
    if (value.startsWith("assets/")) {
      value = "../" + value; // posters/ -> assets/ relative path
    }
    return value;
  });

  if (missing.length > 0) {
    console.error(`Refusing to write ${outPath} — unresolved template token(s): ${missing.join(", ")}`);
    process.exit(1);
  }

  // Belt-and-suspenders: confirm nothing that looks like an unresolved
  // token survived (catches a token syntax the regex above didn't match,
  // e.g. a typo like "{{ person.nmls }" with a missing brace).
  if (/\{\{[^}]*\}\}/.test(html) === false && /\{\{|\}\}/.test(html)) {
    console.error(`Refusing to write ${outPath} — found a stray "{{" or "}}" that doesn't look like a complete, valid token. Check the template for a typo.`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`Rendered ${outPath} for ${person.full_name} (${personId}) from ${templatePath}`);
}

main();
