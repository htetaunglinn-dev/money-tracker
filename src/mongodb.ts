import { MongoClient } from "mongodb"

let _promise: Promise<MongoClient> | null = null

function connect(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    return Promise.reject(
      new Error('MONGODB_URI is not set. Configure it in .env.local to enable database persistence.')
    )
  }

  if (_promise) return _promise

  const uri = process.env.MONGODB_URI

  if (process.env.NODE_ENV === "development") {
    const g = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> }
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri).connect()
    }
    _promise = g._mongoClientPromise
  } else {
    _promise = new MongoClient(uri).connect()
  }

  return _promise
}

// Lazy thenable — connect() is only called when this promise is awaited.
// Module loads cleanly even without MONGODB_URI.
const clientPromise = {
  then: <TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => connect().then(onfulfilled, onrejected),
  catch: <TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ) => connect().catch(onrejected),
  finally: (onfinally?: (() => void) | null) => connect().finally(onfinally),
} as Promise<MongoClient>

export default clientPromise
