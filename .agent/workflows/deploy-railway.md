---
description: How to deploy the ImraLearning backend to Railway with migrations
---

Follow these steps to ensure your backend is correctly deployed and the database is migrated on Railway.

### 1. Initial Backend Service Setup
If you haven't added the backend as a separate service yet:
1.  Click **"New"** (top right) -> **"GitHub Repo"** -> Choose `ImraLearning`.
2.  Immediately go to the **Settings** tab of this new service.
3.  Change the **"Root Directory"** to `/backend`.
4.  Go to the **Variables** tab.
5.  Click **"New Variable"** -> **"Add reference"** -> Choose `Postgres` -> `DATABASE_URL`.
6.  Add these additional variables (copy from your local `.env`):
    - `SECRET_KEY`
    - `ALLOWED_HOSTS` = `*`
    - `DEBUG` = `False`
    - `NIXPACKS_PYTHON_MANAGE_PY_MIGRATE` = `0` (Critical to avoid build failures)
    - `CORS_ALLOWED_ORIGINS` = `https://imraedu.com` (your frontend URL)
    - `CSRF_TRUSTED_ORIGINS` = `https://imraedu.com`

### 2. Commit Your Changes
Make sure you have committed the updated `backend/Procfile`.
```bash
cd backend
git add Procfile
git commit -m "chore: automate migrations in Procfile"
git push
```

### 2. Verify the Release Stage
Once you push to your repository connected to Railway:
- Go to the **Railway Dashboard**.
- Select your backend service.
- Click on the **Deployments** tab.
- Look for the **"Release"** step in the deployment logs. It should show `python manage.py migrate` running successfully.

### 3. Manual Migration (If needed)
If the tables are still not created, you can run migrations manually via the Railway CLI or Dashboard:

#### Via Railway CLI:
```bash
railway run python manage.py migrate
```

#### Via Railway Dashboard:
- Go to your service.
- Open the **"Terminal"** or **"Console"** tab.
- Type: `python manage.py migrate` and press Enter.

### 4. Create a Superuser (Production)
To access the admin panel in production, you might need to create a new superuser on Railway:
```bash
railway run python manage.py createsuperuser
```
Follow the prompts to set a username, email, and password.

### 5. Access the Admin Panel
Visit `https://your-railway-url.railway.app/admin/` and log in with your new credentials.
