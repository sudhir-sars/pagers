import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { BlobServiceClient } from '@azure/storage-blob';
import Busboy from 'busboy';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME!;

export async function POST(req: Request) {
  // Authenticate the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json(
      { error: 'Authorization header missing' },
      { status: 401 }
    );
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  if (!AZURE_STORAGE_CONNECTION_STRING || !CONTAINER_NAME) {
    return NextResponse.json(
      { error: 'Azure storage config missing' },
      { status: 500 }
    );
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Invalid Content-Type' },
      { status: 400 }
    );
  }

  // Read the full request body into a Buffer and create a Node.js stream
  const buffer = Buffer.from(await req.arrayBuffer());
  const stream = Readable.from(buffer);

  const busboy = Busboy({ headers: { 'content-type': contentType } });

  return new Promise((resolve, reject) => {
    const fileUploadPromises: Promise<string>[] = [];

    busboy.on('file', (_fieldname, file, info) => {
      const { filename } = info;
      const uploadPromise = new Promise<string>(
        async (resolveUpload, rejectUpload) => {
          try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(
              AZURE_STORAGE_CONNECTION_STRING
            );
            const containerClient =
              blobServiceClient.getContainerClient(CONTAINER_NAME);
            const blobName = `${Date.now()}-${filename}`;
            const blockBlobClient =
              containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadStream(file, 4 * 1024 * 1024, 20);
            resolveUpload(blockBlobClient.url);
          } catch (err) {
            rejectUpload(err);
          }
        }
      );
      fileUploadPromises.push(uploadPromise);
    });

    busboy.on('finish', async () => {
      try {
        const uploadedFileUrls = await Promise.all(fileUploadPromises);
        if (uploadedFileUrls.length > 0) {
          resolve(
            NextResponse.json({ urls: uploadedFileUrls }, { status: 200 })
          );
        } else {
          resolve(
            NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
          );
        }
      } catch (err) {
        resolve(NextResponse.json({ error: 'Upload failed' }, { status: 500 }));
      }
    });

    busboy.on('error', (error) => {
      reject(
        NextResponse.json(
          { error: 'Stream processing error', details: error },
          { status: 500 }
        )
      );
    });

    // Pipe the Node.js stream to Busboy
    stream.pipe(busboy);
  });
}
