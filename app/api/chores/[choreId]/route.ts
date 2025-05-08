import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'

// Extract choreId from the URL manually
function extractChoreIdFromUrl(url: string): string {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()
    const choreId = extractChoreIdFromUrl(req.url)
    const [userId, actualChoreId] = choreId.split(':')

    const user = await User.findOne({ userId })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const chore = user.chores.id(actualChoreId)
    if (!chore) {
      return NextResponse.json({ message: 'Chore not found' }, { status: 404 })
    }

    return NextResponse.json(chore)
  } catch (err) {
    console.error('Error fetching chore:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const choreId = extractChoreIdFromUrl(req.url)
    const [userId] = choreId.split(':')
    const { name, dueDate } = await req.json()

    if (!name || !dueDate) {
      return NextResponse.json({ message: 'Name and due date are required' }, { status: 400 })
    }

    const user = await User.findOne({ userId })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const newChore = { _id: new Date().toISOString(), name, dueDate, completed: false }
    user.chores.push(newChore)
    await user.save()

    return NextResponse.json(newChore)
  } catch (err) {
    console.error('Error adding chore:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase()
    const choreId = extractChoreIdFromUrl(req.url)
    const [userId, actualChoreId] = choreId.split(':')

    const user = await User.findOne({ userId })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const chore = user.chores.id(actualChoreId)
    if (!chore) {
      return NextResponse.json({ message: 'Chore not found' }, { status: 404 })
    }

    chore.completed = !chore.completed
    await user.save()

    return NextResponse.json(chore)
  } catch (err) {
    console.error('Error updating chore:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase()
    const choreId = extractChoreIdFromUrl(req.url)
    const [, actualChoreId] = choreId.split(':')

    await User.updateMany(
      { 'chores._id': actualChoreId },
      { $pull: { chores: { _id: actualChoreId } } }
    )

    return NextResponse.json({ message: 'Chore deleted successfully for everyone' })
  } catch (err) {
    console.error('Error deleting chore:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
