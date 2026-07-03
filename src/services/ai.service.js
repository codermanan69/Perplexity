import { ChatMistralAI } from "@langchain/mistralai";

const model = new ChatMistralAI({
model: "mistral-large-latest",
apiKey: process.env.MISTRAL_API_KEY,
temperature: 0
});

export async function testAi() {
    model.invoke("What is AI explain under 10 words").then((response)=> {
        console.log(response.content);
    })
}