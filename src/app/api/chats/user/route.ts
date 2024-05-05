// /api/chats/user/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const chatSessions = await prisma.chatSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(chatSessions, { status: 200 });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}