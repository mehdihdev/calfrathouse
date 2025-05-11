import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { createReadStream } from 'fs';
import path from 'path';
import { stat } from 'fs/promises';

const UPLOAD_DIR =
  process.env.NODE_ENV === 'production'
    ? '/tmp/documents'
    : path.join(process.cwd(), 'public', 'documents');

export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();

    // ✅ Extract the filename manually from the URL
    const urlParts = req.nextUrl.pathname.split('/');
    const filename = urlParts[urlParts.length - 1];

    // Lookup in database
    const document = await db.collection('documents').findOne({ filename });
    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    // Check if the file exists
    await stat(filePath);

    // Stream the file to the client
    const fileStream = createReadStream(filePath);
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Error serving file:', err);
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }
}
