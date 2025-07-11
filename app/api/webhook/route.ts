import { type NextRequest, NextResponse } from "next/server"
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

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const githubEvent = request.headers.get("x-github-event")

    console.log("Received webhook:", githubEvent, payload)

    if (!githubEvent) {
      return NextResponse.json({ error: "Missing GitHub event header" }, { status: 400 })
    }

    let eventData = null

    // Process different GitHub events
    switch (githubEvent) {
      case "push":
        if (payload.ref && payload.pusher) {
          const branch = payload.ref.replace("refs/heads/", "")
          eventData = {
            request_id: payload.head_commit?.id || `push_${Date.now()}`,
            author: payload.pusher.name || payload.sender?.login || "Unknown",
            action: "push",
            to_branch: branch,
            timestamp: new Date(payload.head_commit?.timestamp || new Date()),
          }
        }
        break

      case "pull_request":
        if (payload.action === "opened" || payload.action === "synchronize") {
          eventData = {
            request_id: `pr_${payload.pull_request.id}`,
            author: payload.pull_request.user.login,
            action: "pull_request",
            from_branch: payload.pull_request.head.ref,
            to_branch: payload.pull_request.base.ref,
            timestamp: new Date(payload.pull_request.created_at),
          }
        }
        break

      case "pull_request":
        // Handle merge event (when PR is merged)
        if (payload.action === "closed" && payload.pull_request.merged) {
          eventData = {
            request_id: `merge_${payload.pull_request.id}`,
            author: payload.pull_request.merged_by?.login || payload.pull_request.user.login,
            action: "merge",
            from_branch: payload.pull_request.head.ref,
            to_branch: payload.pull_request.base.ref,
            timestamp: new Date(payload.pull_request.merged_at),
          }
        }
        break
    }

    if (eventData) {
      // Store in MongoDB
      const mongoClient = await getMongoClient()
      const db = mongoClient.db(DB_NAME)
      const collection = db.collection(COLLECTION_NAME)

      await collection.insertOne(eventData)

      console.log("Event stored:", eventData)

      return NextResponse.json({
        success: true,
        message: "Webhook processed successfully",
        event: eventData,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Webhook received but not processed (unsupported event or action)",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "GitHub Webhook Endpoint",
    instructions: {
      url: "/api/webhook",
      method: "POST",
      contentType: "application/json",
      events: ["push", "pull_request"],
    },
  })
}
