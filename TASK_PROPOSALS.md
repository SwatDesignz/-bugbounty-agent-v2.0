# Task Proposals from Codebase Review (Revised)

This revision incorporates the requested direction to support:
- creating safe testing sandboxes,
- recording vulnerabilities in a structured way,
- reading bug bounty program terms/permissions from site policy pages.

## 1) Typo fix task
**Title:** Replace shorthand `vulns` with `vulnerabilities` in user-facing docs

**Issue (root cause):** The README headline uses mixed terminology (`vulns` vs `vulnerabilities`), which is small but inconsistent for a security-facing product.

**Task:** Update user-facing copy to consistently use `vulnerabilities` instead of shorthand where clarity matters.

**Acceptance criteria:**
- README and quickstart text use consistent wording for vulnerability terminology.
- No informal shorthand remains in primary headings/intro sections.

---

## 2) Bug fix task
**Title:** Repair truncated `QUICKSTART.md` and add runnable sandbox bootstrap flow

**Issue (root cause):** `QUICKSTART.md` is truncated with an unclosed code fence, making setup unusable. This also prevents documenting a safe local sandbox path for legal testing rehearsal.

**Task:**
1. Rebuild `QUICKSTART.md` as complete Markdown.
2. Add a minimal `npm run sandbox:init` command to scaffold a local, non-target test workspace (fixtures + notes) for safe reproduction.
3. Keep implementation simple: filesystem-only scaffold, no network actions.

**Acceptance criteria:**
- Markdown renders correctly (all fences closed).
- `npm run sandbox:init` exists and creates a local sandbox directory structure.
- Command is idempotent (safe to run repeatedly).

---

## 3) Comment/documentation discrepancy task
**Title:** Add explicit policy-intake workflow for bug bounty terms and permissions

**Issue (root cause):** The system prompt emphasizes scope compliance, but there is no concrete workflow for ingesting program policy pages (terms, allowed testing, prohibited actions, safe-harbor clauses).

**Task:**
- Add docs and prompt guidance for a `policy intake` step where the user can paste program URLs/text.
- Add a normalized output checklist: in-scope assets, forbidden techniques, rate limits, auth/test-account constraints, disclosure requirements.
- Clarify that site reading is for permission analysis only, not exploitation planning.

**Acceptance criteria:**
- Workflow documented in README/QUICKSTART and reflected in `SYSTEM_PROMPT.md`.
- Output format includes a clear permission matrix (Allowed / Caution / Forbidden).
- Safety language remains passive and compliant.

---

## 4) Test improvement task
**Title:** Add smoke tests for sandbox creation, vulnerability logging, and policy parsing

**Issue (root cause):** There are no automated tests around operational safety workflows, so regressions can silently break compliance-critical behavior.

**Task:** Add a lightweight `node:test` suite covering:
1. `sandbox:init` creates expected folders/files.
2. `vuln:log` writes normalized JSON records (title, severity, evidence, scope, status).
3. `policy:parse` extracts core permission constraints from sample policy text.
4. Existing CLI `/file` error handling still works.

**Acceptance criteria:**
- `npm test` runs without external API calls.
- Tests include both happy-path and malformed-input cases.
- Coverage includes at least one compliance-focused negative test (e.g., prohibited action detected).
