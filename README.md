# BugBountyPro v2.0 — AI Bug Bounty Assistant

> Analyzes HTTP responses · Spots vulnerabilities · Suggests safe tests · Recommends RapidAPI tools · Writes HackerOne/Bugcrowd reports

**Node.js 18+ required · Runs locally · No cloud deployment needed**

---

## 60-second launch

```bash
# 1. Clone and install
git clone https://github.com/SwatDesignz/-bugbounty-agent-v2.0.git
cd -bugbounty-agent-v2.0
npm install

# 2. One-command setup (creates .env, shows what to fill in)
npm run setup

# 3. Add your Anthropic API key to .env, then start
npm start
```

Get an API key at **[console.anthropic.com/settings/api-keys](https://console.anthropic.com/settings/api-keys)** — free tier available.

> **Shortcut** — skip `.env` entirely and export inline:
> ```bash
> ANTHROPIC_API_KEY="sk-ant-..." npm start
> ```

---

## All npm scripts

| Script | What it does |
|---|---|
| `npm run setup` | Create `.env` from template, check API key, print next steps |
| `npm start` | Launch the interactive AI session (same as `npm run cli`) |
| `npm run deploy:claude` | Verify Anthropic API key works before starting |
| `npm run deploy:openai` | Deploy as a GPT-4o assistant on OpenAI's platform |
| `npm run train:tryhackme` | Fetch a TryHackMe training shortlist for legal practice |
| `npm run vuln:log -- '<JSON>'` | Record a finding from the terminal |
| `npm test` | Run the test suite (no API calls needed) |

---

## Session commands

Once `npm start` is running, type anything at the `>` prompt:

| Command | Description |
|---|---|
| *(any text)* | Analyze — paste URLs, HTTP responses, headers, scope, scanner output |
| `/file <path>` | Load a file (Burp export, Nuclei JSON, JS file, etc.) |
| `/evidence <JSON>` | Record a confirmed finding as structured evidence |
| `/evidence list` | List all recorded findings |
| `/save` | Save the full session to `./sessions/` |
| `/clear` | Clear conversation history and start fresh |
| `/help` | Show in-session help |
| `/quit` | Exit |

### Example session

```
> Scope: *.bankapp.com — Nuclei found 17 medium issues, session cookie missing HttpOnly

[reasoning...] [done]

QUICK SUMMARY
Target: *.bankapp.com
Tech Stack: …
Key Findings: Session management weakness — HttpOnly flag absent on auth cookie…
Priority Score: Medium — limited standalone impact, high chaining potential
RapidAPI Recon: Subdomain Finder, Webtech

> /file nuclei-results.json
Loaded: nuclei-results.json (42.3 KB)

> What CSRF vectors are realistic given an Angular frontend?

> /evidence {"title":"Session cookie missing HttpOnly","severity":"medium","scope":"*.bankapp.com","evidence":"Set-Cookie: session=abc; Path=/","status":"confirmed"}
Finding recorded: ./evidence/finding-1745134024123-1.json
  Title: Session cookie missing HttpOnly  Severity: MEDIUM  Status: confirmed

> /evidence list
Recorded Findings (1):
  1. [MEDIUM] Session cookie missing HttpOnly — confirmed — *.bankapp.com

> /save
Session saved: ./sessions/session-2026-04-20T09-00-00-000Z.json
```

---

## Evidence recording

Log structured vulnerability records during or after a session.

**Inside a session:**

```
> /evidence {"title":"Reflected XSS","severity":"high","scope":"app.example.com/search",
             "evidence":"q= param reflected unescaped","status":"confirmed"}
```

**From the terminal:**

```bash
npm run vuln:log -- '{"title":"IDOR","severity":"high","scope":"api.example.com/users","status":"confirmed"}'
```

Records are saved to `./evidence/` as individual `.json` files.

| Field | Required | Allowed values |
|---|---|---|
| `title` | ✅ | Short descriptive name |
| `severity` | ✅ | `critical` · `high` · `medium` · `low` · `info` |
| `scope` | — | In-scope asset (URL, domain, endpoint) |
| `evidence` | — | Raw evidence (headers, params, response snippets) |
| `status` | — | `confirmed` · `likely` · `potential` · `informational` · `unconfirmed` *(default)* |

---

## What the agent does

| Capability | Detail |
|---|---|
| **Analyze** | Domains, HTTP requests/responses, headers, cookies, tokens, HTML, JS, JSON, scanner output |
| **Triage** | Separates real bugs from noise using evidence-based reasoning only — no speculation |
| **Prioritize** | Critical / High / Medium / Low with exploitability and impact context |
| **Guide** | Safe, passive manual verification steps — never exploits for you |
| **Enrich** | Recommends 1–3 RapidAPI passive recon tools per response |
| **Report** | Generates submission-ready HackerOne / Bugcrowd reports |
| **Train** | Fetches TryHackMe room shortlists for legal practice |

---

## Project structure

```
-bugbounty-agent-v2.0/
├── cli.js                  # Interactive Claude session (primary interface)
├── evidence.js             # Structured vulnerability evidence module
├── deploy-claude.js        # API key verification helper
├── deploy-openai.js        # OpenAI Assistants deployment
├── tryhackme.js            # TryHackMe room fetcher
├── train-tryhackme.js      # Training mode CLI
├── SYSTEM_PROMPT.md        # Core agent instructions
├── QUICKSTART.md           # Detailed step-by-step guide
├── example-input.json      # Sample analysis input
├── .env.example            # Environment variable template
├── scripts/
│   ├── setup.js            # One-command setup helper
│   └── log-finding.js      # CLI evidence logger
├── test/                   # Test suite (node:test, no API calls)
├── .github/workflows/      # CI — runs tests on push/PR (Node 18/20/22)
├── sessions/               # Auto-created: saved conversation sessions
└── evidence/               # Auto-created: logged vulnerability findings
```

---

## Safety rules

- **No exploitation** — Never provides exploit payloads or attack code
- **No active scanning** — Passive reconnaissance only via RapidAPI tools
- **In-scope only** — Validates every target against program scope
- **Evidence required** — Every claim must be backed by data you provide
- **Human execution** — Agent suggests; you decide and act

---

## Requirements

| Requirement | Notes |
|---|---|
| Node.js 18+ | [nodejs.org/en/download](https://nodejs.org/en/download/) |
| `ANTHROPIC_API_KEY` | Required for `npm start` — [console.anthropic.com](https://console.anthropic.com/settings/api-keys) |
| `OPENAI_API_KEY` | Optional — only for `npm run deploy:openai` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| *ANTHROPIC_API_KEY is not set* | Run `npm run setup` and edit `.env`, or `export ANTHROPIC_API_KEY="sk-ant-..."` |
| *Rate limited* | Wait 30–60 seconds and try again |
| *Invalid API key* | Check [console.anthropic.com](https://console.anthropic.com) |
| *SYSTEM_PROMPT.md not found* | Run from the project root directory |
| Node version error | Run `node --version` — must be ≥ 18 |

→ **Full step-by-step guide:** [QUICKSTART.md](./QUICKSTART.md)
