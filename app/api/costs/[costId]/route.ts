import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Cost from '@/models/Cost'

export async function DELETE(req: Request, { params }: { params: { costId: string } }) {
  try {
    await connectToDatabase()

    const { costId } = params // Access params directly from the destructured argument

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
