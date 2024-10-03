
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().nonempty(),
    AUTH_GOOGLE_ID: z.string().nonempty(),
    AUTH_GOOGLE_SECRET: z.string().nonempty(),
    AUTH_SECRET: z.string().nonempty(),
    OPENAI_API_KEY: z.string().nonempty(),
    AWS_S3_BUCKET: z.string().nonempty(),
    AWS_ACCESS_KEY_ID: z.string().nonempty(),
    AWS_SECRET_ACCESS_KEY: z.string().nonempty(),
    AWS_REGION: z.string().nonempty(),
    DIRECTED_DATABASE_URL: z.string().nonempty(),
    MONGODB_ATLAS_DB_NAME: z.string().nonempty(),
    MONGODB_ATLAS_COLLECTION_NAME: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);