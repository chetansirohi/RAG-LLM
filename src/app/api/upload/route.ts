import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Fields, Files } from 'formidable';
// const formidable = require('formidable');
import prisma from '@/lib/db/prisma';
import { s3Upload } from '@/lib/db/s3services';
import { env } from "@/lib/env";



export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const form = new formidable.IncomingForm();

    form.parse(req, async (err: Error, fields: Fields, files: Files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).json({ message: 'Form parse error' });
        }

        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        const file = fileArray.find(f => f instanceof File) as File | undefined;
        if (!file) {
            return res.status(400).json({ message: 'No file upload' });
        }

        // Handling a field that could be either a string or an array of strings
        const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

        try {
            const uploadResult = await s3Upload(env.S3_BUCKET!, {
                name: file.originalFilename || file.newFilename, // Use appropriate property
                path: file.filepath,
            });

            await prisma.file.create({
                data: {
                    fileName: file.originalFilename || file.newFilename, // Use appropriate property
                    fileUrl: uploadResult.Location,
                    userId: userId || '', // Default to an empty string if userId is undefined
                    isProcessed: false,
                },
            });

            return res.status(200).json({ message: 'File uploaded successfully', url: uploadResult.Location });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
}

