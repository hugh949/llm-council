# 🚀 Deploy Single URL (Frontend + Backend Together)

## Overview

This guide shows you how to deploy the LLM Council app as a **single application** on Azure App Service, where both the frontend and backend are served from **one URL**.

**Benefits:**
- ✅ No need to configure separate frontend/backend URLs
- ✅ No CORS issues
- ✅ Simpler deployment
- ✅ Everything in one place

---

## How It Works

1. **Frontend is built** and copied to `backend/static/`
2. **FastAPI serves** both:
   - API endpoints at `/api/*`
   - Frontend static files (React app) at all other routes
3. **One Azure App Service** hosts everything
4. **One URL** for everything!

---

## Pre-Deployment Steps

### Step 1: Build the Single App

Run the build script locally (or it will run automatically on Azure):

```bash
./build-single-app.sh
```

This will:
- Build the frontend
- Copy frontend files to `backend/static/`

### Step 2: Test Locally

1. Build the app:
   ```bash
   ./build-single-app.sh
   ```

2. Run the backend:
   ```bash
   cd backend
   python -m backend.main
   ```

3. Open: `http://localhost:8001`
   - You should see the React app
   - API is at: `http://localhost:8001/api/conversations`

---

## Azure Deployment

### Step 1: Deploy to Azure App Service

Follow the existing **DEPLOY-AZURE.md** guide, but note:

1. **You only need to deploy the backend** (which now includes frontend)
2. **No separate frontend deployment needed**
3. **No Azure Static Web Apps needed**

### Step 2: Configure Azure App Service

1. **Startup Command:**
   ```
   startup.sh
   ```
   (This script builds the frontend and starts the backend)

2. **Environment Variables:**
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - (No `VITE_API_BASE_URL` needed! Frontend uses same origin)

3. **Python Version:**
   - Python 3.11 or 3.12

### Step 3: Install Node.js Build Tools

Since we need Node.js to build the frontend on Azure:

1. Go to Azure Portal → Your App Service → **Configuration** → **General settings**
2. Enable **"Always On"** (recommended)
3. Go to **Configuration** → **General settings** → **Stack settings**
4. Add **Node.js version** (e.g., 18.x or 20.x)
   - Or use an Azure extension: **"Node.js LTS"**

**Alternative: Use Azure Build Extension**

1. Go to Azure Portal → Your App Service → **Extensions**
2. Add extension: **"Node.js LTS"** or **"Node.js 18.x"**

---

## Build Process on Azure

The `startup.sh` script will:

1. Install Python dependencies (`requirements.txt`)
2. Install Node.js dependencies (`frontend/package.json`)
3. Build the frontend (`npm run build`)
4. Copy frontend files to `backend/static/`
5. Start the FastAPI server

**Note:** First deployment may take 5-10 minutes due to npm install and build.

---

## Verification

After deployment:

1. **Open your Azure App Service URL:**
   ```
   https://your-app.azurewebsites.net
   ```
   - Should show the React app (frontend)

2. **Test API endpoint:**
   ```
   https://your-app.azurewebsites.net/api/
   ```
   - Should return: `{"status":"ok","service":"LLM Council API"}`

3. **Test creating a conversation:**
   - Click "New Conversation" in the app
   - Should work without any CORS errors!

---

## Troubleshooting

### Frontend Not Showing

**Problem:** You see API JSON instead of React app

**Solution:**
- Check that `backend/static/index.html` exists
- Verify `startup.sh` ran successfully (check Azure logs)
- Check build logs in Azure

### Build Fails on Azure

**Problem:** `npm: command not found` or build errors

**Solution:**
- Enable Node.js extension in Azure App Service
- Or set Node.js version in App Service Configuration
- Check Azure logs for specific error messages

### API Endpoints Not Working

**Problem:** API returns 404

**Solution:**
- Verify routes start with `/api/`
- Check Azure logs for FastAPI startup errors
- Test `/api/` endpoint directly

---

## Differences from Separate Deployment

| Before (Separate) | Now (Single URL) |
|-------------------|------------------|
| Frontend: Azure Static Web Apps | Frontend: Served from backend |
| Backend: Azure App Service | Backend: Azure App Service |
| 2 URLs to manage | 1 URL |
| CORS configuration needed | No CORS needed |
| 2 deployments | 1 deployment |
| `VITE_API_BASE_URL` needed | Not needed (same origin) |

---

## Rollback to Separate Deployment

If you need to go back:

1. Follow **DEPLOY-FRONTEND-AZURE.md** for frontend
2. Keep backend as Azure App Service
3. Set `VITE_API_BASE_URL` in frontend environment variables

---

## Next Steps

1. ✅ Deploy using this single-URL approach
2. ✅ Test the app
3. ✅ Enjoy simpler deployment! 🎉

**That's it! One URL, one deployment, everything works!**

