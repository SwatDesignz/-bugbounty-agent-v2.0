const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Isolate evidence storage in a temp directory, then use the REAL module
// functions (no re-implemented copies) via its dependency-injection hook.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bugbounty-evidence-"));

const {
  logFinding,
  listFindings,
  setEvidenceDir,
  resetEvidenceDir,
  VALID_SEVERITIES,
  VALID_STATUSES,
} = require("../evidence");

setEvidenceDir(tmpDir);

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

  const all = listFindings();
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
  const prev = tmpDir;
  setEvidenceDir(missing);
  assert.ok(!fs.existsSync(missing), "precondition: dir must not exist");
  assert.deepEqual(listFindings(), []);
  setEvidenceDir(prev);
});

// Restore the real default dir after the whole suite
process.on("exit", () => resetEvidenceDir());

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
