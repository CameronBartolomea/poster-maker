#!/usr/bin/env node
//
// Usage: node scripts/make-qr.js "<data or URL>" <output-name> [--color #c72108] [--size 600]
//
// Generates a QR code PNG into assets/brand/qr/<output-name>.png
// Use this for anything that isn't Cameron's or Robert's static vCard QR
// (those already exist) — a property listing link, an application link,
// a specific landing page, etc.

const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

async function main() {
  const args = process.argv.slice(2);
  const data = args[0];
  const name = args[1];
  const colorIdx = args.indexOf("--color");
  const sizeIdx = args.indexOf("--size");
  const color = colorIdx !== -1 ? args[colorIdx + 1] : "#262626";
  const size = sizeIdx !== -1 ? parseInt(args[sizeIdx + 1], 10) : 600;

  if (!data || !name) {
    console.error('Usage: node scripts/make-qr.js "<data or URL>" <output-name> [--color #c72108] [--size 600]');
    process.exit(1);
  }

  const outDir = path.join("assets", "brand", "qr");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${name}.png`);

  await QRCode.toFile(outPath, data, {
    width: size,
    margin: 2,
    color: {
      dark: color,
      light: "#FFFFFFFF",
    },
  });

  console.log(`QR saved: ${outPath}`);
  console.log(`Encodes: ${data}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
