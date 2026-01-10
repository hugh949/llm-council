# 🔍 Test Backend Connection - Step by Step

Your frontend URL: https://purple-cliff-052a1150f.4.azurestaticapps.net

Let's diagnose the exact issue step by step:

---

## ✅ Step 1: Check Browser Console (Most Important!)

1. Open your app: **https://purple-cliff-052a1150f.4.azurestaticapps.net**
2. Press **F12** (Developer Tools)
3. Click **"Console"** tab
4. **Clear the console** (trash icon)
5. Click **"New Conversation"** button
6. **Look for these messages:**
   - `Creating conversation at: [URL]`
   - `API_BASE is: [URL]`
   - Any error messages

**What to look for:**
- What URL does it show? (should be your backend URL)
- What error message appears?

---

## ✅ Step 2: Check What URL Frontend is Using

In browser console (F12), type this command:

```javascript
console.log('API_BASE:', import.meta.env.VITE_API_BASE_URL)
```

**Press Enter**

**Expected:**
- Should show: `API_BASE: https://your-backend.azurewebsites.net`

**If it shows:**
- `API_BASE: undefined` → Environment variable not set
- `API_BASE: http://localhost:8001` → Using default (wrong!)
- `API_BASE: [wrong URL]` → Wrong URL configured

---

## ✅ Step 3: Check Network Tab

1. Open Developer Tools (F12)
2. Click **"Network"** tab
3. **Clear network log** (trash icon)
4. Click **"New Conversation"** button
5. Look for a request to `/api/conversations`

**Check the failed request:**
- **Request URL:** What URL is it trying?
- **Status:** What status code? (404, 500, CORS error?)
- **Response:** Click on the request → "Response" tab → What does it say?

**Expected Request URL:**
- `https://your-backend.azurewebsites.net/api/conversations`

**If it's something else:**
- Wrong `VITE_API_BASE_URL` configured

---

## ✅ Step 4: Verify Backend URL

**What is your backend URL?**

It should be something like:
- `https://llm-council-backend.azurewebsites.net`
- `https://your-backend-name.azurewebsites.net`

**To find it:**
1. Go to Azure Portal
2. Find your **Web App** (backend service, NOT Static Web App)
3. Overview page → Copy the URL

---

## ✅ Step 5: Set Environment Variable in Azure

1. Go to: **https://portal.azure.com**
2. Find your **Static Web App** (NOT the backend Web App)
   - Name might be: `llm-council-frontend` or similar
   - URL is: `purple-cliff-052a1150f.4.azurestaticapps.net`
3. Click **"Configuration"** (left sidebar)
4. Click **"Application settings"** tab
5. Look for **`VITE_API_BASE_URL`**

### If it doesn't exist:

1. Click **"+ Add"** button
2. **Name:** `VITE_API_BASE_URL`
3. **Value:** `https://your-backend.azurewebsites.net`
   - Replace with YOUR actual backend URL
   - Must start with `https://`
   - NO trailing slash `/`
   - NO `/api` at the end
   - Example: `https://llm-council-backend.azurewebsites.net`
4. Click **"OK"**
5. Click **"Save"** at the top

**Azure will automatically redeploy** (wait 2-3 minutes)

### If it exists but is wrong:

1. Click on **`VITE_API_BASE_URL`** to edit
2. Change the value to your backend URL (same format as above)
3. Click **"OK"**
4. Click **"Save"** at the top

---

## ✅ Step 6: Test Backend Directly

**Open this URL in your browser** (replace with YOUR backend URL):

```
https://your-backend.azurewebsites.net/
```

**Should return:**
```json
{"status":"ok","service":"LLM Council API"}
```

**If you get an error:**
- Backend is not running
- Check backend deployment in Azure
- Check backend logs

**If it works:**
- Backend is running ✅
- Problem is frontend configuration

---

## 📋 Quick Checklist

Run through this checklist:

- [ ] Checked browser console (F12) - saw what URL is being used
- [ ] Ran `console.log(import.meta.env.VITE_API_BASE_URL)` in console
- [ ] Checked Network tab - saw the actual request URL
- [ ] Found your backend URL in Azure Portal
- [ ] Set `VITE_API_BASE_URL` in Azure Static Web Apps Configuration
- [ ] Waited 2-3 minutes after saving environment variable
- [ ] Tested backend directly - it works
- [ ] Refreshed frontend app and tested again

---

## 🎯 Most Likely Issue

**`VITE_API_BASE_URL` is not set or set incorrectly in Azure Static Web Apps.**

**Fix:**
1. Go to Azure Portal → Static Web App → Configuration
2. Add/edit `VITE_API_BASE_URL`
3. Set it to your backend URL: `https://your-backend.azurewebsites.net`
4. Save and wait for redeployment

---

**After setting the environment variable correctly, the error should be fixed!** ✅


