"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Github, Database, Webhook, Terminal, Play } from "lucide-react"
import { useState } from "react"

export default function SetupPage() {
  const [copied, setCopied] = useState("")

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const flaskUrl = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000"
  const webhookUrl = `${flaskUrl}/webhook`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Setup Guide</h1>
          <p className="text-gray-600">Follow these steps to set up your GitHub webhook system with Flask backend</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Python Environment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Step 1: Python Environment Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Set up your Python environment and install dependencies.</p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Create Virtual Environment</label>
                  <div className="bg-gray-100 p-3 rounded-lg mt-1">
                    <code className="text-sm">python -m venv webhook_env</code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Activate Virtual Environment</label>
                  <div className="bg-gray-100 p-3 rounded-lg mt-1">
                    <code className="text-sm">
                      # Windows
                      <br />
                      webhook_env\Scripts\activate
                      <br />
                      <br /># macOS/Linux
                      <br />
                      source webhook_env/bin/activate
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Install Dependencies</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 p-3 rounded text-sm">
                      pip install Flask Flask-CORS pymongo python-dotenv gunicorn
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard("pip install Flask Flask-CORS pymongo python-dotenv gunicorn", "pip")
                      }
                    >
                      <Copy className="h-4 w-4" />
                      {copied === "pip" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: MongoDB Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Step 2: MongoDB Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Configure MongoDB connection and set up the database.</p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Environment Variable</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 p-3 rounded text-sm">
                      MONGODB_URI=mongodb://localhost:27017
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard("MONGODB_URI=mongodb://localhost:27017", "mongodb")}
                    >
                      <Copy className="h-4 w-4" />
                      {copied === "mongodb" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Setup Database</label>
                  <div className="bg-gray-100 p-3 rounded-lg mt-1">
                    <code className="text-sm">python setup_mongodb.py</code>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> For production, use MongoDB Atlas or your preferred MongoDB hosting service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Flask Server */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Step 3: Start Flask Server
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Run the Flask webhook server to handle GitHub events.</p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Development Server</label>
                  <div className="bg-gray-100 p-3 rounded-lg mt-1">
                    <code className="text-sm">python flask-webhook-server.py</code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Production Server (Optional)</label>
                  <div className="bg-gray-100 p-3 rounded-lg mt-1">
                    <code className="text-sm">gunicorn -w 4 -b 0.0.0.0:5000 flask-webhook-server:app</code>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Server will be available at: <strong>{flaskUrl}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: GitHub Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Step 4: GitHub Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-gray-100 p-3 rounded text-sm">{webhookUrl}</code>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl, "webhook")}>
                      <Copy className="h-4 w-4" />
                      {copied === "webhook" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <div className="mt-1">
                      <Badge variant="secondary">application/json</Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Events</label>
                    <div className="flex gap-2 mt-1">
                      <Badge>Pushes</Badge>
                      <Badge>Pull requests</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">GitHub Configuration Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Go to your GitHub repository → Settings → Webhooks</li>
                  <li>Click "Add webhook"</li>
                  <li>
                    Paste the webhook URL: <code className="bg-gray-100 px-1 rounded">{webhookUrl}</code>
                  </li>
                  <li>Set Content type to "application/json"</li>
                  <li>Select "Let me select individual events"</li>
                  <li>Check "Pushes" and "Pull requests"</li>
                  <li>Click "Add webhook"</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Frontend Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Step 5: Frontend Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Configure the frontend to connect to your Flask API.</p>

              <div>
                <label className="text-sm font-medium text-gray-700">Environment Variable</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-gray-100 p-3 rounded text-sm">NEXT_PUBLIC_FLASK_API_URL={flaskUrl}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`NEXT_PUBLIC_FLASK_API_URL=${flaskUrl}`, "frontend")}
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "frontend" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <a href="/" className="flex items-center gap-2">
                    View Dashboard
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={`${flaskUrl}/health`} target="_blank" className="flex items-center gap-2" rel="noreferrer">
                    Test Flask API
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 6: Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Step 6: Testing the System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Test your complete webhook system:</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700">API Endpoints to Test:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>
                      <code>{flaskUrl}/health</code> - Health check
                    </li>
                    <li>
                      <code>{flaskUrl}/events</code> - Get all events
                    </li>
                    <li>
                      <code>{flaskUrl}/webhook</code> - Webhook endpoint
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">GitHub Actions to Test:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                    <li>Push commits to any branch</li>
                    <li>Create a pull request</li>
                    <li>Merge a pull request</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
