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

// GET: Fetch all important dates
export async function GET() {
  try {
    const dates = await readImportantDates()
    return NextResponse.json({ dates })
  } catch (err) {
    console.error('Error reading important dates:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST: Add a new important date
export async function POST(req: Request) {
  try {
    const { title, date } = await req.json()
    if (!title || !date) {
      return NextResponse.json({ message: 'Title and date are required' }, { status: 400 })
    }

    const dates = await readImportantDates()
    const newDate = { id: Date.now().toString(), title, date }
    dates.push(newDate)
    await writeImportantDates(dates)

    return NextResponse.json({ message: 'Important date added successfully', date: newDate })
  } catch (err) {
    console.error('Error adding important date:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
