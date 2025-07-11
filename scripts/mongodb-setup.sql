-- MongoDB Setup Script
-- This is a reference for the MongoDB collections and indexes

-- Database: github_webhooks
-- Collection: events

-- Sample document structure:
{
  "_id": ObjectId("..."),
  "request_id": "push_1234567890",
  "author": "john_doe",
  "action": "push",
  "from_branch": null,
  "to_branch": "main",
  "timestamp": ISODate("2024-01-15T10:30:00.000Z")
}

-- Recommended indexes for better performance:
-- db.events.createIndex({ "timestamp": -1 })
-- db.events.createIndex({ "author": 1 })
-- db.events.createIndex({ "action": 1 })
