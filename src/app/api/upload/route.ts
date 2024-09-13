// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import crypto from "crypto";
// import prisma from '@/lib/db/prisma';
// import { env } from "@/lib/env";
// import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import client from "@/lib/db/supabase";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
// import { auth } from "@/lib/auth"


// const s3Client = new S3Client({
//     region: env.AWS_REGION,
//     credentials: {
//         accessKeyId: env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
//     },
// });


// async function generateFileName(userId: string, originalName: string): Promise<string> {
//     const timestamp = new Date().getTime();
//     return `${userId}-${timestamp}-${originalName}`;
// }

// function generateSecureToken() {
//     return crypto.randomBytes(16).toString('hex'); // Generate a 32-character hex token
// }

// async function getSignedURL(fileType: string, fileSize: number, checksum: string, fileName: string): Promise<string> {
//     const command = new PutObjectCommand({
//         Bucket: env.AWS_S3_BUCKET,
//         Key: fileName,
//         ContentType: fileType,
//         ContentLength: fileSize,
//         ChecksumSHA256: checksum,
//     });

//     return await getSignedUrl(s3Client, command, { expiresIn: 150 });
// }

// export async function POST(req: Request) {
//     try {
//         const session = await auth();
//         // console.log(session?.user.id);

//         if (!session?.user) {
//             return Response.json({ message: 'Not authenticated', status: 401 });
//         }

//         const formData = await req.formData();
//         const file = formData.get('file') as File;

//         // console.log(file);
//         if (!file) {
//             return Response.json({ message: 'File is required' }, { status: 400 });
//         }

//         if (!(file instanceof File)) {
//             return Response.json({ message: 'Invalid file' }, { status: 400 });
//         }

//         if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
//             return Response.json({ message: 'Invalid file type or size' }, { status: 400 });
//         }

//         // Compute checksum
//         const buffer = Buffer.from(await file.arrayBuffer());
//         const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

//         // Generate unique file name
//         const uniqueFileName = await generateFileName(session.user.id, file.name);

//         const secureToken = generateSecureToken();

//         // Get signed URL
//         const url = await getSignedURL(file.type, file.size, checksum, uniqueFileName);

//         // Upload the file to S3 using the presigned URL
//         const uploadResponse = await fetch(url, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': file.type,
//                 'Content-Length': String(file.size),
//             },
//             body: file,
//         });

//         if (!uploadResponse.ok) {
//             throw new Error(`Failed to upload file to S3: ${uploadResponse.statusText}`);
//         }

//         // Save file details to the database
//         const fileRecord = await prisma.file.create({
//             data: {
//                 fileName: uniqueFileName,
//                 fileUrl: url.split("?")[0],
//                 checksum: checksum,
//                 userId: session.user.id,
//                 isProcessed: false,
//                 secureToken: secureToken,
//             },
//         });

//         // Load the PDF from S3 URL
//         const response = await fetch(fileRecord.fileUrl);
//         if (!response.ok) {
//             throw new Error(`Failed to load file from S3: ${response.statusText}`);
//         }
//         const fileBlob = await response.blob();

//         const metadata = { secureToken: secureToken, user_id: session.user.id };

//         // Use the WebPDFLoader to load the PDF
//         const loader = new WebPDFLoader(fileBlob, { parsedItemSeparator: "", splitPages: false });
//         const docs = await loader.load();

//         const splitter = new RecursiveCharacterTextSplitter({
//             chunkSize: 1800,
//             chunkOverlap: 300,
//         });

//         const splitDocs = await splitter.splitDocuments(docs);


//         const texts = splitDocs.map(doc => doc.pageContent);
//         const metadatas = splitDocs.map(doc => {
//             // Check if the document already has metadata
//             const existingMetadata = doc.metadata ? doc.metadata : {};

//             return {
//                 ...existingMetadata,
//                 secureToken: secureToken,
//                 user_id: session.user.id
//             };
//         });


//         const embeddings = new OpenAIEmbeddings({ modelName: "text-embedding-ada-002", openAIApiKey: env.OPENAI_API_KEY });

//         //initialize vector store 
//         const vectorStore = await SupabaseVectorStore.fromTexts(
//             texts,
//             metadatas,
//             embeddings,
//             { client, tableName: "documents", queryName: "match_documents" }
//         );

//         await prisma.file.update({
//             where: { secureToken: secureToken },
//             data: { isProcessed: true },
//         });


//         return Response.json({ success: true, token: secureToken });


//     } catch (error) {
//         console.error('Upload error:', error);
//         return Response.json({ message: 'Upload Error' }, { status: 500 });
//     }
// }


import { auth } from "@/lib/auth";
import { generateFileName, getSignedURL, saveFileRecord, markFileAsProcessed } from "@/lib/backendUtils";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import client from "@/lib/db/supabase";
import { env } from "@/lib/env";
import crypto from "crypto"; // Moved here for server-side usage

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return Response.json({ message: 'Not authenticated', status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file || !(file instanceof File)) {
            return Response.json({ message: 'Invalid file' }, { status: 400 });
        }

        if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
            return Response.json({ message: 'Invalid file type or size' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Compute checksum using crypto
        const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
        const uniqueFileName = await generateFileName(session.user.id, file.name);

        // Generate secure token using crypto
        const secureToken = crypto.randomBytes(16).toString('hex');

        // Get presigned URL and upload file
        const url = await getSignedURL(file.type, file.size, checksum, uniqueFileName);
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
                'Content-Length': String(file.size),
            },
            body: file,
        });
        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file to S3: ${uploadResponse.statusText}`);
        }

        // Save file record in DB
        const fileRecord = await saveFileRecord(uniqueFileName, url.split("?")[0], checksum, session.user.id, secureToken);

        // Load the PDF and split it into chunks
        const response = await fetch(fileRecord.fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to load file from S3: ${response.statusText}`);
        }
        const fileBlob = await response.blob();
        const loader = new WebPDFLoader(fileBlob, { parsedItemSeparator: "", splitPages: false });
        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1800,
            chunkOverlap: 300,
        });
        const splitDocs = await splitter.splitDocuments(docs);

        const texts = splitDocs.map(doc => doc.pageContent);
        const metadatas = splitDocs.map(doc => ({
            ...doc.metadata,
            secureToken: secureToken,
            user_id: session.user.id
        }));

        const embeddings = new OpenAIEmbeddings({ modelName: "text-embedding-ada-002", openAIApiKey: env.OPENAI_API_KEY });
        await SupabaseVectorStore.fromTexts(
            texts,
            metadatas,
            embeddings,
            { client, tableName: "documents", queryName: "match_documents" }
        );

        // Mark the file as processed in DB
        await markFileAsProcessed(secureToken);

        return Response.json({ success: true, token: secureToken });

    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ message: 'Upload Error' }, { status: 500 });
    }
}
