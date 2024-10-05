
import { Message as VercelChatMessage } from 'ai';
import { OpenAIEmbeddings } from "@langchain/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import prisma from '@/lib/db/prisma';
import { env } from "@/lib/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DocumentInterface } from "@langchain/core/documents";
import { MongoClient } from "mongodb";

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


export async function getVectorStore() {
    const client = new MongoClient(env.DIRECTED_DATABASE_URL || "");
    const collection = client
        .db(env.MONGODB_ATLAS_DB_NAME)
        .collection("vector_documents");

    const embeddings = new OpenAIEmbeddings({
        modelName: "text-embedding-ada-002",
    });

    return new MongoDBAtlasVectorSearch(embeddings, {
        collection: collection,
        indexName: "vector_index",
        textKey: "text",
        embeddingKey: "embedding",
    });
}


export async function getRelevantDocuments(content: string, chatSessionId: string): Promise<DocumentInterface[]> {
    try {
        const vectorStore = await getVectorStore();

        const filter = {
            chatSessionId: chatSessionId
        };

        const searchResults = await vectorStore.maxMarginalRelevanceSearch(content, {
            k: 3,
            fetchK: 5,
            lambda: 0.6,
            filter: filter
        });

        return searchResults;
    } catch (error) {
        console.error('Error retrieving relevant documents:', error);
        throw error;
    }
}



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

const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function generateFileName(userId: string, originalName: string): Promise<string> {
    const timestamp = new Date().getTime();
    return `${userId}-${timestamp}-${originalName}`;
}

export async function getSignedURL(fileType: string, fileSize: number, checksum: string, fileName: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: fileName,
        ContentType: fileType,
        ContentLength: fileSize,
        ChecksumSHA256: checksum,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 150 });
}

export async function saveFileRecord(fileName: string, fileUrl: string, checksum: string, userId: string, secureToken: string, chatSessionId: string) {
    return await prisma.file.create({
        data: {
            fileName,
            fileUrl,
            checksum,
            userId,
            isProcessed: false,
            secureToken,
            chatSessionIds: [chatSessionId],
        },
    });
}

export async function markFileAsProcessed(secureToken: string) {
    await prisma.file.update({
        where: { secureToken: secureToken },
        data: { isProcessed: true },
    });
}



// const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

// <chat_history>
//   {chat_history}
// </chat_history>

// Follow Up Input: {question}
// Standalone question:`;


// const ANSWER_TEMPLATE = `You are an artificial intelligent pdf loader and parser question answer chatbot, when the user uploads a pdf file you load the pdf file and parse through its contents and answer the user's questions based on the contents of the pdf file. You do not make answers on your own rather you answer based on the provided content, if you dont know the answers to user's questions you will tell them that you dont know the answer.

// <context>
//   {context}
// </context>

// <chat_history>
//     {chat_history}
// </chat_history>

// User's Question: {question}`;


// const standaloneQuestionChain = RunnableSequence.from([
//     condenseQuestionPrompt,
//     model,
//     new StringOutputParser(),
// ]);

// const answerChain = RunnableSequence.from([
//     {
//         context: (input) => formattedDocuments,
//         chat_history: (input) => input.chat_history,
//         question: (input) => input.question,
//     },
//     answerPrompt,
//     model,
// ]);

// const conversationalRetrievalQAChain = RunnableSequence.from([
//     {
//         question: standaloneQuestionChain,
//         chat_history: (input) => input.chat_history,
//     },
//     answerChain,
//     new BytesOutputParser(),
// ]);


// const systemContent = await conversationalRetrievalQAChain.invoke({
//     question: currentMessageContent,
//     chat_history: formatVercelMessages(formattedPreviousMessages),
// });