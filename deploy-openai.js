const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function deploy() {
  const prompt = fs.readFileSync("SYSTEM_PROMPT.md", "utf8");
  
  const assistant = await openai.beta.assistants.create({
    name: "BugBountyPro v2.0",
    instructions: prompt,
    model: "gpt-4o",
    tools: [{ type: "code_interpreter" }]
  });
  
  console.log(`✅ Agent deployed: https://platform.openai.com/assistants/${assistant.id}`);
  console.log("💡 Test it now!");
}

deploy().catch(console.error);
