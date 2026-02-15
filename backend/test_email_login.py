import os
import django
from django.test import Client
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

User = get_user_model()

def test_email_login():
    username = 'emailuser'
    email = 'emailuser@example.com'
    password = 'password123'
    
    # Clean up
    User.objects.filter(username=username).delete()
    
    # Create user
    user = User.objects.create_user(username=username, email=email, password=password)
    print(f"Created user {username} with email {email}")
    
    # Check membership creation (Signal test)
    try:
        if user.membership:
            print(f"SUCCESS: Membership created for {username}: {user.membership}")
    except Exception as e:
        print(f"FAILURE: Membership not created: {e}")

    client = Client()
    
    # 1. Login with proper username
    print("\n--- Testing Username Login ---")
    response = client.post(
        '/api/token/',
        {'username': username, 'password': password},
        content_type='application/json',
        HTTP_HOST='localhost'
    )
    if response.status_code == 200:
        print("SUCCESS: Login with username worked")
    else:
        print(f"FAILURE: Login with username failed: {response.status_code}")

    # 2. Login with EMAIL as username
    print("\n--- Testing Email Login ---")
    response = client.post(
        '/api/token/',
        {'username': email, 'password': password}, # Sending email in username field
        content_type='application/json',
        HTTP_HOST='localhost'
    )
    if response.status_code == 200:
        print("SUCCESS: Login with EMAIL worked")
    else:
        print(f"FAILURE: Login with EMAIL failed: {response.status_code}")
        print(response.content.decode('utf-8')[:200])

if __name__ == "__main__":
    test_email_login()
