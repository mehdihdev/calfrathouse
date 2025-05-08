import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Cost from '@/models/Cost'

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { name, appliedTo, createdBy } = body
    let { amount, timeframe } = body

    // Log the incoming request body for debugging
    console.log('POST /api/costs request body:', body)

    // Parse amount and timeframe as numbers
    amount = parseFloat(amount)
    timeframe = parseInt(timeframe, 10)

    // Validate required fields
    if (!name || isNaN(amount) || isNaN(timeframe) || !createdBy) {
      return NextResponse.json(
        { message: 'Missing or invalid required fields', missingFields: { name, amount, timeframe, createdBy } },
        { status: 400 }
      )
    }

    // Validate amount and timeframe
    if (amount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 })
    }
    if (timeframe !== -1 && timeframe <= 0) {
      return NextResponse.json({ message: 'Timeframe must be -1 or greater than 0' }, { status: 400 })
    }

    // Create the cost
    const newCost = await Cost.create({ name, amount, appliedTo, timeframe, createdBy })
    return NextResponse.json({ message: 'Cost created successfully', cost: newCost })
  } catch (err) {
    console.error('Error creating cost:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: { costId: string } }) {
  try {
    await connectToDatabase()
    const { costId } = context.params

    // Validate costId
    if (!costId) {
      return NextResponse.json({ message: 'Cost ID is required' }, { status: 400 })
    }

    // Delete the cost
    const deletedCost = await Cost.findByIdAndDelete(costId)
    if (!deletedCost) {
      return NextResponse.json({ message: 'Cost not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Cost deleted successfully' })
  } catch (err) {
    console.error('Error deleting cost:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectToDatabase()

    // Fetch all costs from the database
    const costs = await Cost.find()

    // Ensure costs are returned in a consistent format
    return NextResponse.json({ costs })
  } catch (err) {
    console.error('Error fetching costs:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
