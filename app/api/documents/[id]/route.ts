import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { unlink } from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';

// Extract the document ID from the URL
function extractDocumentId(url: string): string {
  const segments = url.split('/');
  return segments[segments.length - 1];
}

export async function DELETE(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const documentId = extractDocumentId(req.url);

    if (!ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID.' }, { status: 400 });
    }

    const document = await db.collection('documents').findOne({ _id: new ObjectId(documentId) });
    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    // Use the correct directory for file deletion
    const documentsDir = process.env.NODE_ENV === 'production'
      ? path.join('/tmp', 'documents')
      : path.join(process.cwd(), 'public', 'documents');
    const filePath = path.join(documentsDir, document.filename);
    await unlink(filePath);

    await db.collection('documents').deleteOne({ _id: new ObjectId(documentId) });

    return NextResponse.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
