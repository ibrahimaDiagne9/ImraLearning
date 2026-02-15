import os
import django
from django.test import Client
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User

def test_login():
    # Ensure there is a user to test with
    username = 'testuser_repro'
    password = 'password123'
    email = 'testuser_repro@example.com'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(username=username, email=email, password=password)
        print(f"Created user {username}")
    else:
        print(f"User {username} exists")

    client = Client()
    
    # 1. Login to get token
    print("\n--- Attempting Login ---")
    response = client.post(
        '/api/token/',
        {'username': username, 'password': password},
        content_type='application/json',
        HTTP_HOST='localhost'
    )
    
    if response.status_code != 200:
        print(f"Login Failed: {response.status_code}")
        # Print first 2000 characters to see the error message/traceback header
        print(response.content.decode('utf-8', errors='ignore')[:2000])
        return

    tokens = response.json()
    access_token = tokens.get('access')
    print(f"Login Successful. Got access token: {access_token[:20]}...")
    
    # 2. Fetch Profile
    print("\n--- Attempting Profile Fetch ---")
    headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}', 'HTTP_HOST': 'localhost'}
    response = client.get('/api/auth/profile/', **headers)
    
    if response.status_code != 200:
        print(f"Profile Fetch Failed: {response.status_code}")
        print(response.content)
    else:
        print("Profile Fetch Successful")
        print(response.json())

if __name__ == "__main__":
    test_login()
