# 🚨 Fix 404 Error - Step by Step

**Error:** `Failed to create conversation: 404 The page could not be found`

This means Azure can't find your backend endpoint. Follow these steps in order:

---

## ✅ STEP 1: Sync Azure with GitHub (Most Important!)

**This is usually the problem - Azure hasn't deployed your latest code.**

1. Go to: **https://portal.azure.com**
2. Find your **Web App** (backend service)
3. Click **"Deployment Center"** (left sidebar)
4. Look for **"Sync"** button (top toolbar)
5. **Click "Sync"** - This pulls latest code from GitHub
6. Wait 2-3 minutes for deployment

**Check deployment status:**
- In Deployment Center, go to **"Logs"** tab
- Look for latest deployment
- Should show "Succeeded" when done

---

## ✅ STEP 2: Verify Startup Command

Azure needs to know how to start your Python app:

1. Azure Portal → Your Web App → **"Configuration"**
2. Click **"General settings"** tab
3. Scroll to **"Startup Command"**
4. Make sure it says exactly:
   ```
   python -m backend.main
   ```
5. If it's different or empty, change it to the above
6. Click **"Save"** at the top (Azure will restart)

---

## ✅ STEP 3: Check Environment Variables

1. Azure Portal → Your Web App → **"Configuration"** → **"Application settings"**
2. Verify these are set:

   **Required:**
   - `OPENROUTER_API_KEY` = (your API key)

   **Optional but recommended:**
   - `PORT` = `8000`
   - `WEBSITES_PORT` = `8000`

3. Click **"Save"** if you changed anything

---

## ✅ STEP 4: Test Backend Health Check

**Test if your backend is running at all:**

1. Open this URL in your browser (replace with YOUR Azure backend URL):
   ```
   https://your-backend.azurewebsites.net/
   ```

2. **Should return:**
   ```json
   {"status":"ok","service":"LLM Council API"}
   ```

   **If you get 404 or error:**
   - Backend isn't running properly
   - Go to STEP 5 (Check Logs)

   **If you get the JSON response:**
   - Backend is running! ✅
   - Problem might be the frontend URL
   - Go to STEP 6 (Check Frontend Configuration)

---

## ✅ STEP 5: Check Azure Logs

**See what's actually happening:**

1. Azure Portal → Your Web App → **"Log stream"** (left sidebar)
2. You'll see real-time logs
3. Look for errors like:
   - `ModuleNotFoundError` → Dependencies not installed
   - `ImportError` → Code import issues
   - `Database initialization error` → Database problems
   - `No module named 'backend'` → Wrong startup command

**Common errors and fixes:**

- **"No module named 'backend'"**
  - Fix: Startup command should be `python -m backend.main`

- **"ModuleNotFoundError: No module named 'fastapi'"**
  - Fix: Make sure `requirements.txt` exists and Azure is installing dependencies

- **"Database initialization error"**
  - Fix: Check that database path is writable (should be automatic)

---

## ✅ STEP 6: Check Frontend Configuration

**Make sure frontend is pointing to the correct backend URL:**

1. Go to: **Azure Portal** → Your **Static Web App** (frontend)
2. Click **"Configuration"** → **"Application settings"**
3. Find **`VITE_API_BASE_URL`**
4. It should be your **backend URL**:
   ```
   https://your-backend.azurewebsites.net
   ```
   **IMPORTANT:**
   - Must start with `https://`
   - NO trailing slash `/`
   - NO `/api` at the end
   - Should be the backend URL, NOT the frontend URL

5. If wrong, fix it and click **"Save"**
6. Azure will automatically redeploy frontend (wait 2-3 minutes)

---

## ✅ STEP 7: Test Backend Endpoint Directly

**Test if the create conversation endpoint exists:**

Open this URL in your browser (replace with YOUR backend URL):
```
https://your-backend.azurewebsites.net/api/conversations
```

**Using GET request (in browser):**
- Should return: `[]` (empty array) or list of conversations
- If you get 404 → Endpoint doesn't exist (code not deployed)

**Using POST request (use curl or Postman):**
```bash
curl -X POST https://your-backend.azurewebsites.net/api/conversations \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Should return:** A conversation object with an `id`

---

## 🔍 Debug: Check What URL Frontend is Using

**See what URL the frontend is actually calling:**

1. Open your Azure Static Web App URL in browser
2. Press **F12** (Developer Tools)
3. Click **"Console"** tab
4. Type this command:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```
5. Press Enter
6. **Should show:** `https://your-backend.azurewebsites.net`
7. If it shows something else or `undefined`, the environment variable isn't set correctly

---

## 📋 Complete Checklist

Run through this checklist:

- [ ] Clicked "Sync" in Azure Deployment Center
- [ ] Waited 2-3 minutes for deployment to complete
- [ ] Startup command is: `python -m backend.main`
- [ ] `OPENROUTER_API_KEY` is set in Application settings
- [ ] Health check works: `https://your-backend.azurewebsites.net/` returns `{"status":"ok"...}`
- [ ] Log stream shows no errors
- [ ] `VITE_API_BASE_URL` in Static Web App points to backend URL
- [ ] Tested backend endpoint: `https://your-backend.azurewebsites.net/api/conversations`

---

## 🎯 Quick Fix Summary

**Most common cause:** Azure hasn't deployed latest code

**Quick fix:**
1. Azure Portal → Web App → Deployment Center
2. Click **"Sync"**
3. Wait for deployment
4. Test again

**If that doesn't work:**
1. Check startup command: `python -m backend.main`
2. Check logs for errors
3. Verify `VITE_API_BASE_URL` is correct

---

## 🆘 Still Not Working?

**After doing all the above, if you still get 404:**

1. **Check the exact error in browser console (F12 → Network tab)**
   - What exact URL is it trying to call?
   - What status code?
   - What error message?

2. **Verify your backend URL:**
   - Is it the correct Azure Web App URL?
   - Does the health check work?

3. **Check Azure Log stream for Python errors**

4. **Try redeploying from scratch:**
   - In Deployment Center, click "Disconnect"
   - Then "Connect" again → Select GitHub → Your repo → main branch

---

**After syncing Azure with GitHub, the 404 error should be resolved!** ✅

