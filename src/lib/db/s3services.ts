// import AWS from "aws-sdk";
// import fs from "fs";
// import { env } from "@/lib/env";


// const accessKeyId = env.AWS_ACCESS_ID;
// const secretAccessKey = env.AWS_ACCESS_KEY;

// if (!accessKeyId || !secretAccessKey) {
//     throw new Error("AWS credentials are not set in environment variables");
// }

// const s3 = new AWS.S3({
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey,
//     region: 'us-east-1',
// });


// interface FileParam {
//     name: string;
//     buffer: Buffer;
//     path: string;
// }

// export const s3Upload = async (bucket: string, file: FileParam) => {
//     const params: AWS.S3.PutObjectRequest = {
//         Bucket: bucket,
//         Key: file.name,
//         Body: file.buffer,
//         ContentType: file.mimeType,
//     };

//     return await s3.upload(params).promise();
// }

import AWS from 'aws-sdk';
import { env } from "@/lib/env";

// Configure AWS S3 with your credentials
const s3 = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_ID,
    secretAccessKey: env.AWS_ACCESS_KEY,
    region: 'us-east-1',
});

// Interface to define the structure of file parameters
interface FileParam {
    name: string;
    buffer: Buffer;
    mimeType: string;
}

// Function to upload a file to AWS S3
export const s3Upload = async (bucket: string, file: FileParam): Promise<AWS.S3.ManagedUpload.SendData> => {
    const params: AWS.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: file.name,
        Body: file.buffer,
        ContentType: file.mimeType, // Set the content type for the file
    };

    return await s3.upload(params).promise();
}
