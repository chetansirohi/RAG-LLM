
import { Message as VercelChatMessage } from 'ai';
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import client from "@/lib/db/supabase";
import prisma from '@/lib/db/prisma';
import { env } from "@/lib/env";

export const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
    return chatHistory.map((message) => {
        if (message.role === "user") {
            return `Human: ${message.content}`;
        } else if (message.role === "assistant") {
            return `Assistant: ${message.content}`;
        } else {
            return `${message.role}: ${message.content}`;
        }
    }).join("\n");
};

export const getSupabaseRetriever = () => {

    if (!env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in the environment');
    }

    const embeddings = new OpenAIEmbeddings({
        modelName: "text-embedding-ada-002",
        openAIApiKey: env.OPENAI_API_KEY,
    });

    return new SupabaseHybridSearch(embeddings, {
        client,
        similarityK: 3,
        keywordK: 3,
        tableName: "documents",
        similarityQueryName: "match_documents",
        keywordQueryName: "kw_match_documents",
    });
};

export const getRelevantDocuments = async (content: string) => {
    try {
        const retriever = getSupabaseRetriever();
        const documents = await retriever.invoke(content);
        return formatDocumentsAsString(documents);
    } catch (error) {
        console.error('Error retrieving relevant documents:', error);
        throw error;
    }
};

export const storeMessage = async (chatId: string, role: 'user' | 'assistant', content: string, userId?: string) => {
    return prisma.chatMessage.create({
        data: {
            content,
            role,
            sessionId: chatId,
            userId,
            chatSessionId: chatId,
        },
    });
};

export const getChatHistory = async (chatId: string) => {
    const chatHistory = await prisma.chatMessage.findMany({
        where: { chatSessionId: chatId },
        orderBy: { createdAt: 'asc' },
        take: 10,
    });

    return chatHistory.map(msg => ({
        id: msg.id,
        role: msg.role as VercelChatMessage['role'],
        content: msg.content,
    }));
};