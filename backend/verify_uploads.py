import requests
import os

BASE_URL = 'http://localhost:8000/api'
# Use the same token from previous successful runs
TOKEN = os.environ.get('AUTH_TOKEN') 

def test_file_uploads():
    if not TOKEN:
        print("Error: AUTH_TOKEN environment variable not set.")
        return

    headers = {'Authorization': f'Bearer {TOKEN}'}
    
    # 1. Fetch a course and its first lesson
    print("Fetching courses...")
    courses_res = requests.get(f'{BASE_URL}/courses/', headers=headers)
    if courses_res.status_code != 200:
        print(f"Failed to fetch courses: {courses_res.text}")
        return
    
    courses = courses_res.json()
    if not courses:
        print("No courses found. Create one first.")
        return
    
    course = courses[0]
    lesson = None
    for section in course.get('sections', []):
        if section.get('lessons'):
            lesson = section['lessons'][0]
            break
            
    if not lesson:
        print("No lessons found in the first course.")
        return
    
    lesson_id = lesson['id']
    print(f"Testing lesson: {lesson['title']} (ID: {lesson_id})")
    
    # 2. Upload a dummy video
    print("Uploading dummy video...")
    video_content = b"fake video content"
    files = {'video_file': ('test_video.mp4', video_content, 'video/mp4')}
    upload_res = requests.post(f'{BASE_URL}/lessons/{lesson_id}/video/', headers=headers, files=files)
    if upload_res.status_code == 200:
        print(f"Video upload success: {upload_res.json()['video_url']}")
    else:
        print(f"Video upload failed: {upload_res.text}")
        
    # 3. Add a resource
    print("Adding resource...")
    resource_content = b"fake resource content"
    files = {'file': ('manual.pdf', resource_content, 'application/pdf')}
    data = {'title': 'Test Manual', 'file_type': 'pdf', 'file_size': '0.1 MB'}
    res_add = requests.post(f'{BASE_URL}/lessons/{lesson_id}/resources/', headers=headers, files=files, data=data)
    if res_add.status_code == 201:
        resource = res_add.json()
        print(f"Resource added: {resource['title']} (ID: {resource['id']})")
        
        # 4. Delete the resource
        print("Deleting resource...")
        res_del = requests.delete(f'{BASE_URL}/resources/{resource["id"]}/', headers=headers)
        if res_del.status_code == 204:
            print("Resource deleted successfully.")
        else:
            print(f"Resource deletion failed: {res_del.text}")
    else:
        print(f"Resource addition failed: {res_add.text}")

if __name__ == "__main__":
    test_file_uploads()
