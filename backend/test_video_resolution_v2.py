import os
import sys

# Mocking environment for JS-like logic testing in Python (Simplified)
def mock_get_video_url(videoUrl=None, videoFile=None):
    isExternal = lambda u: u and any(x in u for x in ['youtube.com', 'youtu.be', 'vimeo.com', 'cloudinary.com'])
    base_url = "http://localhost:8000"
    
    if isExternal(videoUrl): return videoUrl
    
    if videoFile:
        if videoFile.startswith('http'): return videoFile
        # Fix logic matching JS rebuild
        name_part = videoFile if videoFile.startswith('/') else f"/{videoFile}"
        clean_path = name_part if name_part.startswith('/media/') else f"/media{name_part}"
        return f"{base_url}{clean_path}"
        
    if not videoUrl: return ''
    
    if any(videoUrl.startswith(x) for x in ['http://', 'https://', 'blob:']):
        return videoUrl
        
    if videoUrl.startswith('/media/') or videoUrl.startswith('media/'):
        clean_url = videoUrl if videoUrl.startswith('/') else f"/{videoUrl}"
        return f"{base_url}{clean_url}"
        
    return videoUrl

def test_resolution_v2():
    cases = [
        {"name": "YouTube URL", "url": "https://youtube.com/watch?v=123", "file": None, "expected": "https://youtube.com/watch?v=123"},
        {"name": "Local File (Raw)", "url": "", "file": "videos/test.mp4", "expected": "http://localhost:8000/media/videos/test.mp4"},
        {"name": "Local File (With Slash)", "url": "", "file": "/videos/test.mp4", "expected": "http://localhost:8000/media/videos/test.mp4"},
        {"name": "Local File (Already with media)", "url": "", "file": "media/videos/test.mp4", "expected": "http://localhost:8000/media/videos/test.mp4"},
        {"name": "External URL + File (Priority YouTube)", "url": "https://youtube.com/123", "file": "videos/ignore.mp4", "expected": "https://youtube.com/123"},
    ]
    
    failed = 0
    for c in cases:
        result = mock_get_video_url(c["url"], c["file"])
        if result == c["expected"]:
            print(f"PASS: {c['name']}")
        else:
            print(f"FAIL: {c['name']} | Expected: {c['expected']} | Got: {result}")
            failed += 1
            
    if failed == 0:
        print("\nAll video resolution scenarios passed with /media/ prefix!")
    else:
        print(f"\n{failed} cases failed.")

if __name__ == "__main__":
    test_resolution_v2()
