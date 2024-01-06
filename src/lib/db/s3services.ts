import AWS from "aws-sdk";
import fs from "fs";


const accessKeyId = process.env.AWS_ACCESS_ID;
const secretAccessKey = process.env.AWS_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not set in environment variables");
}

const s3 = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'us-east-1',
});


interface FileParam {
    name: string;
    path: string;
}

export const s3Upload = async (bucket: string, file: FileParam): Promise<AWS.S3.ManagedUpload.SendData> => {
    const params: AWS.S3.PutObjectRequest = {
        Bucket: bucket,
        Key: file.name,
        Body: fs.createReadStream(file.path),
    };

    return await s3.upload(params).promise();
}
