import { NextResponse } from 'next/server'
import User from '@/models/User'
import bcrypt from 'bcrypt'
import { connectToDatabase } from '@/lib/db'

export async function POST(req: Request) {
  try {
    console.log('Connecting to database...')
    await connectToDatabase()
    console.log('Database connected.')

    const { email, password } = await req.json()
    console.log('Received login request:', { email, password })

    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    console.log('User found:', user)

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password comparison result:', isPasswordValid)
    if (!isPasswordValid) {
      console.log('Invalid password for email:', email)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    console.log('Password validated for user:', user.userId)

    // Set the auth-token cookie
    const response = NextResponse.json({ success: true, user })
    response.cookies.set('auth-token', user.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict'
    })

    console.log('Login successful for user:', user.userId)
    return response
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}