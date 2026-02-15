import requests
import os

# Configuration
API_URL = "http://localhost:8000/api"
# Use the token from the previous session or a known test token
TOKEN = os.getenv("AUTH_TOKEN", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcwNzQ0NTIwLCJpYXQiOjE3NzA2NTgxMjAsImp0aSI6ImZjYTgxZTFkNDMyZDRmN2I4M2MxZjliZDMzMjczMGUyIiwidXNlcl9pZCI6IjQifQ.r0dno46yszy8REMGvwc-A-ZVRNwvU9gzKDlM1ecdcNs")

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def test_search():
    print("\n--- Testing Course Search ---")
    # Test title search
    response = requests.get(f"{API_URL}/courses/?search=Test", headers=headers)
    print(f"Search 'Test' status: {response.status_code}")
    courses = response.json()
    print(f"Found {len(courses)} courses")
    for c in courses:
        print(f" - {c['title']} (Category: {c['category']}, Level: {c['level']})")

def test_filtering():
    print("\n--- Testing Category & Level Filtering ---")
    # Test Category
    response = requests.get(f"{API_URL}/courses/?category=Design", headers=headers)
    print(f"Filter Category 'Design': {len(response.json())} results")
    
    # Test Level
    response = requests.get(f"{API_URL}/courses/?level=beginner", headers=headers)
    print(f"Filter Level 'beginner': {len(response.json())} results")

def test_analytics():
    print("\n--- Testing Instructor Analytics ---")
    response = requests.get(f"{API_URL}/analytics/", headers=headers)
    print(f"Analytics status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total Revenue: {data['total_revenue']}")
        print(f"Total Students: {data['total_students']}")
        print(f"Revenue Data Points: {len(data['revenue_data'])}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_search()
    test_filtering()
    test_analytics()
