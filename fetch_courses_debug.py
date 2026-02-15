
import requests
import json

try:
    response = requests.get('http://localhost:8000/api/courses/')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data[:2], indent=2)) # Print first 2 courses
except Exception as e:
    print(f"Error: {e}")
