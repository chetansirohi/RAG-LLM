import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
    BytesOutputParser,
    StringOutputParser,
} from "@langchain/core/output_parsers";
import { env } from "@/lib/env";
import client from "@/lib/db/supabase";
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { Message as VercelChatMessage, StreamingTextResponse, LangChainStream } from 'ai';
import { formatDocumentsAsString } from "langchain/util/document";
import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { RunnableSequence } from "@langchain/core/runnables";
// import { ObjectId } from 'mongodb';
import { DocumentInterface } from "@langchain/core/documents";

export const runtime = 'edge';

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
    const formattedDialogueTurns = chatHistory.map((message) => {
        if (message.role === "user") {
            return `Human: ${message.content}`;
        } else if (message.role === "assistant") {
            return `Assistant: ${message.content}`;
        } else {
            return `${message.role}: ${message.content}`;
        }
    });
    return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(
    CONDENSE_QUESTION_TEMPLATE,
);

const ANSWER_TEMPLATE = `You are an artificial intelligent pdf loader and parser question answer chatbot, when the user uploads a pdf file you load the pdf file and parse through its contents and answer the user's questions based on the contents of the pdf file. You do not make answers on your own rather you answer based on the provided content, if you dont know the answers to user's questions you will tell them that you dont know the answer.

<context>
  {context}
</context>

<chat_history>
    {chat_history}
</chat_history>

User's Question: {question}`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

async function getChatHistory(sessionId: string) {
    const chatHistory = await prisma.chatMessage.findMany({
        where: { sessionId: "662166bf8c6e28fdb5e35a44" },
        orderBy: { createdAt: 'asc' },
        take: 10,
    });
    console.log(chatHistory);

    return formatVercelMessages(chatHistory.map(msg => ({
        id: msg.id,
        role: msg.role as VercelChatMessage['role'],
        content: msg.content,
    })));
}


export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json();
        const messages = body.messages ?? [];
        const formattedPreviousMessages = messages.slice(0, -1);
        const currentMessageContent = messages[messages.length - 1]?.content;
        const session = await auth();
        // const sessionId = new ObjectId().toString();

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
        });

        let retrievedDocuments: DocumentInterface<Record<string, any>>[];
        try {
            retrievedDocuments = await retriever.getRelevantDocuments(currentMessageContent);
        } catch (dbError) {
            console.error("Database error:", dbError);

            return Response.json({ message: "Something went wrong while retrieving the document information. Please try again later." }, { status: 503 });
        }
        // console.log(retrievedDocuments)

        const serializedSources = Buffer.from(JSON.stringify(
            retrievedDocuments.map(doc => ({
                pageContent: doc.pageContent.slice(0, 50) + "...",
                metadata: doc.metadata,
            }))
        )).toString("base64");

        const model = new ChatOpenAI({
            temperature: 0.7,
            modelName: "gpt-3.5-turbo"
        });


        const standaloneQuestionChain = RunnableSequence.from([
            condenseQuestionPrompt,
            model,
            new StringOutputParser(),
        ]);

        // Retrieve the chat history
        // const formattedChatHistory = await getChatHistory(sessionId);

        const answerChain = RunnableSequence.from([
            {
                context: (input) => formatDocumentsAsString(retrievedDocuments),
                chat_history: (input) => input.chat_history,
                question: (input) => input.question,
            },
            answerPrompt,
            model,
        ]);

        const conversationalRetrievalQAChain = RunnableSequence.from([
            {
                question: standaloneQuestionChain,
                chat_history: (input) => input.chat_history,
            },
            answerChain,
            new BytesOutputParser(),
        ]);

        // await prisma.chatMessage.create({
        //     data: {
        //         content: currentMessageContent,
        //         role: 'user',
        //         sessionId,
        //     },
        // });

        const stream = await conversationalRetrievalQAChain.stream({
            question: currentMessageContent,
            chat_history: formatVercelMessages(formattedPreviousMessages),
        });

        // Convert the stream to a string
        let botResponse = '';
        const decoder = new TextDecoder();
        for await (const chunk of stream) {
            const decodedChunk = decoder.decode(chunk);
            botResponse += decodedChunk;
        }

        // // Store the bot's response in the database
        // await prisma.chatMessage.create({
        //     data: {
        //         content: botResponse,
        //         role: 'assistant',
        //         sessionId,
        //     },
        // });

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
