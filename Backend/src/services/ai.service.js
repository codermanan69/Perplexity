import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    apiKey: process.env.GEMINI_API_KEY,
    maxRetries: 1
});

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

const agent = createAgent({
    model: geminiModel,
    tools: [ searchInternetTool ],
})

export async function generateResponse(messages) {
    const lastUserMessage = messages[messages.length - 1]?.content?.trim().toLowerCase() || "";
    
    // Heuristic: If it's a very simple greeting or very short non-search text, skip the Agent entirely for speed.
    const isCasualGreeting = /^(hi|hello|hey|sup|how are you|thanks|thank you|ok|okay|bye|good morning|good night)$/i.test(lastUserMessage);
    const isVeryShort = lastUserMessage.length <= 15 && !/what|who|where|when|why|how|search|latest|news/i.test(lastUserMessage);

    if (isCasualGreeting || isVeryShort) {
        // Direct LLM call (takes ~1 second) without going through the slow Tool Reasoning loop
        const directMessages = messages.map(msg => {
            return msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content);
        });
        
        const directResponse = await geminiModel.invoke([
            new SystemMessage("You are a helpful and precise assistant."),
            ...directMessages
        ]);
        
        return directResponse.content || directResponse.text;
    }

    // Normal Agent Flow with Internet Search capability
    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant for answering questions.
                If you don't know the answer, say you don't know. 
                If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
            `),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            })) ]
    });

    const lastMessage = response.messages?.[response.messages.length - 1];
    let aiText = lastMessage?.content || lastMessage?.text;
    
    if (!aiText || typeof aiText !== 'string') {
        throw new Error(`Invalid response from AI Agent. Agent output: ${JSON.stringify(response)}`);
    }

    return aiText;
}

export async function generateChatTitle(message) {

    const response = await geminiModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    return response.text;

}