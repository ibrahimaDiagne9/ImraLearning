import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_tokens():
    # Attempt to use existing user or create one
    reg_data = {
        "username": "studio_tester",
        "password": "testpassword123",
        "email": "tester@example.com"
    }
    requests.post(f"{BASE_URL}/auth/register/", json=reg_data)
    
    response = requests.post(f"{BASE_URL}/token/", json={
        "username": "studio_tester",
        "password": "testpassword123"
    })
    return response.json()

def test_nested_updates():
    tokens = get_tokens()
    headers = {"Authorization": f"Bearer {tokens['access']}"}
    
    # 1. Create a course
    course_data = {
        "title": "Nested Studio Course",
        "description": "Testing nested updates",
        "category": "Testing",
        "level": "intermediate",
        "price": "19.99",
        "duration_hours": 5,
        "sections": [
            {
                "title": "Section 1",
                "order": 0,
                "lessons": [
                    {"title": "Lesson 1.1", "lesson_type": "video", "order": 0},
                    {"title": "Lesson 1.2", "lesson_type": "article", "order": 1}
                ]
            }
        ]
    }
    
    create_res = requests.post(f"{BASE_URL}/courses/", json=course_data, headers=headers)
    assert create_res.status_code == 201
    course_id = create_res.json()['id']
    print(f"Created Course ID: {course_id}")
    
    # 2. Update the course (Add section, remove lesson, rename section)
    sections = create_res.json()['sections']
    section1_id = sections[0]['id']
    lesson1_1_id = sections[0]['lessons'][0]['id']
    
    update_data = {
        "title": "Updated Nested Studio Course",
        "description": "Testing nested updates updated",
        "category": "Testing Updated",
        "sections": [
            {
                "id": section1_id,
                "title": "Renamed Section 1",
                "order": 0,
                "lessons": [
                    {"id": lesson1_1_id, "title": "Updated Lesson 1.1", "lesson_type": "video", "order": 0},
                    {"title": "New Lesson 1.3", "lesson_type": "article", "order": 1}
                ]
            },
            {
                "title": "Section 2",
                "order": 1,
                "lessons": []
            }
        ]
    }
    
    update_res = requests.put(f"{BASE_URL}/courses/{course_id}/", json=update_data, headers=headers)
    if update_res.status_code != 200:
        print(f"Update failed with status {update_res.status_code}: {update_res.text}")
        return

    updated_json = update_res.json()
    
    # Verify changes
    try:
        assert updated_json['title'] == "Updated Nested Studio Course"
        assert len(updated_json['sections']) == 2
        assert updated_json['sections'][0]['title'] == "Renamed Section 1"
        assert len(updated_json['sections'][0]['lessons']) == 2
        assert updated_json['sections'][0]['lessons'][0]['title'] == "Updated Lesson 1.1"
        assert updated_json['sections'][1]['title'] == "Section 2"
        print("SUCCESS: Nested curriculum updates verified!")
    except AssertionError as e:
        print(f"Assertion failed! JSON response: {json.dumps(updated_json, indent=2)}")
        raise e

if __name__ == "__main__":
    test_nested_updates()
