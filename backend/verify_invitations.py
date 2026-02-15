import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_invitation():
    # 1. Login as instructor
    login_res = requests.post(f"{BASE_URL}/token/", data={
        "username": "instructor",
        "password": "password123"
    })
    if login_res.status_code != 200:
        print("Login failed")
        return
    token = login_res.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Invite a student
    print("Testing student invitation...")
    inv_data = {
        "email": "newstudent@example.com",
        "name": "New Student",
        "course_id": 1
    }
    res = requests.post(f"{BASE_URL}/courses/invite/", json=inv_data, headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code == 201:
        print("SUCCESS: Student invited and enrolled.")
        print(json.dumps(res.json(), indent=2))
    else:
        print(f"FAILURE: {res.text}")

if __name__ == "__main__":
    test_invitation()
