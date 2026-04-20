#!/usr/bin/env node
/**
 * BugBountyPro v2.0 — Setup Helper
 *
 * Run once after cloning:
 *   npm run setup
 *
 * What it does:
 *   1. Creates .env from .env.example if .env doesn't exist yet
 *   2. Checks whether ANTHROPIC_API_KEY is already set
 *   3. Prints clear next-step instructions
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENV_EXAMPLE = path.join(ROOT, ".env.example");
const ENV_FILE = path.join(ROOT, ".env");

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

console.log("");
console.log(green("╔══════════════════════════════════════════════╗"));
console.log(green("║      BugBountyPro v2.0 — Setup              ║"));
console.log(green("╚══════════════════════════════════════════════╝"));
console.log("");

// ── Step 1: Create .env ───────────────────────────────────────────────────────

if (fs.existsSync(ENV_FILE)) {
  console.log(green("✔") + "  .env already exists — skipping copy");
} else if (fs.existsSync(ENV_EXAMPLE)) {
  fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
  console.log(green("✔") + "  Created .env from .env.example");
} else {
  // Create a minimal .env if .env.example is somehow missing
  fs.writeFileSync(
    ENV_FILE,
    "# Anthropic API key — get yours at https://console.anthropic.com\nANTHROPIC_API_KEY=sk-ant-...\n"
  );
  console.log(yellow("⚠") + "  .env.example not found — created a minimal .env");
}

// ── Step 2: Check for API key ─────────────────────────────────────────────────

// Re-read the .env file so we can detect if the user filled it in already
let envContent = "";
try {
  envContent = fs.readFileSync(ENV_FILE, "utf8");
} catch {
  // ignore
}

const keySetInProcess =
  process.env.ANTHROPIC_API_KEY &&
  /^sk-ant-[^\s.]{4}/.test(process.env.ANTHROPIC_API_KEY);

const keySetInFile = /^ANTHROPIC_API_KEY=sk-ant-[^\s.]{4}/m.test(envContent);

const keyReady = keySetInProcess || keySetInFile;

// ── Step 3: Print next steps ──────────────────────────────────────────────────

console.log("");

if (keyReady) {
  console.log(green("✔") + "  ANTHROPIC_API_KEY looks good");
  console.log("");
  console.log(bold("You're all set! Start the agent:"));
  console.log("");
  console.log("  " + cyan("npm start"));
  console.log("");
  console.log(dim("Optional — verify the API connection first:"));
  console.log("  " + dim("npm run deploy:claude"));
} else {
  console.log(yellow("!") + "  ANTHROPIC_API_KEY is not set yet");
  console.log("");
  console.log(bold("Next steps:"));
  console.log("");
  console.log(
    "  1. Open " +
      cyan(".env") +
      " and replace " +
      yellow("sk-ant-...") +
      " with your real key"
  );
  console.log(
    "     Get a key at: " + cyan("https://console.anthropic.com/settings/api-keys")
  );
  console.log("");
  console.log("  2. Start the agent:");
  console.log("     " + cyan("npm start"));
  console.log("");
  console.log(dim("Alternative — set the key inline without editing .env:"));
  console.log(
    dim('     ANTHROPIC_API_KEY="sk-ant-..." npm start')
  );
}

console.log("");
