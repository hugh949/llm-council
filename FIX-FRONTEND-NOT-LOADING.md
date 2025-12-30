# 🔧 Fix: Frontend Not Loading (Shows JSON Instead)

## Problem

Your app URL shows:
```json
{"status":"ok","service":"LLM Council API"}
```

Instead of the React app. This means:
- ✅ Backend is running
- ❌ Frontend is not being served

---

## Root Cause

The frontend static files (`backend/static/index.html`) don't exist, which means:
1. Frontend build failed, OR
2. Files weren't copied to `backend/static/`, OR
3. Build didn't run at all

---

## Step 1: Check Log Stream

Check what happened during startup:

1. **Azure Portal** → Your App Service → **"Log stream"**
2. Look for these messages:
   - `Building frontend...`
   - `npm install`
   - `npm run build`
   - `Copying frontend build to backend/static...`
   - Any error messages

**Share the log output** so we can see what failed.

---

## Step 2: Common Issues & Fixes

### Issue 1: npm install Failed

**If you see npm errors in logs:**

- Check Node.js extension is installed
- May need to restart App Service

### Issue 2: Build Failed

**If you see build errors:**

- Check `frontend/package.json` exists
- Check npm/node versions are compatible
- Look for specific build error messages

### Issue 3: Files Not Copied

**If build succeeded but files not copied:**

- Check `backend/static/` directory exists
- Check permissions
- Verify copy command in startup.sh ran

### Issue 4: Build Didn't Run

**If you don't see "Building frontend..." in logs:**

- Check startup.sh ran successfully
- Verify startup command is `startup.sh`
- Check for errors before build step

---

## Step 3: Manual Fix (If Needed)

If the build keeps failing, we can pre-build the frontend:

1. Build locally: `./build-single-app.sh`
2. Commit `backend/static/` to Git
3. Deploy again

But first, let's see what the logs say!

---

## Step 4: Verify Node.js

Make sure Node.js is installed:

1. **Extensions** → Should show **"Node.js LTS"**
2. If not, install it
3. Restart App Service

---

## What to Share

Please share:
1. **Log Stream output** - Especially the startup/build section
2. Any error messages you see
3. Whether you see "Building frontend..." in the logs

---

**Most likely:** The frontend build failed or didn't run. Check the Log Stream to see what happened! 🔍

