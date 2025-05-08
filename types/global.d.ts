// types/global.d.ts
import type { MongoClient } from 'mongodb'

declare global {
  namespace NodeJS {
    interface Global {
      _mongoClientPromise?: Promise<MongoClient>
    }
  }

  interface Global {
    _mongoClientPromise?: Promise<MongoClient>
  }

  // Also support globalThis
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export {}
