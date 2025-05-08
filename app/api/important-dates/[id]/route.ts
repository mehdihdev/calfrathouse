import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'important-dates.json')

// Helper function to read important dates from the file
async function readImportantDates() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [] // Return an empty array if the file doesn't exist
    }
    throw err
  }
}

// Helper function to write important dates to the file
async function writeImportantDates(dates: any[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(dates, null, 2))
}

// DELETE: Remove an important date by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const dates = await readImportantDates()
    const filteredDates = dates.filter((date: any) => date.id !== id)

    if (dates.length === filteredDates.length) {
      return NextResponse.json({ message: 'Date not found' }, { status: 404 })
    }

    await writeImportantDates(filteredDates)
    return NextResponse.json({ message: 'Important date removed successfully' })
  } catch (err) {
    console.error('Error removing important date:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
