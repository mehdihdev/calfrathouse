import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash, compare } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ userId }); // Fetch user by UID

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const hashedPassword = await hash(newPassword, 10);
    await db.collection('users').updateOne(
      { userId }, // Update user by UID
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
