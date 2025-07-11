import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "github_webhooks"
const COLLECTION_NAME = "events"

let client: MongoClient | null = null

async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

export async function GET() {
  try {
    const mongoClient = await getMongoClient()
    const db = mongoClient.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Fetch events sorted by timestamp (newest first)
    const events = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray()

    // Convert MongoDB ObjectId to string for JSON serialization
    const serializedEvents = events.map((event) => ({
      ...event,
      _id: event._id.toString(),
      timestamp: event.timestamp.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      events: serializedEvents,
      count: serializedEvents.length,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
