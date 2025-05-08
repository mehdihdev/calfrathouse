import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'

export async function GET(req: Request, context: { params: { choreId: string } }) {
  try {
    await connectToDatabase()
    const { choreId } = await context.params // Await params before accessing choreId
    const [userId, actualChoreId] = choreId.split(':') // Split choreId into userId and actualChoreId

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

export async function POST(req: Request, context: { params: { choreId: string } }) {
  try {
    await connectToDatabase()
    const { choreId } = context.params
    const [userId] = choreId.split(':') // Extract userId from choreId
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

export async function PATCH(req: Request, context: { params: { choreId: string } }) {
  try {
    await connectToDatabase()
    const { choreId } = await context.params // Await params before accessing choreId
    const [userId, actualChoreId] = choreId.split(':') // Split choreId into userId and actualChoreId

    const user = await User.findOne({ userId })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const chore = user.chores.id(actualChoreId)
    if (!chore) {
      return NextResponse.json({ message: 'Chore not found' }, { status: 404 })
    }

    chore.completed = !chore.completed // Toggle the completion status
    await user.save()

    return NextResponse.json(chore)
  } catch (err) {
    console.error('Error updating chore:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: { choreId: string } }) {
  try {
    await connectToDatabase()
    const { choreId } = context.params
    const [userId, actualChoreId] = choreId.split(':') // Split choreId into userId and actualChoreId

    // Remove the chore from all users' chores arrays
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
