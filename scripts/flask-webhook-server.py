from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
import json
import hashlib

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = 'github_webhooks'
COLLECTION_NAME = 'events'

# Initialize MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def process_push_event(payload):
    """Process GitHub push event"""
    try:
        branch = payload['ref'].replace('refs/heads/', '')
        author = payload.get('pusher', {}).get('name') or payload.get('sender', {}).get('login', 'Unknown')
        
        # Get commit timestamp
        timestamp = datetime.now()
        if payload.get('head_commit') and payload['head_commit'].get('timestamp'):
            timestamp = datetime.fromisoformat(payload['head_commit']['timestamp'].replace('Z', '+00:00'))
        
        event_data = {
            'request_id': payload.get('head_commit', {}).get('id', f"push_{int(datetime.now().timestamp())}"),
            'author': author,
            'action': 'push',
            'from_branch': None,
            'to_branch': branch,
            'timestamp': timestamp
        }
        
        return event_data
    except Exception as e:
        print(f"Error processing push event: {e}")
        return None

def process_pull_request_event(payload):
    """Process GitHub pull request event"""
    try:
        action = payload.get('action')
        pull_request = payload.get('pull_request', {})
        
        if action in ['opened', 'synchronize']:
            # New pull request or updated
            event_data = {
                'request_id': f"pr_{pull_request.get('id')}",
                'author': pull_request.get('user', {}).get('login', 'Unknown'),
                'action': 'pull_request',
                'from_branch': pull_request.get('head', {}).get('ref'),
                'to_branch': pull_request.get('base', {}).get('ref'),
                'timestamp': datetime.fromisoformat(pull_request.get('created_at', datetime.now().isoformat()).replace('Z', '+00:00'))
            }
            return event_data
            
        elif action == 'closed' and pull_request.get('merged'):
            # Pull request merged
            merged_at = pull_request.get('merged_at')
            timestamp = datetime.now()
            if merged_at:
                timestamp = datetime.fromisoformat(merged_at.replace('Z', '+00:00'))
                
            event_data = {
                'request_id': f"merge_{pull_request.get('id')}",
                'author': pull_request.get('merged_by', {}).get('login') or pull_request.get('user', {}).get('login', 'Unknown'),
                'action': 'merge',
                'from_branch': pull_request.get('head', {}).get('ref'),
                'to_branch': pull_request.get('base', {}).get('ref'),
                'timestamp': timestamp
            }
            return event_data
            
        return None
    except Exception as e:
        print(f"Error processing pull request event: {e}")
        return None

@app.route('/webhook', methods=['POST'])
def github_webhook():
    """Handle GitHub webhook events"""
    try:
        # Get GitHub event type from headers
        github_event = request.headers.get('X-GitHub-Event')
        payload = request.get_json()
        
        if not github_event or not payload:
            return jsonify({'error': 'Invalid webhook payload'}), 400
        
        print(f"Received {github_event} event")
        
        event_data = None
        
        # Process different event types
        if github_event == 'push':
            event_data = process_push_event(payload)
        elif github_event == 'pull_request':
            event_data = process_pull_request_event(payload)
        
        # Store event in MongoDB if processed successfully
        if event_data:
            # Insert into MongoDB
            result = collection.insert_one(event_data)
            print(f"Event stored with ID: {result.inserted_id}")
            
            return jsonify({
                'success': True,
                'message': 'Webhook processed successfully',
                'event_id': str(result.inserted_id),
                'event_data': {
                    **event_data,
                    'timestamp': event_data['timestamp'].isoformat()
                }
            }), 200
        else:
            return jsonify({
                'success': True,
                'message': 'Webhook received but not processed'
            }), 200
            
    except Exception as e:
        print(f"Webhook processing error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/events', methods=['GET'])
def get_events():
    """Get all events from MongoDB"""
    try:
        # Get query parameters
        limit = int(request.args.get('limit', 50))
        
        # Fetch events sorted by timestamp (newest first)
        events = list(collection.find({}).sort('timestamp', -1).limit(limit))
        
        # Convert ObjectId and datetime to string for JSON serialization
        for event in events:
            event['_id'] = str(event['_id'])
            event['timestamp'] = event['timestamp'].isoformat()
        
        return jsonify({
            'success': True,
            'events': events,
            'count': len(events)
        }), 200
        
    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({'error': 'Failed to fetch events'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/', methods=['GET'])
def index():
    """API information endpoint"""
    return jsonify({
        'message': 'GitHub Webhook API',
        'version': '1.0.0',
        'endpoints': {
            'webhook': '/webhook (POST)',
            'events': '/events (GET)',
            'health': '/health (GET)'
        },
        'webhook_setup': {
            'url': request.url_root + 'webhook',
            'content_type': 'application/json',
            'events': ['push', 'pull_request']
        }
    })

if __name__ == '__main__':
    print("Starting GitHub Webhook Server...")
    print(f"MongoDB URI: {MONGODB_URI}")
    print(f"Database: {DB_NAME}")
    print(f"Collection: {COLLECTION_NAME}")
    
    # Test MongoDB connection
    try:
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
