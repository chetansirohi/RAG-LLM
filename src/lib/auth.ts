import NextAuth from "next-auth";
import { env } from "@/lib/env";
import prisma from "@/lib/db/prisma";
import Google from "@auth/core/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { auth, handlers: { GET, POST } } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
    })],
    callbacks: {
        session({ session, user }) {
            session.user.id = user.id;
            return session;
        },
    },

});