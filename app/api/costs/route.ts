import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Cost from '@/models/Cost'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const { name, appliedTo, createdBy } = body
    let { amount, timeframe } = body

    console.log('POST /api/costs request body:', body)

    amount = parseFloat(amount)
    timeframe = parseInt(timeframe, 10)

    if (!name || isNaN(amount) || isNaN(timeframe) || !createdBy) {
      return NextResponse.json(
        { message: 'Missing or invalid required fields', missingFields: { name, amount, timeframe, createdBy } },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 })
    }
    if (timeframe !== -1 && timeframe <= 0) {
      return NextResponse.json({ message: 'Timeframe must be -1 or greater than 0' }, { status: 400 })
    }

    const newCost = await Cost.create({ name, amount, appliedTo, timeframe, createdBy })
    return NextResponse.json({ message: 'Cost created successfully', cost: newCost })
  } catch (err) {
    console.error('Error creating cost:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectToDatabase()
    const costs = await Cost.find()
    return NextResponse.json({ costs })
  } catch (err) {
    console.error('Error fetching costs:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
