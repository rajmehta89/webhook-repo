import requests
import json
from datetime import datetime

# Test script to simulate GitHub webhook events
FLASK_URL = "http://localhost:5000"

def test_push_event():
    """Test push event webhook"""
    payload = {
        "ref": "refs/heads/main",
        "pusher": {
            "name": "test_user"
        },
        "sender": {
            "login": "test_user"
        },
        "head_commit": {
            "id": "abc123def456",
            "timestamp": datetime.now().isoformat() + "Z"
        }
    }
    
    headers = {
        "X-GitHub-Event": "push",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{FLASK_URL}/webhook", 
                           json=payload, 
                           headers=headers)
    
    print("Push Event Test:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

def test_pull_request_event():
    """Test pull request event webhook"""
    payload = {
        "action": "opened",
        "pull_request": {
            "id": 12345,
            "user": {
                "login": "test_user"
            },
            "head": {
                "ref": "feature-branch"
            },
            "base": {
                "ref": "main"
            },
            "created_at": datetime.now().isoformat() + "Z"
        }
    }
    
    headers = {
        "X-GitHub-Event": "pull_request",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{FLASK_URL}/webhook", 
                           json=payload, 
                           headers=headers)
    
    print("Pull Request Event Test:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

def test_merge_event():
    """Test merge event webhook"""
    payload = {
        "action": "closed",
        "pull_request": {
            "id": 12346,
            "merged": True,
            "user": {
                "login": "test_user"
            },
            "merged_by": {
                "login": "reviewer_user"
            },
            "head": {
                "ref": "feature-branch"
            },
            "base": {
                "ref": "main"
            },
            "merged_at": datetime.now().isoformat() + "Z"
        }
    }
    
    headers = {
        "X-GitHub-Event": "pull_request",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{FLASK_URL}/webhook", 
                           json=payload, 
                           headers=headers)
    
    print("Merge Event Test:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

def test_get_events():
    """Test getting events from API"""
    response = requests.get(f"{FLASK_URL}/events")
    
    print("Get Events Test:")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Events Count: {data.get('count', 0)}")
    print("-" * 50)

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{FLASK_URL}/health")
    
    print("Health Check Test:")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 50)

if __name__ == "__main__":
    print("Testing GitHub Webhook System")
    print("=" * 50)
    
    try:
        # Test health check first
        test_health_check()
        
        # Test webhook events
        test_push_event()
        test_pull_request_event()
        test_merge_event()
        
        # Test getting events
        test_get_events()
        
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure Flask server is running at", FLASK_URL)
    except Exception as e:
        print(f"❌ Test failed: {e}")
