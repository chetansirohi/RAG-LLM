// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { BufferMemory } from "langchain/memory";
// import { LLMChain } from "langchain/chains";
// import { formatDocumentsAsString } from "langchain/util/document";
// import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { StringOutputParser } from "@langchain/core/output_parsers";

// export const runtime = 'edge';


import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { env } from '@/lib/env';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages } = await req.json();


    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}