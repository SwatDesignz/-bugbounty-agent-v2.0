/**
 * BugBountyPro v2.0 — Evidence Recording
 *
 * Provides structured vulnerability finding storage.
 * All records are written as individual JSON files under ./evidence/.
 *
 * Usage (programmatic):
 *   const { logFinding, listFindings } = require('./evidence');
 *   logFinding({ title: 'Reflected XSS', severity: 'high', scope: 'app.example.com',
 *                evidence: 'param=<script>alert(1)</script> reflected unescaped', status: 'confirmed' });
 *
 * Usage (CLI script):
 *   npm run vuln:log
 */

const fs = require("fs");
const path = require("path");

const EVIDENCE_DIR = path.join(__dirname, "evidence");

const VALID_SEVERITIES = ["critical", "high", "medium", "low", "info"];
const VALID_STATUSES = ["confirmed", "likely", "potential", "informational", "unconfirmed"];

let _counter = 0;

// Dependency-injected directory so tests (and other callers) can redirect
// storage without reaching into module internals.
let _evidenceDir = EVIDENCE_DIR;

function setEvidenceDir(dir) {
  _evidenceDir = dir;
}

/**
 * Log a vulnerability finding to disk.
 *
 * @param {object} record
 * @param {string} record.title     - Short descriptive title (required)
 * @param {string} record.severity  - One of: critical, high, medium, low, info (required)
 * @param {string} [record.scope]   - In-scope asset (URL, domain, endpoint)
 * @param {string} [record.evidence]- Raw evidence (headers, parameters, responses)
 * @param {string} [record.status]  - One of: confirmed, likely, potential, informational, unconfirmed
 * @returns {{ filename: string, entry: object }}
 */
function logFinding(record) {
  if (!record || typeof record !== "object") {
    throw new Error("logFinding: record must be an object");
  }

  const { title, severity, scope, evidence, status } = record;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("logFinding: title is required and must be a non-empty string");
  }

  const normalizedSeverity = (severity || "").toLowerCase().trim();
  if (!VALID_SEVERITIES.includes(normalizedSeverity)) {
    throw new Error(
      `logFinding: severity must be one of: ${VALID_SEVERITIES.join(", ")}`
    );
  }

  const normalizedStatus = (status || "unconfirmed").toLowerCase().trim();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error(
      `logFinding: status must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  ensureEvidenceDir(_evidenceDir);

  const entry = {
    id: `finding-${Date.now()}-${++_counter}`,
    title: title.trim(),
    severity: normalizedSeverity,
    scope: (scope || "").trim(),
    evidence: (evidence || "").trim(),
    status: normalizedStatus,
    logged_at: new Date().toISOString(),
  };

  const filename = path.join(_evidenceDir, `${entry.id}.json`);
  fs.writeFileSync(filename, JSON.stringify(entry, null, 2));
  return { filename, entry };
}

/**
 * List all recorded findings, sorted by logged_at ascending.
 *
 * @returns {object[]}
 */
function listFindings() {
  if (!fs.existsSync(_evidenceDir)) {
    return [];
  }

  return fs
    .readdirSync(_evidenceDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(_evidenceDir, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.logged_at.localeCompare(b.logged_at));
}

function ensureEvidenceDir(dir = EVIDENCE_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resetEvidenceDir() {
  _evidenceDir = EVIDENCE_DIR;
  _counter = 0;
}

module.exports = {
  logFinding,
  listFindings,
  setEvidenceDir,
  resetEvidenceDir,
  EVIDENCE_DIR,
  VALID_SEVERITIES,
  VALID_STATUSES,
};
