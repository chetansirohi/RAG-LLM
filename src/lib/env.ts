import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().nonempty(),
    GOOGLE_CLIENT_ID: z.string().nonempty(),
    GOOGLE_CLIENT_SECRET: z.string().nonempty(),
    NEXTAUTH_URL: z.string().nonempty(),
    NEXTAUTH_SECRET: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);
