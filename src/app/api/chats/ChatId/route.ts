// /api/chats/chatId/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const chatId = params.chatId;
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
            return NextResponse.json({ message: 'Chat session not found' }, { status: 404 });
        }

        return NextResponse.json(chatSession, { status: 200 });
    } catch (error) {
        console.error('Error fetching chat session:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { chatId: string } }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const chatId = params.chatId;
        const { content } = await request.json();

        const newMessage = await prisma.chatMessage.create({
            data: {
                content,
                role: 'user',
                chatSessionId: chatId,
                userId: session.user.id,
            },
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error('Error creating chat message:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}