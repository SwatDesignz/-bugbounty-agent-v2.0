# BugBountyPro v2.0 — Quick Start

Get from zero to a running AI bug bounty session in under 60 seconds.

---

## Requirements

- **Node.js 18+** — [nodejs.org/en/download](https://nodejs.org/en/download/)
- **Anthropic API key** — [console.anthropic.com/settings/api-keys](https://console.anthropic.com/settings/api-keys)

---

## Step 1 — Clone & install

```bash
git clone https://github.com/SwatDesignz/-bugbounty-agent-v2.0.git
cd -bugbounty-agent-v2.0
npm install
```

## Step 2 — Set up your API key

```bash
npm run setup
```

This copies `.env.example` → `.env` and tells you exactly what to fill in.
Then open `.env` and replace `sk-ant-...` with your real Anthropic key:

```
ANTHROPIC_API_KEY=sk-ant-YOUR-ACTUAL-KEY-HERE
```

> **Alternatively**, export the key directly in your shell (no `.env` needed):
> ```bash
> export ANTHROPIC_API_KEY="sk-ant-..."
> ```

## Step 3 — Launch

```bash
npm start
```

You'll see the interactive prompt. Start typing — paste a URL, HTTP response, headers, or scanner output and the agent will analyze it.

---

## Quick command reference

Once inside the session:

| Command | What it does |
|---|---|
| `<any text>` | Analyze — paste URLs, HTTP responses, headers, scope, etc. |
| `/file <path>` | Load a file (Burp export, Nuclei JSON, JS file, etc.) |
| `/evidence <JSON>` | Record a confirmed vulnerability finding |
| `/evidence list` | Show all recorded findings |
| `/save` | Save the session to `./sessions/` |
| `/clear` | Clear conversation history (start fresh) |
| `/help` | Show help inside the agent |
| `/quit` | Exit |

---

## Common workflows

### Analyze a target scope

```
> Scope: *.example.com
  Program: HackerOne — example
  Nuclei found 12 medium findings, session cookie has no HttpOnly flag.
  What should I investigate first?
```

### Load scanner output

```
> /file nuclei-results.json
```

### Record a confirmed finding

```
> /evidence {"title":"Reflected XSS","severity":"high","scope":"app.example.com/search","evidence":"q=<script>alert(1)</script> reflected unescaped","status":"confirmed"}
```

### Log a finding from the terminal (outside a session)

```bash
npm run vuln:log -- '{"title":"IDOR","severity":"high","scope":"api.example.com/users","status":"confirmed"}'
```

---

## Optional: Verify API connection before starting

```bash
npm run deploy:claude
```

This makes a single test call to the Claude API and confirms your key works.

---

## Optional: OpenAI / GPT-4o deployment

```bash
export OPENAI_API_KEY="sk-..."
npm run deploy:openai
```

Deploys the same system prompt as a GPT-4o assistant on OpenAI's platform.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ANTHROPIC_API_KEY is not set` | Run `npm run setup` and fill in `.env`, or `export ANTHROPIC_API_KEY="sk-ant-..."` |
| `Rate limited` | Wait 30–60 seconds and try again |
| `Invalid API key` | Double-check the key at [console.anthropic.com](https://console.anthropic.com) |
| `SYSTEM_PROMPT.md not found` | Make sure you're running from the project root |
| Node version error | Run `node --version` — must be 18 or higher |
