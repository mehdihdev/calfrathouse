import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  await connectToDatabase()
  const user = await User.findOne() // TEMP: Replace with session-based logic
  return NextResponse.json({ user })
}
