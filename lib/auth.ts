import bcrypt from 'bcrypt'
import User from '../models/User'
import { connectToDatabase } from './db'

export async function registerUser(data: any) {
  await connectToDatabase()
  const existing = await User.findOne({ email: data.email })
  if (existing) throw new Error("User already exists")

  const hashedPassword = await bcrypt.hash(data.password, 10)
  const user = new User({ ...data, password: hashedPassword })
  await user.save()
  return user
}

export async function loginUser(email: string, password: string) {
  await connectToDatabase()
  const user = await User.findOne({ email })
  if (!user) throw new Error("No user found")

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error("Incorrect password")

  return user
}