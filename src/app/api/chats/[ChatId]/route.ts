// /api/chats/chatId/route.ts
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request, { params }: { params: { ChatId: string } }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }


        const chatId = params.ChatId;
        const chatSession = await prisma.chatSession.findUnique({
            where: { id: chatId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { file: true },
                },
            },
        });

        if (!chatSession) {
            return new Response(JSON.stringify({ message: 'Chat session not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(chatSession), { status: 200 });
    } catch (error) {
        console.error('Error fetching chat session:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

