# 🔧 Fix "404 The page could not be found" Error in Azure

## Understanding the Error

**Error:** `Error: Failed to create conversation: 404 The page could not be found`

This error means Azure is receiving the request, but the endpoint isn't found. This usually happens when:

1. **Azure hasn't deployed the latest code from GitHub**
2. **The route path is incorrect**
3. **The backend service isn't running properly**

---

## ✅ Quick Fix: Verify Azure Deployment

### Step 1: Check Azure Deployment Status

1. Go to **Azure Portal** → Your Web App (backend)
2. Click **"Deployment Center"** (left sidebar)
3. Check **"Status"** - should show "Active (Connected)"
4. Check **"Logs"** - look for recent deployments

**If no recent deployment:**
- Azure might not be connected to GitHub properly
- Or the connection needs to be refreshed

### Step 2: Trigger Manual Deployment

1. In Azure Portal → Your Web App → **"Deployment Center"**
2. Click **"Sync"** button (top toolbar)
3. This will pull the latest code from GitHub
4. Wait 2-3 minutes for deployment to complete

### Step 3: Verify the Correct Branch

1. In **"Deployment Center"** → **"Settings"**
2. Make sure **"Branch"** is set to **`main`** (or your default branch)
3. Click **"Save"** if you changed it

---

## ✅ Verify Your Backend Endpoint

### Test Backend Health Check

Open your Azure backend URL in a browser:
```
https://your-backend.azurewebsites.net/
```

**Should return:**
```json
{"status":"ok","service":"LLM Council API"}
```

**If this doesn't work:**
- Backend isn't running
- Check Azure Log stream for errors

### Test Create Conversation Endpoint

Try this in your browser (or use curl):
```
https://your-backend.azurewebsites.net/api/conversations
```

**Using curl:**
```bash
curl -X POST https://your-backend.azurewebsites.net/api/conversations \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Should return:** A conversation object with an `id`

**If you get 404:**
- The endpoint doesn't exist (code not deployed)
- Follow steps above to sync/deploy

---

## ✅ Check Azure Logs

1. Azure Portal → Your Web App → **"Log stream"** (left sidebar)
2. Look for errors during startup
3. Check for Python import errors
4. Verify database initialization messages

**Look for:**
- `✅ Database initialized successfully`
- Any Python errors or import failures

---

## ✅ Verify GitHub Connection

### Check if Azure is Connected to GitHub

1. Azure Portal → Your Web App → **"Deployment Center"**
2. **"Source"** should show **"GitHub"**
3. **"Repository"** should show your repo (e.g., `hugh949/llm-council`)
4. **"Branch"** should show **`main`**

### Reconnect if Needed

1. In **"Deployment Center"** → **"Settings"**
2. Click **"Disconnect"** if connected
3. Click **"Connect"** → Select **"GitHub"**
4. Authorize Azure to access your GitHub
5. Select repository: `llm-council`
6. Branch: `main`
7. Click **"Save"**

---

## ✅ Check Startup Command

Make sure Azure is using the correct startup command:

1. Azure Portal → Your Web App → **"Configuration"** → **"General settings"**
2. **"Startup Command"** should be:
   ```
   python -m backend.main
   ```
3. Click **"Save"** if you changed it
4. Azure will restart the service

---

## ✅ Verify Environment Variables

1. Azure Portal → Your Web App → **"Configuration"** → **"Application settings"**
2. Verify these are set:
   - `OPENROUTER_API_KEY` (required)
   - `PORT` (optional - Azure sets automatically)
   - `WEBSITES_PORT` (optional but recommended: `8000`)

---

## 📋 Complete Checklist

- [ ] Azure Deployment Center shows "Active (Connected)"
- [ ] Branch is set to `main`
- [ ] Clicked "Sync" to pull latest code
- [ ] Health check works: `https://your-backend.azurewebsites.net/`
- [ ] Startup command is: `python -m backend.main`
- [ ] `OPENROUTER_API_KEY` is set in Application settings
- [ ] Azure Log stream shows no errors
- [ ] Recent deployment visible in Deployment Center logs

---

## 🚨 Still Getting 404?

If you've done all the above and still get 404:

1. **Check the exact URL** - Make sure `VITE_API_BASE_URL` in Azure Static Web Apps is:
   ```
   https://your-backend.azurewebsites.net
   ```
   (No trailing slash, no `/api`)

2. **Test backend directly** - Open in browser:
   ```
   https://your-backend.azurewebsites.net/api/conversations
   ```
   Should return `[]` or a list (GET request)

3. **Check browser console** (F12) - What exact URL is the frontend calling?

4. **Verify deployment logs** - In Deployment Center → Logs, check for build errors

---

## 🎯 Most Common Cause

**The most common cause is Azure hasn't deployed the latest code from GitHub.**

**Solution:**
1. Go to Deployment Center
2. Click "Sync"
3. Wait for deployment to complete
4. Test again

---

**After syncing, your 404 error should be resolved!** ✅

