# 🔍 Debug Frontend-Backend Connection

## The Problem

Frontend shows "Error: Load failed" when clicking "New Conversation" - this means the frontend can't connect to the backend.

---

## ✅ Step 1: Check Browser Console (Most Important!)

1. Open your Azure Static Web App URL in browser
2. Press **F12** (Developer Tools)
3. Click **"Console"** tab
4. Click **"New Conversation"** button
5. **Look for error messages** - they will tell you exactly what's wrong!

### Common Errors You Might See:

**"Failed to fetch" or "NetworkError"**
- Frontend can't reach backend
- Check `VITE_API_BASE_URL` is set correctly

**"404 Not Found"**
- Backend URL is wrong or endpoint doesn't exist
- Check backend URL is correct

**"CORS error"**
- Backend CORS not allowing frontend domain
- Backend CORS should allow all (`*`) by default

**"Cannot connect to backend at..."**
- Shows the actual URL being used
- Verify this matches your backend URL

---

## ✅ Step 2: Check What URL Frontend is Using

In browser console (F12), type this command:

```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

**Press Enter**

**Expected result:**
- Should show your backend URL: `https://your-backend.azurewebsites.net`
- Should NOT show: `undefined` or `http://localhost:8001`

**If it shows `undefined`:**
- `VITE_API_BASE_URL` is not set in Azure Static Web Apps
- Go to Step 3

**If it shows localhost:**
- Wrong environment variable
- Go to Step 3

**If it shows wrong backend URL:**
- Environment variable has wrong value
- Go to Step 3

---

## ✅ Step 3: Set/Verify Environment Variable in Azure

### In Azure Static Web Apps:

1. Go to: **https://portal.azure.com**
2. Find your **Static Web App** (frontend)
3. Click **"Configuration"** (left sidebar)
4. Click **"Application settings"** tab
5. Look for **`VITE_API_BASE_URL`**

### If it doesn't exist or is wrong:

1. Click **"+ Add"** (or edit existing one)
2. **Name:** `VITE_API_BASE_URL`
3. **Value:** Your backend URL (e.g., `https://your-backend.azurewebsites.net`)
   - **MUST start with `https://`**
   - **NO trailing slash `/`**
   - **NO `/api` at the end**
   - Example: `https://llm-council-backend.azurewebsites.net`
4. Click **"OK"**
5. Click **"Save"** at the top

**Azure will automatically redeploy** (wait 2-3 minutes)

---

## ✅ Step 4: Verify Backend is Running

Test your backend directly:

1. Open your backend URL in browser:
   ```
   https://your-backend.azurewebsites.net/
   ```

2. **Should return:**
   ```json
   {"status":"ok","service":"LLM Council API"}
   ```

**If you get an error:**
- Backend is not running
- Check Azure backend logs
- Follow `DEPLOY-AZURE.md` to fix backend

**If it works:**
- Backend is running ✅
- Problem is frontend configuration
- Continue to Step 5

---

## ✅ Step 5: Test Backend API Endpoint Directly

Test the create conversation endpoint:

Open this URL in your browser:
```
https://your-backend.azurewebsites.net/api/conversations
```

**Using GET (in browser):**
- Should return: `[]` (empty array) or list of conversations

**Using POST (use curl or Postman):**
```bash
curl -X POST https://your-backend.azurewebsites.net/api/conversations \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Should return:** A conversation object with an `id`

**If this works:**
- Backend endpoint is correct ✅
- Problem is frontend → backend connection

**If this fails:**
- Backend endpoint issue
- Check backend logs in Azure

---

## ✅ Step 6: Check Network Tab

1. Open browser Developer Tools (F12)
2. Click **"Network"** tab
3. Click **"New Conversation"** button
4. Look for a request to `/api/conversations`

**Check the request:**
- **Request URL:** What URL is it trying to call?
- **Status:** What status code (200, 404, 500, etc.)?
- **Response:** What error message?

**Expected:**
- Request URL should be: `https://your-backend.azurewebsites.net/api/conversations`
- Status should be: `200` (OK)

**If Request URL is wrong:**
- `VITE_API_BASE_URL` is incorrect
- Go back to Step 3

**If Status is 404:**
- Backend endpoint doesn't exist
- Check backend deployment

**If Status is 500:**
- Backend error
- Check backend logs

**If Status is CORS error:**
- Backend CORS issue
- Check backend CORS configuration

---

## ✅ Step 7: Verify Backend CORS Configuration

The backend should allow all origins. Check `backend/main.py`:

```python
# Should be:
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This is correct and should allow all origins.

---

## 📋 Quick Checklist

- [ ] Checked browser console (F12) for actual error
- [ ] Checked `import.meta.env.VITE_API_BASE_URL` in console
- [ ] `VITE_API_BASE_URL` is set in Azure Static Web Apps
- [ ] Backend URL is correct (no trailing slash, no /api)
- [ ] Backend health check works: `https://your-backend.azurewebsites.net/`
- [ ] Backend API endpoint works: `https://your-backend.azurewebsites.net/api/conversations`
- [ ] Network tab shows correct request URL
- [ ] Azure Static Web App redeployed after setting environment variable

---

## 🎯 Most Common Issues

1. **`VITE_API_BASE_URL` not set or wrong**
   - Fix: Set it correctly in Azure Static Web Apps Configuration
   - Value should be: `https://your-backend.azurewebsites.net`

2. **Backend not running**
   - Fix: Check backend deployment in Azure
   - Verify backend health check works

3. **Wrong backend URL format**
   - Wrong: `https://your-backend.azurewebsites.net/` (trailing slash)
   - Wrong: `https://your-backend.azurewebsites.net/api` (has /api)
   - Correct: `https://your-backend.azurewebsites.net`

4. **Environment variable not applied**
   - Fix: Azure redeploys automatically after saving
   - Wait 2-3 minutes after changing environment variable

---

## 🚨 Still Not Working?

**Please provide:**
1. **Browser console error** (F12 → Console)
2. **What `VITE_API_BASE_URL` shows** (from console command)
3. **Network tab details** (Request URL and Status)
4. **Backend health check result** (does `https://your-backend.azurewebsites.net/` work?)

This will help identify the exact issue!

