
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

// import {
//     BytesOutputParser,
//     StringOutputParser,
// } from "@langchain/core/output_parsers";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { BufferMemory } from "langchain/memory";
// import { LLMChain } from "langchain/chains";
// import { formatDocumentsAsString } from "langchain/util/document";
// import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
// import { NextRequest } from 'next/server';
// import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
// // import { getServerSession } from 'next-auth';
// // import { authOptions } from '../auth/[...nextauth]/route';
// // import prisma from '@/lib/db/prisma';
// import { env } from "@/lib/env";
// import client from "@/lib/db/supabase";
// import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";

// export const runtime = 'edge';
// const formatMessage = (message: VercelChatMessage) => {
//     return `${message.role}: ${message.content}`;
// };

// const TEMPLATE = `You are an artificial intelligent pdf loader and parser question answer chatbot, when the user uploads a pdf file you load the pdf file and parse through its contents and answer the user's questions based on the contents of the pdf file. You do not make answers on your own rather you answer based on the provided content, if you dont know the answers to user's questions you wil tell them that you dont know the answer

// Current conversation:
// {chat_history}

// User: {input}
// AI:`;

// export async function POST(req: Request, res: Response) {
//     try {
//         // const session = await getServerSession(authOptions);
//         // // console.log(session?.user.id);

//         // if (!session || !session.user) {
//         //     return Response.json({ message: 'Not authenticated', status: 401 });
//         // }

//         const body = await req.json();
//         console.log(body)
//         const messages = body.messages ?? [];
//         const secureToken = body.secureToken;
//         // const userId = session.user.id;
//         const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
//         const currentMessageContent = messages[messages.length - 1].content;
//         console.log(currentMessageContent);

//         const retriever = new SupabaseHybridSearch(new OpenAIEmbeddings({ modelName: "text-embedding-ada-002", openAIApiKey: env.OPENAI_API_KEY }), {
//             client: client,

//             tableName: "documents",
//             similarityQueryName: "match_documents", // Your configured function for similarity search
//             keywordQueryName: "kw_match_documents",
//             // metadata: { "user_id": userId, "secureToken": secureToken }
//         })
//         // console.log(retriever);

//         const retrievedDocuments = await retriever.getRelevantDocuments(currentMessageContent);
//         // console.log(retrievedDocuments)
//         const formattedRetrievedDocuments = formatDocumentsAsString(retrievedDocuments);
//         const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0.8, openAIApiKey: env.OPENAI_API_KEY });
//         const prompt = PromptTemplate.fromTemplate(TEMPLATE);

//         const fullChatHistory = [...formattedPreviousMessages, `RetrievedDocuments: ${formattedRetrievedDocuments}`].join('\n');
//         // console.log(fullChatHistory);

//         // Continue with the creation of a chain for processing
//         const outputParser = new BytesOutputParser();
//         const chain = prompt.pipe(model).pipe(outputParser);

//         const stream = await chain.stream({
//             chat_history: fullChatHistory,
//             input: currentMessageContent,
//         });

//         // Return the streaming response
//         return new StreamingTextResponse(stream);


//     } catch (e: any) {
//         console.error("Detailed error:", e.stack || e.message);
//         return Response.json({ error: e.message, details: e.stack }, { status: e.status ?? 500 });
//     }
// }

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { env } from "@/lib/env";
import client from "@/lib/db/supabase";
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { formatDocumentsAsString } from "langchain/util/document";


export const runtime = 'edge';

// Assuming your message formatting and template setup remains the same.
const formatMessage = (message: VercelChatMessage) => `${message.role}: ${message.content}`;
const TEMPLATE = `You are an artificial intelligent PDF loader and parser question-answer chatbot. Based on the PDF contents, answer the user's questions accurately. If the answer is not known, inform the user accordingly.

Current conversation:
{chat_history}

User: {input}
AI:`;
export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json();
        const messages = body.messages ?? [];
        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const currentMessageContent = messages[messages.length - 1]?.content;
        console.log(currentMessageContent);

        if (!currentMessageContent) {
            return Response.json({ error: "No message content provided" }, { status: 400 });
        }

        // Initialize embeddings and hybrid search retriever
        const embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-ada-002",
            openAIApiKey: env.OPENAI_API_KEY,
        });

        const retriever = new SupabaseHybridSearch(embeddings, {
            client: client,
            similarityK: 2,
            keywordK: 2,
            tableName: "documents",
            similarityQueryName: "match_documents",
            keywordQueryName: "kw_match_documents",
            metadata: {
                user_id: "",
                secureToken: ""
            }
        });
        // console.log(retriever);

        const retrievedDocuments = await retriever.getRelevantDocuments(currentMessageContent);
        console.log(retrievedDocuments)
        const formattedRetrievedDocuments = retrievedDocuments.map(doc =>
            `Document Content: \n${doc.pageContent.substring(0, 500)}\n...`
        ).join('\n\n');

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);
        const model = new ChatOpenAI({
            temperature: 0.8,
        });
        const outputParser = new BytesOutputParser();

        const chain = prompt.pipe(model).pipe(outputParser);

        const stream = await chain.stream({
            chat_history: `${formattedPreviousMessages.join('\n')}\n\nRetrieved Documents:\n${formattedRetrievedDocuments}`,
            input: currentMessageContent,
        });

        return new StreamingTextResponse(stream);
    } catch (e) {
        console.error("Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
