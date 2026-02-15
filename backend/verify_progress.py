import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_progress():
    # 1. Login
    print("Logging in...")
    try:
        requests.post(f"{BASE_URL}/auth/register/", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "role": "student"
        })
    except:
        pass

    login_data = {"username": "testuser", "password": "password123"}
    response = requests.post(f"{BASE_URL}/token/", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    token = response.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in successfully.")

    # 2. Get User Initial XP
    user_res = requests.get(f"{BASE_URL}/auth/profile/", headers=headers)
    initial_xp = user_res.json()["xp_points"]
    print(f"Initial XP: {initial_xp}")

    # 3. Get Courses to find a lesson
    print("\nFetching courses...")
    courses_res = requests.get(f"{BASE_URL}/courses/", headers=headers)
    courses = courses_res.json()
    if not courses:
        print("No courses found. Run verify_discussions.py first to seed data if needed.")
        return
    
    course_id = courses[0]["id"]
    course_detail_res = requests.get(f"{BASE_URL}/courses/{course_id}/", headers=headers)
    course_detail = course_detail_res.json()
    
    if not course_detail["sections"]:
        print("No sections found in course.")
        return
    
    lesson = course_detail["sections"][0]["lessons"][0]
    lesson_id = lesson["id"]
    print(f"Testing with Lesson: {lesson['title']} (ID: {lesson_id})")
    print(f"Lesson initially completed: {lesson.get('is_completed', False)}")

    # 4. Toggle Completion
    print("\nToggling completion...")
    toggle_res = requests.post(f"{BASE_URL}/lessons/{lesson_id}/toggle-completion/", headers=headers)
    if toggle_res.status_code == 200:
        data = toggle_res.json()
        print(f"Toggle successful. is_completed: {data['is_completed']}, New XP: {data['xp']}")
    else:
        try:
            print(f"Toggle failed: {toggle_res.text}")
        except:
            print(f"Toggle failed with status {toggle_res.status_code}")
        return

    # 5. Verify in Course Detail
    print("\nVerifying in Course Detail...")
    v_course_res = requests.get(f"{BASE_URL}/courses/{course_id}/", headers=headers)
    v_course = v_course_res.json()
    print(f"Course progress percentage: {v_course['progress_percentage']}%")
    
    v_lesson = v_course["sections"][0]["lessons"][0]
    print(f"Lesson is_completed (serialized): {v_lesson['is_completed']}")

    if v_lesson['is_completed'] == data['is_completed']:
        print("\nSUCCESS: Progression tracking is working!")
    else:
        print("\nFAILURE: Serialized status mismatch.")

if __name__ == "__main__":
    test_progress()
