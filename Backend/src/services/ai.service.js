import "dotenv/config";
import readline from "node:readline";
import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export async function testAi() {
  rl.question("\nYou: ", async (question) => {
    if (question.toLowerCase() === "exit") {
      console.log("Goodbye 👋");
      rl.close();
      return;
    }

    try {
      const response = await tvly.search(question);

      console.log("\nAI:");
      console.log(response.results[0].content);
    } catch (err) {
      console.error(err.message);
    }

    testAi();
  });
}