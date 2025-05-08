import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectToDatabase()

    const housemates = await User.find({}, { password: 0 })
    return NextResponse.json({ housemates })
  } catch (err) {
    console.error('Error fetching housemates:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
