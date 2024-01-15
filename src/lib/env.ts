import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().nonempty(),
    GOOGLE_CLIENT_ID: z.string().nonempty(),
    GOOGLE_CLIENT_SECRET: z.string().nonempty(),
    NEXTAUTH_URL: z.string().nonempty(),
    NEXTAUTH_SECRET: z.string().nonempty(),
    OPENAI_API_KEY: z.string().nonempty(),
    SUPABASE_PRIVATE_KEY: z.string().nonempty(),
    SUPABASE_URL: z.string().nonempty(),
    AWS_S3_BUCKET: z.string().nonempty(),
    AWS_ACCESS_ID: z.string().nonempty(),
    AWS_ACCESS_KEY: z.string().nonempty(),
    AWS_REGION: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);
