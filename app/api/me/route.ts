import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers' // Import cookies utility

export async function GET() {
  await connectToDatabase()

  const cookieStore = await cookies() // Await cookies utility
  const authToken = cookieStore.get('auth-token')?.value

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const user = await User.findOne({ userId: authToken })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
