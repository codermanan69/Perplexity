import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY
})

export async function generateResponse(messages) {
  const response = await mistralModel.invoke(messages.map(msg => {
    if (msg.role == "user") {
      return new HumanMessage(msg.content)
    }
    else if (msg.role == "ai") {
      return new AIMessage(msg.content)
    }
  }));
  return response.text;
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(` You are a helpful and precise assistant for answering questions.
                 If you don't know the answer, say you don't know. `),
    new HumanMessage(`
      Generate a title for a chat conversation based on the following first message:"${message}"
      `)
  ]);
  return response.text;
}