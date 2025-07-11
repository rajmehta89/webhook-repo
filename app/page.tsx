"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, GitPullRequest, GitMerge, Clock, User, RefreshCw, AlertCircle } from "lucide-react"

interface GitHubEvent {
  _id: string
  request_id: string
  author: string
  action: string
  from_branch?: string
  to_branch: string
  timestamp: string
}

export default function GitHubWebhookDashboard() {
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isPolling, setIsPolling] = useState(true)

  // Flask API URL - Update this to match your Flask server
  const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000"

  const fetchEvents = async () => {
    try {
      setError(null)
      const response = await fetch(`${FLASK_API_URL}/events`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
        setLastUpdated(new Date())
      } else {
        throw new Error("Failed to fetch events from API")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const manualRefresh = () => {
    setLoading(true)
    fetchEvents()
  }

  useEffect(() => {
    // Initial fetch
    fetchEvents()

    // Set up polling interval
    let interval: NodeJS.Timeout | null = null

    if (isPolling) {
      interval = setInterval(fetchEvents, 15000) // Poll every 15 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPolling])

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "push":
        return <GitBranch className="h-4 w-4" />
      case "pull_request":
        return <GitPullRequest className="h-4 w-4" />
      case "merge":
        return <GitMerge className="h-4 w-4" />
      default:
        return <GitBranch className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "push":
        return "bg-blue-500"
      case "pull_request":
        return "bg-green-500"
      case "merge":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatEventMessage = (event: GitHubEvent) => {
    const date = new Date(event.timestamp)
    const timestamp = date.toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })

    switch (event.action.toLowerCase()) {
      case "push":
        return `${event.author} pushed to ${event.to_branch} on ${timestamp}`
      case "pull_request":
        return `${event.author} submitted a pull request from ${event.from_branch} to ${event.to_branch} on ${timestamp}`
      case "merge":
        return `${event.author} merged branch ${event.from_branch} to ${event.to_branch} on ${timestamp}`
      default:
        return `${event.author} performed ${event.action} on ${timestamp}`
    }
  }

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GitHub events...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to Flask API at {FLASK_API_URL}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GitHub Webhook Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of repository activities via Flask API</p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>

              <Badge variant={isPolling ? "default" : "secondary"} className="flex items-center gap-1">
                <RefreshCw className={`h-3 w-3 ${isPolling ? "animate-spin" : ""}`} />
                {isPolling ? "Auto-refresh: 15s" : "Auto-refresh: OFF"}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={togglePolling}>
                {isPolling ? "Stop Polling" : "Start Polling"}
              </Button>
              <Button variant="outline" size="sm" onClick={manualRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-red-800 font-medium">Connection Error</p>
                <p className="text-red-600 text-sm">{error}</p>
                <p className="text-red-600 text-sm">Make sure your Flask server is running at {FLASK_API_URL}</p>
              </div>
            </div>
          )}
        </div>

        {events.length === 0 && !error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600">Webhook events will appear here when repository activities occur.</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure your GitHub webhook is configured to send events to: {FLASK_API_URL}/webhook
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getActionColor(event.action)} text-white`}>
                      {getActionIcon(event.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {event.action.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User className="h-3 w-3" />
                          <span>{event.author}</span>
                        </div>
                      </div>
                      <p className="text-gray-900 font-medium">{formatEventMessage(event)}</p>
                      <div className="mt-2 text-xs text-gray-500">Request ID: {event.request_id}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Flask API Integration</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Flask Server:</strong> {FLASK_API_URL}
            </p>
            <p>
              <strong>Webhook URL:</strong> {FLASK_API_URL}/webhook
            </p>
            <p>
              <strong>Events API:</strong> {FLASK_API_URL}/events
            </p>
            <p>
              <strong>Health Check:</strong> {FLASK_API_URL}/health
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
