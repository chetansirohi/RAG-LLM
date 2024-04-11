import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { env } from "@/lib/env";
import client from "@/lib/db/supabase";
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { formatDocumentsAsString } from "langchain/util/document";
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

export const runtime = 'edge';

const formatMessage = (message: VercelChatMessage) => `${message.role}: ${message.content}`;
const TEMPLATE = `You are an artificial intelligent pdf loader and parser question answer chatbot, when the user uploads a pdf file you load the pdf file and parse through its contents and answer the user's questions based on the contents of the pdf file. You do not make answers on your own rather you answer based on the provided content, if you dont know the answers to user's questions you will tell them that you dont know the answer

Current conversation:
{chat_history}

User: {input}
AI: `;
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

        const embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-ada-002",
            openAIApiKey: env.OPENAI_API_KEY,
        });

        const retriever = new SupabaseHybridSearch(embeddings, {
            client: client,
            similarityK: 3,
            keywordK: 3,
            tableName: "documents",
            similarityQueryName: "match_documents",
            keywordQueryName: "kw_match_documents",
            // metadata: {
            //     user_id: "657caf3cc293286a402a8fbe",
            //     secureToken: "32e140c05d06770fa250a7d7742d226c"
            // }
        });

        let retrievedDocuments;
        try {
            retrievedDocuments = await retriever.getRelevantDocuments(currentMessageContent);

        } catch (dbError) {
            console.error("Database error:", dbError);

            return Response.json({ message: "Something went wrong while retrieving the document information. Please try again later." }, { status: 503 });
        }

        const serializedSources = Buffer.from(JSON.stringify(
            retrievedDocuments.map(doc => ({
                pageContent: doc.pageContent.slice(0, 50) + "...",
                metadata: doc.metadata,
            }))
        )).toString("base64");

        const formattedRetrievedDocuments = formatDocumentsAsString(retrievedDocuments)
        // console.log(formattedRetrievedDocuments)



        const prompt = PromptTemplate.fromTemplate(TEMPLATE);
        const model = new ChatOpenAI({
            temperature: 0.7,
            modelName: "gpt-3.5-turbo"
        });
        const outputParser = new BytesOutputParser();

        const chain = prompt.pipe(model).pipe(outputParser);

        const stream = await chain.stream({
            chat_history: `${formattedPreviousMessages.join('\n').replace("\n", " ")}\n\nRetrieved Documents:\n${formattedRetrievedDocuments}`,
            input: currentMessageContent,
        });

        return new StreamingTextResponse(stream, {
            headers: {
                "x-message-index": (formattedPreviousMessages.length + 1).toString(),
                "x-sources": serializedSources,
            },
        });

    } catch (e) {
        console.error("Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
