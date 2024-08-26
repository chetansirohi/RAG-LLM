
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return Response.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { title } = await request.json();
        const sessionId = new ObjectId().toString();


        const chatSession = await prisma.chatSession.create({
            data: {
                id: sessionId,
                userId: session.user.id,
                title: title || `Conversation ${sessionId.slice(-4)}`,
            },
        });

        return new Response(JSON.stringify(chatSession), { status: 201 });
    } catch (error) {
        console.error('Error creating chat session:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
        }

        const userId = session.user.id;
        const chatSessions = await prisma.chatSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        // await new Promise((resolve) => setTimeout(resolve, 5000));

        return new Response(JSON.stringify(chatSessions), { status: 200 });
    } catch (error) {
        console.error('Error fetching chats for user:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });

    }
}