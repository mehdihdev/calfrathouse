import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Ensure this path matches the location of mongodb.ts
import { writeFile, unlink } from 'fs/promises';
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

    // Parse FormData
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const file = formData.get('file') as File;

    if (!name || !type || !file) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Save the file to the public/documents folder
    const filePath = path.join(process.cwd(), 'public/documents', file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // Ensure the documents collection exists
    const collection = db.collection('documents');

    // Save document details to the database
    const document = {
      name,
      type,
      filename: file.name,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(document);

    return NextResponse.json({ document: { ...document, _id: result.insertedId } });
  } catch (error) {
    console.error('Error adding document:', error);
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
