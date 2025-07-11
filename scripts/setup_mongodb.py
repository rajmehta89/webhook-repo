from pymongo import MongoClient
import os
from datetime import datetime

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = 'github_webhooks'
COLLECTION_NAME = 'events'

def setup_mongodb():
    """Setup MongoDB database and collections"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        print(f"Connected to MongoDB: {MONGODB_URI}")
        print(f"Database: {DB_NAME}")
        print(f"Collection: {COLLECTION_NAME}")
        
        # Create indexes for better performance
        collection.create_index([("timestamp", -1)])  # Descending timestamp
        collection.create_index([("author", 1)])       # Author index
        collection.create_index([("action", 1)])       # Action type index
        collection.create_index([("request_id", 1)])   # Request ID index
        
        print("✅ Indexes created successfully")
        
        # Insert sample data for testing
        sample_events = [
            {
                'request_id': 'sample_push_1',
                'author': 'john_doe',
                'action': 'push',
                'from_branch': None,
                'to_branch': 'main',
                'timestamp': datetime.now()
            },
            {
                'request_id': 'sample_pr_1',
                'author': 'jane_smith',
                'action': 'pull_request',
                'from_branch': 'feature-branch',
                'to_branch': 'main',
                'timestamp': datetime.now()
            }
        ]
        
        # Insert sample data only if collection is empty
        if collection.count_documents({}) == 0:
            collection.insert_many(sample_events)
            print("✅ Sample data inserted")
        else:
            print("📊 Collection already contains data")
        
        # Display collection stats
        count = collection.count_documents({})
        print(f"📈 Total events in collection: {count}")
        
        return True
        
    except Exception as e:
        print(f"❌ MongoDB setup failed: {e}")
        return False

if __name__ == '__main__':
    print("Setting up MongoDB for GitHub Webhooks...")
    success = setup_mongodb()
    
    if success:
        print("\n🎉 MongoDB setup completed successfully!")
        print("\nNext steps:")
        print("1. Run the Flask server: python flask-webhook-server.py")
        print("2. Configure GitHub webhook to point to your server")
        print("3. Start the frontend application")
    else:
        print("\n❌ MongoDB setup failed. Please check your connection.")
