const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

try { require("dotenv").config(); } catch (e) { /* dotenv optional */ }

const MODEL = "claude-opus-4-6";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deploy() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY is not set.");
    console.error('Set it with: export ANTHROPIC_API_KEY="sk-ant-..."');
    process.exit(1);
  }

  const systemPrompt = fs.readFileSync(
    path.join(__dirname, "SYSTEM_PROMPT.md"),
    "utf8"
  );

  const client = new Anthropic();

  console.log(`Connecting to Claude ${MODEL}...\n`);

  const maxAttempts = 4;
  const baseDelay = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 128,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content:
              "Confirm you are operational as a bug bounty assistant. Reply in one sentence.",
          },
        ],
      });

      const text =
        response.content.find((b) => b.type === "text")?.text ?? "";

      console.log(`Agent: ${text.trim()}\n`);
      console.log(`✅ BugBountyPro v2.0 (Claude ${MODEL}) is ready.`);
      console.log("   Start an interactive session: npm run cli\n");
      return;
    } catch (err) {
      const retryable =
        err instanceof Anthropic.RateLimitError ||
        err instanceof Anthropic.InternalServerError ||
        (err.status && err.status === 529);

      if (retryable && attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `Attempt ${attempt} failed (${err.message}). Retrying in ${delay / 1000}s...`
        );
        await sleep(delay);
      } else {
        console.error(`\n❌ Deployment failed: ${err.message}`);
        process.exit(1);
      }
    }
  }
}

deploy();
