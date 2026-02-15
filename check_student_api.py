
import requests
import json

BASE_URL = 'http://localhost:8000/api'
# We'll need a token if possible, but let's see if we can get anything without it or if we can find one in logs
# Actually, I can just check if the server CRASHES (connection reset) or returns 500.
# Since I don't have a student token easily at hand, I'll check what I can.

endpoints = [
    '/courses/',
    '/discussions/',
    '/leaderboard/',
    '/live-sessions/?is_live=true',
    '/quizzes/student-analytics/',
    '/certificates/',
    '/dashboard/pending-tasks/',
    '/dashboard/upcoming-classes/',
    '/dashboard/recent-activity/',
]

for ep in endpoints:
    try:
        url = BASE_URL + ep
        # Use a dummy token or just see if it fails with 401 (good) vs 500 (bad)
        response = requests.get(url)
        print(f"{ep}: {response.status_code}")
        if response.status_code == 500:
            print(f"!!! 500 ERROR at {ep}")
            print(response.text[:500])
    except Exception as e:
        print(f"Error checking {ep}: {e}")
