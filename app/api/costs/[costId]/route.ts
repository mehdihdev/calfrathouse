import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Cost from '@/models/Cost'

// Extract costId manually from URL
function extractCostId(url: string): string {
  const segments = url.split('/')
  return segments[segments.length - 1]
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase()

    const costId = extractCostId(req.url)
    if (!costId) {
      return NextResponse.json({ message: 'Cost ID is required' }, { status: 400 })
    }

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
