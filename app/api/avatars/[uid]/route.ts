import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const uid = url.pathname.split('/').pop();

    if (!uid) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Upload file to Uploadcare
    const uploadcareFormData = new FormData();
    uploadcareFormData.append('UPLOADCARE_PUB_KEY', process.env.UPLOADCARE_PUBLIC_KEY || '');
    uploadcareFormData.append('file', file);

    const uploadcareResponse = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: uploadcareFormData,
    });

    if (!uploadcareResponse.ok) {
      console.error('Error uploading to Uploadcare:', await uploadcareResponse.text());
      return NextResponse.json({ message: 'Failed to upload avatar to Uploadcare' }, { status: 500 });
    }

    const uploadcareData = await uploadcareResponse.json();
    const avatarUrl = `https://ucarecdn.com/${uploadcareData.file}/`;

    // Update the user's avatarUrl in the database
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { userId: uid },
      { $set: { avatarUrl } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
    });
  } catch (err) {
    console.error('Error uploading avatar:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
