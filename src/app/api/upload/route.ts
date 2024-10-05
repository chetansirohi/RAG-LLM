import { auth } from "@/lib/auth";
import { generateFileName, getSignedURL, saveFileRecord, markFileAsProcessed, getVectorStore } from "@/lib/backendUtils";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return Response.json({ message: 'Not authenticated', status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const chatSessionId = formData.get('chatSessionId') as string;

        if (!file || !(file instanceof File) || !chatSessionId) {
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
        const fileRecord = await saveFileRecord(uniqueFileName, url.split("?")[0], checksum, session.user.id, secureToken, chatSessionId);

        // Load the PDF and split it into chunks
        const response = await fetch(fileRecord.fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to load file from S3: ${response.statusText}`);
        }
        const fileBlob = await response.blob();
        const loader = new WebPDFLoader(fileBlob, { parsedItemSeparator: "\n", splitPages: true });
        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1200,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            lengthFunction: (text) => text.length,
        });
        const splitDocs = await splitter.splitDocuments(docs);

        const vectorStore = await getVectorStore();

        await vectorStore.addDocuments(splitDocs.map(doc => ({
            pageContent: doc.pageContent,
            metadata: {
                ...doc.metadata,
                secureToken: secureToken,
                userId: session.user.id,
                chatSessionId: chatSessionId,
            },
        })));

        // Mark the file as processed in DB
        await markFileAsProcessed(secureToken);

        return Response.json({ success: true, token: secureToken });

    } catch (error) {
        console.error('Upload error:', error);
        return Response.json({ message: 'Upload Error' }, { status: 500 });
    }
}
