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


export async function POST(req: Request, res: Response) {
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
        console.log('Retrieved documents:', relevantDocuments);
        const formattedDocuments = formatDocumentsAsString(relevantDocuments);
        console.log('Formatted documents:', formattedDocuments);
        const chatHistory = await getChatHistory(chatId);

        const model = new ChatOpenAI({
            temperature: 0.7,
            modelName: "gpt-3.5-turbo",
            openAIApiKey: env.OPENAI_API_KEY,
        });
        // console.log("Model initialized successfully");


        const standaloneQuestionChain = RunnableSequence.from([
            condenseQuestionPrompt,
            model,
            new StringOutputParser(),
        ]);

        // Retrieve the chat history
        // const formattedChatHistory = await getChatHistory(chatId);

        const answerChain = RunnableSequence.from([
            {
                context: (input) => formattedDocuments,
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


        let botResponse = '';

        try {

            const systemContent = await conversationalRetrievalQAChain.invoke({
                question: currentMessageContent,
                chat_history: formatVercelMessages(formattedPreviousMessages),
            });

            // console.log('System content type:', typeof systemContent);
            // console.log('System content:', systemContent);

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
                temperature: 0.7,
                onFinish: async ({ text }) => {
                    botResponse = text;
                    await storeMessage(chatId, 'user', currentMessageContent, session?.user.id);
                    await storeMessage(chatId, 'assistant', botResponse, session?.user.id);
                }
            });

            // console.log("Stream completed successfully");
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
