import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '@/lib/env';

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: env.AUTH_SECRET
    });

    if (!token && request.nextUrl.pathname.startsWith('/chat')) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/chat/:path*']
};
