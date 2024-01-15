// import type { NextApiRequest, NextApiResponse } from 'next';
// import formidable, { File, Fields, Files } from 'formidable';
// // const formidable = require('formidable');
// import prisma from '@/lib/db/prisma';
// import { s3Upload } from '@/lib/db/s3services';
// import { env } from "@/lib/env";



// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

// export async function POST(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Method not allowed' });
//     }

//     const form = new formidable.IncomingForm();

//     form.parse(req, async (err: Error, fields: Fields, files: Files) => {
//         if (err) {
//             console.error('Form parse error:', err);
//             return res.status(500).json({ message: 'Form parse error' });
//         }

//         const fileArray = Array.isArray(files.file) ? files.file : [files.file];
//         const file = fileArray.find(f => f instanceof File) as File | undefined;
//         if (!file) {
//             return res.status(400).json({ message: 'No file upload' });
//         }

//         // Handling a field that could be either a string or an array of strings
//         const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

//         try {
//             const uploadResult = await s3Upload(env.S3_BUCKET!, {
//                 name: file.originalFilename || file.newFilename, // Use appropriate property
//                 path: file.filepath,
//             });

//             await prisma.file.create({
//                 data: {
//                     fileName: file.originalFilename || file.newFilename, // Use appropriate property
//                     fileUrl: uploadResult.Location,
//                     userId: userId || '', // Default to an empty string if userId is undefined
//                     isProcessed: false,
//                 },
//             });

//             return res.status(200).json({ message: 'File uploaded successfully', url: uploadResult.Location });
//         } catch (error) {
//             console.error('Error:', error);
//             return res.status(500).json({ message: 'Internal server error' });
//         }
//     });
// }


//almost working

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import crypto from "crypto";
// import prisma from '@/lib/db/prisma';
// import { env } from "@/lib/env";
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';

// const s3Client = new S3Client({
//     region: env.AWS_S3_BUCKET,
//     credentials: {
//         accessKeyId: env.AWS_ACCESS_ID,
//         secretAccessKey: env.AWS_ACCESS_KEY,
//     },
// });

// const allowedFileType = "application/pdf";
// const maxFileSize = 10 * 1024 * 1024; // 10 MB

// async function generateFileName(bytes = 16) {
//     return crypto.randomBytes(bytes).toString('hex') + '.pdf';
// }

// async function getSignedURL(fileType, fileSize, checksum) {
//     // Ensure session exists to associate file with user
//     const session = await getServerSession(req, res, authOptions);
//     if (!session) {
//         throw new Error("Not authenticated");
//     }

//     // Validate file type and size
//     if (fileType !== allowedFileType || fileSize > maxFileSize) {
//         throw new Error("Invalid file type or size");
//     }

//     const fileName = await generateFileName();

//     const command = new PutObjectCommand({
//         Bucket: env.AWS_S3_BUCKET,
//         Key: fileName,
//         ContentType: fileType,
//         ContentLength: fileSize,
//         ChecksumSHA256: checksum,
//     });

//     return await getSignedUrl(s3Client, command, { expiresIn: 60 });
// }

// export async function POST(req: NextApiRequest, res: NextApiResponse) {

//     try {
//         // Assuming req.body is a FormData object with 'file' field
//         const file = req.body.get('file');
//         if (!file) {
//             return res.status(400).json({ message: 'File is required' });
//         }

//         // Compute checksum
//         const buffer = Buffer.from(await file.arrayBuffer());
//         const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

//         // Get signed URL
//         const url = await getSignedURL(file.type, file.size, checksum);

//         // Save file details to the database
//         const fileRecord = await prisma.file.create({
//             data: {
//                 fileName: file.name,
//                 fileUrl: url.split("?")[0],
//                 userId: session.user.id, // Link file to the authenticated user
//             },
//         });

//         return res.status(200).json({ message: 'File uploaded successfully', fileId: fileRecord.id, url: fileRecord.fileUrl });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// }


//almost working 2

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

async function generateFileName(bytes = 16) {
    return crypto.randomBytes(bytes).toString('hex') + '.pdf';
}

async function getSignedURL(fileType: string, fileSize: number, checksum: string) {
    const fileName = await generateFileName();
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
        // Check for existing file
        const existingFile = await prisma.file.findUnique({
            where: {
                fileName: file.name,
            },
        });
        if (existingFile) {
            return Response.json({ message: 'File with this name already exists' }, { status: 400 });
        }


        // Compute checksum
        const buffer = Buffer.from(await file.arrayBuffer());
        const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

        // Get signed URL
        const url = await getSignedURL(file.type, file.size, checksum);

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
                fileName: file.name,
                fileUrl: url.split("?")[0],
                userId: session.user.id,
                isProcessed: false,
            },
        });

        return Response.json({ success: true, url: fileRecord.fileUrl, id: fileRecord.id, name: fileRecord.fileName });


    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ error });
    }
}

