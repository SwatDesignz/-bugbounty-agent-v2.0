#!/usr/bin/env node
/**
 * BugBountyPro v2.0 — Interactive CLI
 * Powered by Claude claude-opus-4-6 with adaptive thinking
 *
 * Usage:
 *   npm run cli
 *   node cli.js
 *
 * Commands inside the session:
 *   /help          — Show this help
 *   /file <path>   — Load a file as input (Burp exports, Nuclei output, etc.)
 *   /save          — Save conversation to ./sessions/
 *   /clear         — Clear conversation history
 *   /quit          — Exit
 */

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

try {
  require("dotenv").config();
} catch (e) {
  /* dotenv optional */
}

// ─── Config ──────────────────────────────────────────────────────────────────

const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 16000;
const SESSIONS_DIR = path.join(__dirname, "sessions");
const SYSTEM_PROMPT_PATH = path.join(__dirname, "SYSTEM_PROMPT.md");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadSystemPrompt() {
  if (!fs.existsSync(SYSTEM_PROMPT_PATH)) {
    console.error(`Error: SYSTEM_PROMPT.md not found at ${SYSTEM_PROMPT_PATH}`);
    process.exit(1);
  }
  return fs.readFileSync(SYSTEM_PROMPT_PATH, "utf8");
}

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function saveSession(messages) {
  ensureSessionsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = path.join(SESSIONS_DIR, `session-${timestamp}.json`);
  const data = {
    model: MODEL,
    timestamp: new Date().toISOString(),
    turn_count: messages.filter((m) => m.role === "user").length,
    messages,
  };
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  return filename;
}

function printBanner() {
  console.log("\x1b[32m");
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      BugBountyPro v2.0 — Claude Edition      ║");
  console.log("║  5x faster recon. 70% less noise. AI-guided. ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("\x1b[0m");
  console.log(`Model: \x1b[36m${MODEL}\x1b[0m with adaptive thinking`);
  console.log(
    "Commands: \x1b[33m/help\x1b[0m  \x1b[33m/file <path>\x1b[0m  \x1b[33m/save\x1b[0m  \x1b[33m/clear\x1b[0m  \x1b[33m/quit\x1b[0m\n"
  );
  console.log(
    "Paste scope, HTTP responses, headers, cookies, or scanner output below.\n"
  );
}

function printHelp() {
  console.log("\n\x1b[33mAvailable Commands:\x1b[0m");
  console.log("  /help            Show this help");
  console.log("  /file <path>     Load file content as context (Burp exports,");
  console.log("                   Nuclei output, JS files, etc.)");
  console.log("  /save            Save session to ./sessions/");
  console.log("  /clear           Clear conversation history (start fresh)");
  console.log("  /quit            Exit");
  console.log("\n\x1b[33mTips:\x1b[0m");
  console.log("  • Paste HTTP responses or headers directly at the prompt.");
  console.log(
    "  • Use /file to load large files (e.g., nuclei-results.json)."
  );
  console.log(
    "  • Conversation history is preserved — build context across turns.\n"
  );
}

// ─── Analysis ────────────────────────────────────────────────────────────────

async function analyze(client, systemPrompt, messages) {
  process.stdout.write("\n\x1b[33m[Analyzing...]\x1b[0m\n\n");

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    system: systemPrompt,
    messages,
  });

  let inThinking = false;
  let hasOutput = false;

  for await (const event of stream) {
    switch (event.type) {
      case "content_block_start":
        if (event.content_block.type === "thinking") {
          inThinking = true;
          process.stdout.write("\x1b[2m[reasoning...] \x1b[0m");
        } else if (event.content_block.type === "text") {
          if (inThinking) {
            process.stdout.write("\x1b[2m[done]\x1b[0m\n\n");
            inThinking = false;
          }
        }
        break;

      case "content_block_delta":
        if (event.delta.type === "text_delta") {
          process.stdout.write(event.delta.text);
          hasOutput = true;
        }
        break;
    }
  }

  if (inThinking) {
    process.stdout.write("\n");
  }
  if (hasOutput) {
    process.stdout.write("\n\n");
  }

  return await stream.finalMessage();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "\x1b[31mError: ANTHROPIC_API_KEY environment variable is not set.\x1b[0m"
    );
    console.error(
      'Set it: \x1b[33mexport ANTHROPIC_API_KEY="sk-ant-..."\x1b[0m\n'
    );
    process.exit(1);
  }

  const client = new Anthropic();
  const systemPrompt = loadSystemPrompt();
  const messages = [];

  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  rl.on("close", () => {
    console.log("\nGoodbye. Stay safe!");
    process.exit(0);
  });

  const prompt = () => {
    rl.question("\x1b[36m> \x1b[0m", async (raw) => {
      const input = raw.trim();

      if (!input) {
        prompt();
        return;
      }

      // ── Commands ────────────────────────────────────────────────────────
      if (input === "/quit" || input === "/exit" || input === "/q") {
        console.log("\nGoodbye. Stay safe!");
        rl.close();
        return;
      }

      if (input === "/help" || input === "/?") {
        printHelp();
        prompt();
        return;
      }

      if (input === "/clear") {
        messages.length = 0;
        console.log("\x1b[33mConversation cleared.\x1b[0m\n");
        prompt();
        return;
      }

      if (input === "/save") {
        if (messages.length === 0) {
          console.log("\x1b[33mNothing to save yet.\x1b[0m\n");
        } else {
          const file = saveSession(messages);
          console.log(`\x1b[32mSession saved: ${file}\x1b[0m\n`);
        }
        prompt();
        return;
      }

      if (input.startsWith("/file ")) {
        const filePath = input.slice(6).trim();
        let content;
        try {
          content = fs.readFileSync(filePath, "utf8");
        } catch (err) {
          console.error(
            `\x1b[31mCould not read file "${filePath}": ${err.message}\x1b[0m\n`
          );
          prompt();
          return;
        }
        const sizeKb = (content.length / 1024).toFixed(1);
        console.log(
          `\x1b[33mLoaded: ${path.basename(filePath)} (${sizeKb} KB)\x1b[0m`
        );
        // Append file content to a structured user message
        const fileInput = `Analyze the following content from "${path.basename(filePath)}":\n\n${content}`;
        messages.push({ role: "user", content: fileInput });
      } else {
        messages.push({ role: "user", content: input });
      }

      // ── Send to Claude ──────────────────────────────────────────────────
      try {
        const response = await analyze(client, systemPrompt, messages);

        // Preserve full content (incl. thinking blocks) for multi-turn context
        messages.push({ role: "assistant", content: response.content });

        const tokens = response.usage;
        process.stdout.write(
          `\x1b[2m[tokens: in=${tokens.input_tokens} out=${tokens.output_tokens}]\x1b[0m\n\n`
        );
      } catch (err) {
        // Remove the failed user message so history stays clean
        messages.pop();

        if (err instanceof Anthropic.RateLimitError) {
          console.error(
            "\x1b[31mRate limited — wait a moment and try again.\x1b[0m\n"
          );
        } else if (err instanceof Anthropic.AuthenticationError) {
          console.error(
            "\x1b[31mInvalid API key — check ANTHROPIC_API_KEY and restart.\x1b[0m\n"
          );
          rl.close();
          return;
        } else if (err instanceof Anthropic.BadRequestError) {
          console.error(`\x1b[31mBad request: ${err.message}\x1b[0m\n`);
        } else {
          console.error(`\x1b[31mError: ${err.message}\x1b[0m\n`);
        }
      }

      prompt();
    });
  };

  prompt();
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
