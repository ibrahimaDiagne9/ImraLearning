import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Login to get token
print("Logging in...")

# Try to register first (idempotent if user exists, but we need to handle potential 400 if user exists)
# simplified: just try to register, then login.
try:
    requests.post(f"{BASE_URL}/auth/register/", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "role": "student"
    })
except:
    pass

response = requests.post(f"{BASE_URL}/token/", json={
    "username": "testuser",
    "password": "password123"
})

if response.status_code != 200:
    print(f"Login failed. Status: {response.status_code}")
    print(f"Response: {response.text}")
    exit(1)
    
token = response.json().get("access")
if not token:
    print("No access token found in response")
    print(response.json())
    exit(1)
headers = {"Authorization": f"Bearer {token}"}
print("Logged in successfully.")

# 2. Get initial discussions (should be empty or have existing)
print("\nFetching discussions...")
response = requests.get(f"{BASE_URL}/discussions/", headers=headers)
print(f"Status: {response.status_code}")
initial_count = len(response.json())
print(f"Initial discussion count: {initial_count}")

# 3. Create a new General discussion (course=None)
print("\nCreating new General discussion...")
discussion_data = {
    "title": "General Discussion Test",
    "content": "This is a general discussion.",
    "course": None 
}
response = requests.post(f"{BASE_URL}/discussions/", json=discussion_data, headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 201:
    print("General Discussion created.")
    discussion_id = response.json()['id']
else:
    print(f"Failed to create General discussion: {response.text}")
    print("Trying with specific course if available...")

# Try to fetch courses to get a valid ID
print("\nFetching courses...")
courses_response = requests.get(f"{BASE_URL}/courses/", headers=headers)
courses = courses_response.json()
if courses:
    course_id = courses[0]['id']
    print(f"Found course with ID: {course_id}")
    discussion_data['course'] = course_id
    discussion_data['title'] = "Course Specific Discussion"
    response = requests.post(f"{BASE_URL}/discussions/", json=discussion_data, headers=headers)
    if response.status_code == 201:
        print("Course Specific Discussion created.")
        if 'discussion_id' not in locals():
             discussion_id = response.json()['id']
    else:
         print(f"Failed to create Course discussion: {response.text}")
else:
    print("No courses available to test course-specific discussion.")

if 'discussion_id' not in locals():
    exit(1)

# 4. Verify discussion appears in list
print("\nVerifying discussion in list...")
response = requests.get(f"{BASE_URL}/discussions/", headers=headers)
new_count = len(response.json())
print(f"New discussion count: {new_count}")
if new_count == initial_count + 1:
    print("SUCCESS: Discussion verified in list.")
else:
    print("FAILURE: Discussion not found in list.")

# 5. Add a reply
print("\nAdding a reply...")
reply_data = {"content": "This is a test reply."}
response = requests.post(f"{BASE_URL}/discussions/{discussion_id}/reply/", json=reply_data, headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 201:
    print("Reply added.")
else:
    print(f"Failed to add reply: {response.text}")

# 6. Verify reply in details
print("\nVerifying reply in discussion details...")
response = requests.get(f"{BASE_URL}/discussions/{discussion_id}/", headers=headers)
details = response.json()
if details['replies_count'] == 1:
     print("SUCCESS: Reply count updated.")
else:
     print(f"FAILURE: Reply count mismatch. Got {details['replies_count']}")

# 7. Test liking a discussion
print("\nTesting like discussion...")
response = requests.post(f"{BASE_URL}/discussions/{discussion_id}/like/", headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Discussion now has {data['likes_count']} likes. is_liked: {data['is_liked']}")
else:
    print(f"Failed to like discussion: {response.text}")

print("\nVerification complete.")
