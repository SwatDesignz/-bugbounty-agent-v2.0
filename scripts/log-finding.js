#!/usr/bin/env node
/**
 * vuln:log — Log a vulnerability finding from the command line.
 *
 * Usage:
 *   npm run vuln:log -- '{"title":"IDOR","severity":"high","scope":"api.example.com"}'
 *   node scripts/log-finding.js '{"title":"XSS","severity":"medium","status":"confirmed"}'
 */

const { logFinding } = require("../evidence");

const arg = process.argv.slice(2).join(" ").trim();

if (!arg) {
  console.error(
    "Usage: npm run vuln:log -- " +
      '\'{"title":"...","severity":"high|medium|low|critical|info",' +
      '"scope":"...","evidence":"...","status":"confirmed|likely|potential|informational|unconfirmed"}\''
  );
  process.exit(1);
}

let record;
try {
  record = JSON.parse(arg);
} catch (e) {
  console.error(`Error: invalid JSON — ${e.message}`);
  process.exit(1);
}

try {
  const { filename, entry } = logFinding(record);
  console.log(`Finding recorded: ${filename}`);
  console.log(JSON.stringify(entry, null, 2));
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}
