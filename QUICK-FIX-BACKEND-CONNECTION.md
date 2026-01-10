# ⚡ Quick Fix: Backend Connection Error

## The Problem

Frontend at `https://purple-cliff-052a1150f.4.azurestaticapps.net` shows "Error: Load failed" when clicking "New Conversation".

## Most Likely Cause

**`VITE_API_BASE_URL` environment variable is not set or set incorrectly in Azure Static Web Apps.**

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Find Your Backend URL

1. Go to: **https://portal.azure.com**
2. Find your **Web App** (backend service - different from Static Web App)
3. Copy the URL (e.g., `https://llm-council-backend.azurewebsites.net`)

### Step 2: Set Environment Variable

1. In Azure Portal, find your **Static Web App**
   - The one with URL: `purple-cliff-052a1150f.4.azurestaticapps.net`
2. Click **"Configuration"** (left sidebar)
3. Click **"Application settings"** tab
4. Look for **`VITE_API_BASE_URL`**

**If it doesn't exist:**
- Click **"+ Add"**
- **Name:** `VITE_API_BASE_URL`
- **Value:** `https://your-backend.azurewebsites.net` (paste YOUR backend URL)
- Click **"OK"** → **"Save"**

**If it exists but is wrong:**
- Click to edit it
- Change value to your backend URL
- Click **"OK"** → **"Save"**

### Step 3: Wait and Test

1. Wait 2-3 minutes for Azure to redeploy
2. Refresh your app: https://purple-cliff-052a1150f.4.azurestaticapps.net
3. Click "New Conversation"
4. Should work now! ✅

---

## 🔍 Verify It's Fixed

**Check browser console (F12):**

Type this in console:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

**Should show:** Your backend URL (not `undefined` or `localhost`)

---

## 🆘 Still Not Working?

**Check browser console (F12 → Console tab) after clicking "New Conversation":**

1. What error message do you see?
2. What URL does it show? (Look for "Creating conversation at: [URL]")
3. What does Network tab show? (F12 → Network → Click the failed request)

**Share this information and I can help further!**


