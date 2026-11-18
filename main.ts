// news-image-20261118 — reproduce the finished front page.
// The finished image ships in this directory as entry.png (1024x1024).
// This program copies it, byte for byte, to the output directory.
// No network, no clock, no randomness: every run writes identical bytes.
// Checks before finishing: the file must start with the JPEG magic bytes
// (FF D8 FF) and end with the JPEG end marker (FF D9), must be at most
// 256 KiB, and the copy's SHA-256 must match the source exactly.

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const baseDir = __dirname;
const inputFile = path.join(baseDir, "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outputFile = path.join(outputDir, "entry.png");
const SIZE_LIMIT = 256 * 1024;

function hashOf(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

const bytes = fs.readFileSync(inputFile);
if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
  throw new Error("source is not a JPEG: missing FF D8 FF header");
}
if (bytes.length > SIZE_LIMIT) {
  throw new Error("source exceeds 256 KiB: " + bytes.length + " bytes");
}
if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
  throw new Error("source is not a complete JPEG: missing FF D9 end marker");
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, bytes);

const sourceHash = hashOf(inputFile);
const outputHash = hashOf(outputFile);
if (sourceHash !== outputHash) {
  throw new Error("integrity check failed: output differs from entry.png");
}

console.log("wrote " + outputFile + " (" + bytes.length + " bytes, sha256 " + outputHash + ")");
