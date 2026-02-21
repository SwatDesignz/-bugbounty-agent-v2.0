# BugBountyPro v2.0 — AI Bug Bounty Assistant

**5x faster recon. 70% less noise. Production-ready.**

Analyzes HTTP responses → Spots vulns → Suggests safe tests → Recommends RapidAPI tools → Writes HackerOne/Bugcrowd reports.

---

## Quick Start (Claude — Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."
# Or copy .env.example to .env and fill it in

# 3. Launch the interactive CLI
npm run cli
```

That's it. No external deployment needed — runs locally against the Claude API.

---

## CLI Commands

| Command | Description |
|---|---|
| `/file <path>` | Load a file as input (Burp exports, Nuclei output, JS files, etc.) |
| `/save` | Save the current session to `./sessions/` |
| `/clear` | Clear conversation history |
| `/help` | Show help |
| `/quit` | Exit |

### Example Session

```
> Scope: *.bankapp.com — Nuclei found 17 medium issues, session cookie missing HttpOnly

[Analyzing...]

QUICK SUMMARY
Target: *.bankapp.com
...

> /file nuclei-results.json

> What CSRF vectors are realistic given the Angular frontend?
```

---

## Alternative: Deploy to OpenAI Assistants

```bash
export OPENAI_API_KEY="sk-..."
npm run deploy:openai
```

Deploys a GPT-4o assistant using the same `SYSTEM_PROMPT.md`. Returns a platform.openai.com URL.

---

## Validate Claude Connection

```bash
npm run deploy:claude
```

Tests the Anthropic API key and verifies the agent responds correctly before starting a session.

---

## What the Agent Does

1. **Analyze** — Domains, HTTP requests/responses, headers, cookies, tokens, HTML, JS, JSON, screenshots, scanner output
2. **Triage** — Separates real bugs from noise using evidence-based reasoning only
3. **Prioritize** — Critical / High / Medium / Low severity with exploitability context
4. **Guide** — Safe, passive manual verification steps (never exploits for you)
5. **Enrich** — Recommends 1–3 RapidAPI passive recon tools per response
6. **Report** — Generates submission-ready HackerOne / Bugcrowd reports

---

## Project Structure

```
├── cli.js              # Interactive Claude CLI (primary interface)
├── deploy-claude.js    # Validates Claude API connection
├── deploy-openai.js    # Deploys to OpenAI Assistants
├── SYSTEM_PROMPT.md    # Core agent instructions (268 lines)
├── example-input.json  # Sample vulnerability analysis input
├── .env.example        # Environment variable template
└── sessions/           # Auto-created: saved conversation sessions
```

---

## Safety Rules

- **No exploitation** — Never provides exploit payloads or attack code
- **No active scanning** — Passive reconnaissance only (RapidAPI tools)
- **In-scope only** — Validates target is within program scope
- **Evidence required** — Every claim backed by data you provide
- **Human execution** — Agent suggests; you decide and act

---

## Requirements

- Node.js 18+
- `ANTHROPIC_API_KEY` (for Claude CLI) — get one at [console.anthropic.com](https://console.anthropic.com)
- `OPENAI_API_KEY` (for OpenAI Assistants deployment only)
