import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string
if (!MONGODB_URI) throw new Error("MONGODB_URI not found in environment")

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache
}

const globalWithMongoose = global as typeof globalThis & { mongoose: MongooseCache }

const cached = globalWithMongoose.mongoose || (globalWithMongoose.mongoose = { conn: null, promise: null })

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }

  cached.conn = await cached.promise
  return cached.conn
}
