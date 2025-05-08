import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Chore from '@/models/Chore'
import User from '@/models/User'
import { Types } from 'mongoose' // Import Types for ObjectId

export async function GET(req: Request) {
  try {
    await connectToDatabase()

    const url = new URL(req.url)
    const userId = url.searchParams.get('userId') // Get userId from query params

    if (userId) {
      const user = await User.findOne({ userId })
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ chores: user.chores || [] })
    }

    const chores = await Chore.find().sort({ dueDate: 1 }) // Fetch all chores sorted by due date
    return NextResponse.json({ chores })
  } catch (err) {
    console.error('Error fetching chores:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const { name, assignedTo, dueDate, repeat, userId } = await req.json()

    if (!name || !dueDate || !userId) {
      return NextResponse.json({ message: 'Name, due date, and userId are required' }, { status: 400 })
    }

    const user = await User.findOne({ userId })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    let assignedUsers = []

    // Check if the chore is assigned to a room
    if (assignedTo.some((id: string) => id.startsWith('Room'))) {
      const roomNumber = assignedTo.find((id: string) => id.startsWith('Room'))?.split(' ')[1]
      const roomUsers = await User.find({ roomNumber })
      assignedUsers = roomUsers.map((roomUser) => roomUser.userId)
    } else {
      assignedUsers = assignedTo
    }

    // Generate repeated instances of the chore
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const repeatedChores: {
      _id: Types.ObjectId
      name: string
      dueDate: string
      completed: boolean
      repeat: string
      assignedTo: string[]
    }[] = []
    
    const currentDate = new Date(dueDate)

    while (currentDate <= endOfMonth) {
      repeatedChores.push({
        _id: new Types.ObjectId(),
        name,
        dueDate: currentDate.toISOString(),
        completed: false,
        repeat: repeat || 'none',
        assignedTo: assignedUsers,
      })

      // Increment the date based on the repeat frequency
      if (repeat === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else if (repeat === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14)
      } else if (repeat === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      } else {
        break
      }
    }

    // Add the repeated chores to all assigned users
    await Promise.all(
      assignedUsers.map((id: string) =>
        User.updateOne(
          { userId: id },
          { $push: { chores: { $each: repeatedChores } } }
        )
      )
    )

    return NextResponse.json({ message: 'Chore added successfully', repeatedChores })
  } catch (err) {
    console.error('Error creating chore:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
