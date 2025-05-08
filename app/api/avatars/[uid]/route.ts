import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params
    if (!uid) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('avatar') as File
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars')

    // Ensure the avatars directory exists
    await fs.mkdir(avatarsDir, { recursive: true })

    // Save the file
    const filePath = path.join(avatarsDir, `${uid}`)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ message: 'File uploaded successfully' })
  } catch (err) {
    console.error('Error uploading file:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
