import { ChatOpenRouter } from "@langchain/openrouter";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import data from "./config.json" with { type: 'json' };
import 'dotenv/config';

async function run() {
  const llm = new ChatOpenRouter({
    model: data.MODEL_NAME,
    apiKey: process.env.OPENROUTER_API,
    modelKwargs: {
      max_tokens: data.MAX_TOKENS,
      temperature: data.TEMPERATURE
    }
  });

  const messages = [
    new SystemMessage(data.SYSTEM_PROMPT),
    new HumanMessage("What is the difference between school of Shafi'e and Hanafi in Islam?"),
  ];

  try {
    const result = await llm.invoke(messages);
    console.log("Response:", result.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
