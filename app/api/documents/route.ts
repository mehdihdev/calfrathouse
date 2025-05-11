import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Ensure this path matches the location of mongodb.ts
import { promises as fs } from 'fs';
import path from 'path';
import Document from '@/models/Document';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const documents = await Document.find();
    return NextResponse.json({ documents });
  } catch (err) {
    console.error('Error fetching documents:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await connectToDatabase();
    const { name, type, fileUrl } = await req.json();

    if (!name || !type || !fileUrl) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Save document details to the database
    const collection = db.collection('documents');
    const document = {
      name,
      type,
      fileUrl,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(document);

    return NextResponse.json({ document: { ...document, _id: result.insertedId } });
  } catch (err) {
    console.error('Error adding document:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = await connectToDatabase();
    const url = new URL(req.url);
    const documentId = url.searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
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
    await fs.unlink(filePath);

    await db.collection('documents').deleteOne({ _id: new ObjectId(documentId) });

    return NextResponse.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
