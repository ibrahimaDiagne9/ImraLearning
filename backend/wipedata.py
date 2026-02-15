import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

def wipe():
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'core_%';")
        tables = [row[0] for row in cursor.fetchall()]
        
        cursor.execute("PRAGMA foreign_keys = OFF;")
        for table in tables:
            try:
                cursor.execute(f"DELETE FROM {table};")
                print(f"Cleared {table}")
            except Exception as e:
                print(f"Could not clear {table}: {e}")
        cursor.execute("PRAGMA foreign_keys = ON;")
        print("All core_* tables wiped.")

if __name__ == "__main__":
    wipe()
