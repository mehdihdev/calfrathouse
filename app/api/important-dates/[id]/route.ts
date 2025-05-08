import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'important-dates.json')

type ImportantDate = {
  id: string
  title: string
  date: string
}

async function readImportantDates(): Promise<ImportantDate[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    const error = err as Error & { code?: string }
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function writeImportantDates(dates: ImportantDate[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(dates, null, 2))
}

export async function DELETE(req: NextRequest) {
  try {
    // ✅ Manually extract the ID from the URL
    const url = new URL(req.url)
    const segments = url.pathname.split('/')
    const id = segments.pop() || segments.pop() // support trailing slash

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const dates = await readImportantDates()
    const filteredDates = dates.filter((date) => date.id !== id)

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
