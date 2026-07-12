import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, tool, createAgent } from 'langchain';
import * as z from 'zod';
import { tavily as Tavily } from '@tavily/core';

const geminiModel = new ChatGoogleGenerativeAI({model: 'gemini-flash-latest', apiKey: 'fake_key', maxRetries: 1});

const tavily = Tavily({ apiKey: 'fake_tavily' })

const searchInternetTool = tool(async ({ query }) => {
    return tavily.search(query);
}, {name: 'searchInternet', description: 'desc', schema: z.object({query: z.string()})});

const agent = createAgent({model: geminiModel, tools: [searchInternetTool]});
agent.invoke({messages: [new HumanMessage('hello')]}).then(res => console.log('AGENT RESPONSE KEYS:', Object.keys(res))).catch(e => console.log('AGENT ERROR:', e.message));
