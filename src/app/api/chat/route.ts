import { convertToCoreMessages, streamText } from 'ai';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { BytesOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { auth } from '@/lib/auth';
import { RunnableSequence } from "@langchain/core/runnables";
import { DocumentInterface } from "@langchain/core/documents";
import { openai } from '@ai-sdk/openai'
import { formatVercelMessages, getRelevantDocuments, storeMessage, getChatHistory } from '@/lib/backendUtils';
import { env } from "@/lib/env";
import { formatDocumentsAsString } from 'langchain/util/document';

export const runtime = 'nodejs';

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question that captures the context of the conversation. If the follow up question is already standalone, return it as is.

Chat History:
{chat_history}

Follow Up Question: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(
    CONDENSE_QUESTION_TEMPLATE,
);


const ANSWER_TEMPLATE = `You are an AI assistant specialized in analyzing and answering questions about PDF documents. Your primary function is to provide accurate information based solely on the content of the uploaded PDF files. Follow these guidelines:

1. Use only the information from the given context and chat history to answer the question.
2. If the context doesn't contain relevant information to answer the question, respond with "I don't have enough information from the uploaded PDF to answer that question accurately."
3. Maintain a consistent and professional tone throughout the conversation.
4. If appropriate, refer back to previous parts of the conversation to provide continuity.
5. Do not make up or infer information that is not present in the provided context.

Context (PDF content):
{context}

Chat History:
{chat_history}

User's Question: {question}
AI Assistant's Answer:`;

const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = body.messages ?? [];
        const formattedPreviousMessages = messages.slice(0, -1);
        const currentMessageContent = messages[messages.length - 1]?.content;
        const session = await auth();

        if (!currentMessageContent) {
            return Response.json({ error: "No message content provided" }, { status: 400 });
        }

        const chatId = req.headers.get('x-chat-id');
        if (!chatId) {
            return Response.json({ error: "No chat ID provided" }, { status: 400 });
        }

        const relevantDocuments = await getRelevantDocuments(currentMessageContent, chatId);
        const formattedDocuments = formatDocumentsAsString(relevantDocuments);
        // console.log('Formatted documents:', formattedDocuments);

        // const chatHistory = await getChatHistory(chatId);

        const model = new ChatOpenAI({
            temperature: 0.384527,
            modelName: "gpt-3.5-turbo",
            openAIApiKey: env.OPENAI_API_KEY,
        });

        const standaloneQuestionChain = RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
            },
            condenseQuestionPrompt,
            model,
            new StringOutputParser(),
        ]);

        // Retrieve the chat history
        // const formattedChatHistory = await getChatHistory(chatId);

        const answerChain = RunnableSequence.from([
            {
                context: (input) => input.context,
                chat_history: (input) => input.chat_history,
                question: (input) => input.question,
            },
            answerPrompt,
            model,
            new StringOutputParser(),
        ]);

        const conversationalRetrievalQAChain = RunnableSequence.from([
            {
                standalone_question: standaloneQuestionChain,
                context: async (input) => {
                    const relevantDocs = await getRelevantDocuments(input.question, input.chatId);
                    return formatDocumentsAsString(relevantDocs);
                },
                chat_history: (input) => input.chat_history,
                original_question: (input) => input.question,
            },
            answerChain,
            new BytesOutputParser(),
        ]);

        let botResponse = '';

        try {

            const systemContent = await conversationalRetrievalQAChain.invoke({
                question: currentMessageContent,
                chat_history: formatVercelMessages(formattedPreviousMessages),
                chatId: chatId,
            });

            const decodedSystemContent = systemContent instanceof Uint8Array
                ? new TextDecoder().decode(systemContent)
                : String(systemContent);


            const result = await streamText({
                model: openai("gpt-3.5-turbo"),
                messages: convertToCoreMessages([
                    {
                        role: 'system',
                        content: decodedSystemContent
                    },
                    ...messages
                ]),
                temperature: 0.384527,
                onFinish: async ({ text }) => {
                    botResponse = text;
                    await storeMessage(chatId, 'user', currentMessageContent, session?.user.id);
                    await storeMessage(chatId, 'assistant', botResponse, session?.user.id);
                }
            });

            return result.toDataStreamResponse();
        } catch (error) {
            console.error("Error in streamText or chain invocation:", error);
            if (error instanceof Error) {
                return Response.json({ error: "Error processing request", details: error.message }, { status: 500 });
            } else {
                return Response.json({ error: "Unknown error occurred" }, { status: 500 });
            }
        }

    } catch (e) {
        console.error("Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
