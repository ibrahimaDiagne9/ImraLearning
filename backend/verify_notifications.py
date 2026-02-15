import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_notifications():
    # 1. Register/Login as User A (Receiver)
    print("Setting up User A (Receiver)...")
    user_a = {"username": "usera", "password": "password123", "email": "usera@example.com"}
    try: requests.post(f"{BASE_URL}/auth/register/", json=user_a)
    except: pass
    
    res_a = requests.post(f"{BASE_URL}/token/", json={"username": user_a["username"], "password": user_a["password"]})
    token_a = res_a.json()["access"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register/Login as User B (Actor)
    print("Setting up User B (Actor)...")
    user_b = {"username": "userb", "password": "password123", "email": "userb@example.com"}
    try: requests.post(f"{BASE_URL}/auth/register/", json=user_b)
    except: pass
    
    res_b = requests.post(f"{BASE_URL}/token/", json={"username": user_b["username"], "password": user_b["password"]})
    token_b = res_b.json()["access"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User A creates a discussion
    print("\nUser A creating a discussion...")
    disc_res = requests.post(f"{BASE_URL}/discussions/", headers=headers_a, json={
        "title": "Welcome to my discussion",
        "content": "Let's talk about notifications"
    })
    discussion_id = disc_res.json()["id"]

    # 4. User B replies to User A's discussion
    print("User B replying to User A's discussion...")
    requests.post(f"{BASE_URL}/discussions/{discussion_id}/reply/", headers=headers_b, json={
        "content": "This is a reply that should trigger a notification"
    })

    # 5. User B likes User A's discussion
    print("User B liking User A's discussion...")
    requests.post(f"{BASE_URL}/discussions/{discussion_id}/like/", headers=headers_b)

    # 6. Check User A's notifications
    print("\nChecking User A's notifications...")
    time.sleep(1)  # small delay for signals
    notif_res = requests.get(f"{BASE_URL}/notifications/", headers=headers_a)
    notifications = notif_res.json()
    print(f"Found {len(notifications)} notifications for User A.")
    
    for n in notifications:
        print(f"- [{n['type']}] {n['title']}: {n['description']} (Read: {n['is_read']})")

    # 7. Mark one as read
    if notifications:
        notif_id = notifications[0]["id"]
        print(f"\nMarking notification {notif_id} as read...")
        requests.post(f"{BASE_URL}/notifications/{notif_id}/read/", headers=headers_a)
        
        # Verify
        check_res = requests.get(f"{BASE_URL}/notifications/", headers=headers_a)
        v_notifs = check_res.json()
        updated_n = next(x for x in v_notifs if x["id"] == notif_id)
        print(f"Updated Notification Read Status: {updated_n['is_read']}")

    print("\nSUCCESS: Notification flow verified!")

if __name__ == "__main__":
    test_notifications()
