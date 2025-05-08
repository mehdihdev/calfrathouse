import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { unlink } from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectToDatabase();
    const documentId = params.id;

    if (!ObjectId.isValid(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID.' }, { status: 400 });
    }

    // Find the document in the database
    const document = await db.collection('documents').findOne({ _id: new ObjectId(documentId) });

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    // Delete the file from the public/documents folder
    const filePath = path.join(process.cwd(), 'public/documents', document.filename);
    await unlink(filePath);

    // Delete the document from the database
    await db.collection('documents').deleteOne({ _id: new ObjectId(documentId) });

    return NextResponse.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
