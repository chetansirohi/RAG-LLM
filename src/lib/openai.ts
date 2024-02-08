
import { OpenAI } from "@langchain/openai";
import { env } from "@/lib/env";

const OPENAI_API_KEY: string | undefined = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    throw new Error('Expected env var OPENAI_API_KEY');
}

const openAI = new OpenAI({ openAIApiKey: env.OPENAI_API_KEY });

export default openAI;
