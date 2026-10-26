// Single loader for data/people.json — every script that needs Cameron's
// or Robert's verified contact/licensing info should go through this
// module, not hardcode values inline. That is the actual mechanism behind
// the "two separate verified profiles, built into the architecture" rule:
// a flyer template references {{person.field}} placeholders and gets its
// values from here, so there is no hand-maintained duplicate copy of
// either person's info anywhere that could drift or get crossed.
//
// Usage:
//   const { getProfile, getCompany, listProfileIds } = require("./profiles");
//   const cameron = getProfile("cameron");

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "people.json");

function loadRaw() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`Profile data file not found: ${DATA_PATH}`);
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function listProfileIds() {
  return Object.keys(loadRaw().profiles);
}

function getProfile(id) {
  const data = loadRaw();
  const p = data.profiles[id];
  if (!p) {
    throw new Error(`Unknown profile id "${id}". Known profiles: ${Object.keys(data.profiles).join(", ")}`);
  }
  return p;
}

function getCompany() {
  return loadRaw().company;
}

function getAll() {
  return loadRaw();
}

module.exports = { getProfile, getCompany, getAll, listProfileIds, DATA_PATH };
