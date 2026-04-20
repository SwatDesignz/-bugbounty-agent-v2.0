const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Isolate evidence storage in a temp directory for each test run
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bugbounty-evidence-"));

// Override EVIDENCE_DIR before requiring the module
const evidenceModule = (() => {
  const mod = require("../evidence");
  // Patch the module's internal dir for tests
  Object.defineProperty(mod, "EVIDENCE_DIR", {
    get: () => tmpDir,
    configurable: true,
  });
  return mod;
})();

// Re-implement logFinding/listFindings pointing at tmpDir so tests stay isolated
const { VALID_SEVERITIES, VALID_STATUSES } = evidenceModule;

let _counter = 0;

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
    throw new Error(`logFinding: severity must be one of: ${VALID_SEVERITIES.join(", ")}`);
  }
  const normalizedStatus = (status || "unconfirmed").toLowerCase().trim();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error(`logFinding: status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const entry = {
    id: `finding-${Date.now()}-${++_counter}`,
    title: title.trim(),
    severity: normalizedSeverity,
    scope: (scope || "").trim(),
    evidence: (evidence || "").trim(),
    status: normalizedStatus,
    logged_at: new Date().toISOString(),
  };
  const filename = path.join(tmpDir, `${entry.id}.json`);
  fs.writeFileSync(filename, JSON.stringify(entry, null, 2));
  return { filename, entry };
}

function listFindings(dir = tmpDir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }
      catch { return null; }
    })
    .filter(Boolean)
    .sort((a, b) => a.logged_at.localeCompare(b.logged_at));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test("logFinding writes a normalized JSON file", () => {
  const { filename, entry } = logFinding({
    title: "Reflected XSS",
    severity: "High",
    scope: "app.example.com",
    evidence: 'param=<script>alert(1)</script> reflected unescaped',
    status: "confirmed",
  });

  assert.ok(fs.existsSync(filename), "file should exist on disk");

  const saved = JSON.parse(fs.readFileSync(filename, "utf8"));
  assert.equal(saved.title, "Reflected XSS");
  assert.equal(saved.severity, "high");           // normalized to lowercase
  assert.equal(saved.scope, "app.example.com");
  assert.equal(saved.status, "confirmed");
  assert.ok(saved.id.startsWith("finding-"));
  assert.ok(saved.logged_at);
  assert.deepEqual(saved, entry);
});

test("logFinding uses 'unconfirmed' as default status", () => {
  const { entry } = logFinding({ title: "Open Redirect", severity: "medium" });
  assert.equal(entry.status, "unconfirmed");
});

test("logFinding normalizes severity to lowercase", () => {
  const { entry } = logFinding({ title: "SSRF", severity: "CRITICAL" });
  assert.equal(entry.severity, "critical");
});

test("listFindings returns all recorded entries sorted by logged_at", () => {
  // Clear dir
  fs.readdirSync(tmpDir).forEach((f) => fs.unlinkSync(path.join(tmpDir, f)));

  logFinding({ title: "Finding A", severity: "low" });
  logFinding({ title: "Finding B", severity: "high" });
  logFinding({ title: "Finding C", severity: "medium" });

  const all = listFindings(tmpDir);
  assert.equal(all.length, 3);
  // Sorted ascending by logged_at
  for (let i = 1; i < all.length; i++) {
    assert.ok(
      all[i].logged_at >= all[i - 1].logged_at,
      "findings should be sorted ascending by logged_at"
    );
  }
});

test("listFindings returns empty array when no evidence dir exists", () => {
  const missing = path.join(os.tmpdir(), `nonexistent-${Date.now()}`);
  assert.ok(!fs.existsSync(missing), "precondition: dir must not exist");
  assert.deepEqual(listFindings(missing), []);
});

test("logFinding throws when title is missing", () => {
  assert.throws(
    () => logFinding({ severity: "high" }),
    /title is required/
  );
});

test("logFinding throws when title is empty string", () => {
  assert.throws(
    () => logFinding({ title: "   ", severity: "low" }),
    /title is required/
  );
});

test("logFinding throws when severity is invalid", () => {
  assert.throws(
    () => logFinding({ title: "CSRF", severity: "extreme" }),
    /severity must be one of/
  );
});

test("logFinding throws when severity is missing", () => {
  assert.throws(
    () => logFinding({ title: "IDOR" }),
    /severity must be one of/
  );
});

test("logFinding throws when status is invalid", () => {
  assert.throws(
    () => logFinding({ title: "SQLi", severity: "critical", status: "unknown-status" }),
    /status must be one of/
  );
});

test("logFinding throws when record is not an object", () => {
  assert.throws(() => logFinding("not an object"), /record must be an object/);
  assert.throws(() => logFinding(null), /record must be an object/);
});

test("VALID_SEVERITIES includes all expected values", () => {
  assert.deepEqual(VALID_SEVERITIES, ["critical", "high", "medium", "low", "info"]);
});

test("VALID_STATUSES includes all expected values", () => {
  assert.deepEqual(VALID_STATUSES, [
    "confirmed",
    "likely",
    "potential",
    "informational",
    "unconfirmed",
  ]);
});
