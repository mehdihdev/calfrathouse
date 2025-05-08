import { registerUser } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'


export async function POST(req: Request) {
  const body = await req.json()
  try {
    // Add hashed password and userId to the user object
    const userWithHashedPassword = {
      ...body,
      userId: uuidv4(), // Generate a unique userId
      admin: false, // Default to non-admin
      rentPaid: [], // Initialize as empty array
      chores: [], // Initialize as empty array
      costs: [] // Initialize as empty array
    }

    await registerUser(userWithHashedPassword)
    console.log('User successfully registered:', userWithHashedPassword) // Debug log
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error) {
      console.error('Signup error:', err.message)
    } else {
      console.error('Signup error:', err)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  
}