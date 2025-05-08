import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function getSession() {
  const cookieStore = await cookies() // Await the cookies() call
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string }
    return { userId: decoded.userId }
  } catch (err) {
    console.error('Invalid token:', err)
    return null
  }
}
