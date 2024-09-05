import NextAuth from "next-auth";
import { env } from "@/lib/env";
import prisma from "@/lib/db/prisma";
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { auth, handlers: { GET, POST } } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
    })],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        session({ session, user, token }) {
            // session.user.id = user.id;
            if (session.user) {
                session.user.id = token.sub!;
            }
            return session;
        },
    },

});