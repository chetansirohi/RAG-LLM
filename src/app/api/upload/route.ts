import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import prisma from '@/lib/db/prisma';
import { env } from "@/lib/env";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';


const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_ID,
        secretAccessKey: env.AWS_ACCESS_KEY,
    },
});

const allowedFileType = "application/pdf";
const maxFileSize = 10 * 1024 * 1024; // 10 MB

async function generateFileName(userId: string, originalName: string, bytes: number = 8): Promise<string> {
    const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');
    const extension = originalName.split('.').pop();
    const randomPart = crypto.randomBytes(bytes).toString('hex');
    return `${nameWithoutExtension}-${userId}-${randomPart}.${extension}`;
}

async function getSignedURL(fileType: string, fileSize: number, checksum: string, fileName: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: fileName,
        ContentType: fileType,
        ContentLength: fileSize,
        ChecksumSHA256: checksum,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 60 });
}

export async function POST(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        console.log(session?.user.id);
        if (!session) {
            return Response.json({ message: 'Not authenticated', status: 401 });
        }


        // Assuming req.body is a FormData object with 'file' field
        const formData = await req.formData();
        const file = formData.get('file') as File;
        console.log(file);
        if (!file || file.type !== allowedFileType || file.size > maxFileSize) {
            return Response.json({ message: 'Invalid file type or size', status: 400 });
        }

        const uniqueFileName = await generateFileName(session.user.id, file.name);

        // Check for existing file
        const existingFile = await prisma.file.findUnique({
            where: {
                fileName: uniqueFileName,
            },
        });
        if (existingFile) {
            return Response.json({ message: 'File with this name already exists' }, { status: 400 });
        }


        // Compute checksum
        const buffer = Buffer.from(await file.arrayBuffer());
        const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

        // Get signed URL
        const url = await getSignedURL(file.type, file.size, checksum, uniqueFileName);

        // Upload the file to S3 using the presigned URL
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
                'Content-Length': String(file.size),
            },
            body: buffer,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file to S3: ${uploadResponse.statusText}`);
        }

        // Save file details to the database
        const fileRecord = await prisma.file.create({
            data: {
                fileName: uniqueFileName,
                fileUrl: url.split("?")[0],
                userId: session.user.id,
                isProcessed: false,
            },
        });

        return Response.json({ success: true, url: fileRecord.fileUrl, id: fileRecord.id, name: fileRecord.fileName });


    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ message: 'Upload Error' }, { status: 500 });
    }
}


