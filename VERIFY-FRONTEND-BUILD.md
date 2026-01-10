# 🔍 Verify Frontend Build

## Current Status

- ✅ Backend is running (200 OK responses)
- ❌ Frontend still not loading (shows JSON instead)
- ❌ Frontend build may not have happened

---

## Step 1: Check Deployment Logs

The `.deployment` file should have built the frontend during deployment. Check:

1. **Deployment Center** → **Logs** tab
2. Look for:
   - `npm install`
   - `npm run build`
   - `Copying frontend build...`
   - Any build errors

**OR** check GitHub Actions:
- https://github.com/hugh949/llm-council/actions
- Latest workflow → Check build logs

---

## Step 2: Alternative - Pre-build Frontend

If the `.deployment` approach isn't working, we can pre-build locally and commit:

### Build Locally:

```bash
./build-single-app.sh
```

This will:
1. Build the frontend
2. Copy to `backend/static/`

### Commit and Push:

```bash
git add backend/static/
git commit -m "Pre-build frontend static files"
git push
```

Then Azure will deploy with the frontend already built!

---

## Step 3: Check if Files Exist

After deployment, check if `backend/static/index.html` exists in the deployed app.

You can use Azure's SSH/Console to check:
1. **Development Tools** → **SSH** (or **Console**)
2. Navigate to: `cd /home/site/wwwroot`
3. Check: `ls -la backend/static/`
4. Should see `index.html` and `assets/` directory

---

## Step 4: Manual Build via SSH (If Needed)

If files don't exist, you can build manually:

1. **Development Tools** → **SSH**
2. Run:
   ```bash
   cd /home/site/wwwroot
   cd frontend
   npm install
   npm run build
   cd ..
   mkdir -p backend/static
   cp -r frontend/dist/* backend/static/
   ```
3. Restart App Service

---

## Quick Fix: Pre-build and Commit

**Easiest solution:** Build locally and commit the static files:

```bash
# Build frontend
./build-single-app.sh

# Commit static files
git add backend/static/
git commit -m "Add pre-built frontend files"
git push
```

This ensures the frontend is always available, even if build fails on Azure!

---

**Check Deployment Center logs first to see if build happened!** 🔍


