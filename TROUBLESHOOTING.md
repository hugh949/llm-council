# 🔧 Troubleshooting "Failed to create conversation"

## Common Issues and Solutions

### 1. ✅ Check Environment Variables in Vercel

**Problem:** Frontend can't find the backend URL.

**Solution:**
1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Make sure you have:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** Your Railway backend URL (e.g., `https://your-app.up.railway.app`)
4. **Important:** After adding/changing, click **"Redeploy"** for the changes to take effect

---

### 2. ✅ Check Backend is Running on Azure

**Problem:** Backend is not accessible.

**Solution:**
1. Go to Azure Portal (https://portal.azure.com)
2. Find your Web App
3. Check the status is **"Running"**
4. Copy the URL (found in Overview page) and test it in your browser: `https://your-app.azurewebsites.net/`
5. You should see: `{"status":"ok","service":"LLM Council API"}`

**If you get an error:**
- Check Azure Log stream (left sidebar → "Log stream")
- Make sure `OPENROUTER_API_KEY` is set in Azure Configuration → Application settings

---

### 3. ✅ Check Browser Console for Errors

**Problem:** Network errors or CORS issues.

**Solution:**
1. Open your Vercel app in browser
2. Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools
3. Click **"Console"** tab
4. Try clicking "New Conversation"
5. Look for error messages - they will tell you exactly what's wrong

**Common errors:**
- `Failed to fetch` → Backend URL is wrong or backend is down
- `CORS error` → Backend CORS configuration issue (should be fixed now)
- `404 Not Found` → Backend URL path is incorrect

---

### 4. ✅ Verify Backend URL Format

**Problem:** Backend URL is incorrect.

**Correct format:**
```
https://your-app-name.up.railway.app
```

**In Vercel environment variable:**
```
VITE_API_BASE_URL=https://your-app-name.up.railway.app
```

**❌ Don't include:**
- `/api` at the end
- Trailing slash `/`
- `http://` (must be `https://`)

---

### 5. ✅ Check Database Initialization

**Problem:** Database not initialized on Azure.

**Solution:**
The backend now initializes the database on startup. Check Azure logs:
1. Azure Portal → Your Web App → "Log stream" (left sidebar)
2. Look for: `✅ Database initialized successfully`

**If you see database errors:**
- Azure uses SQLite by default (which should work)
- If you want PostgreSQL, add Azure Database for PostgreSQL and set `DATABASE_URL`

---

### 6. ✅ Test Backend Endpoint Directly

**Problem:** Not sure if backend is working.

**Solution:**
Open these URLs in your browser (replace with your Azure URL):

1. **Health check:**
   ```
   https://your-app.azurewebsites.net/
   ```
   Should return: `{"status":"ok","service":"LLM Council API"}`

2. **List conversations:**
   ```
   https://your-app.azurewebsites.net/api/conversations
   ```
   Should return: `[]` (empty array)

3. **Create conversation (use a tool like Postman or curl):**
   ```bash
   curl -X POST https://your-app.azurewebsites.net/api/conversations \
     -H "Content-Type: application/json" \
     -d "{}"
   ```
   Should return a conversation object with an `id`.

---

### 7. ✅ Check Azure Environment Variables

**Problem:** Missing API key.

**Solution:**
1. Azure Portal → Your Web App → "Configuration" → "Application settings"
2. Make sure you have:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Your OpenRouter API key
3. Click "Save" to apply changes (service will restart)

---

## 🧪 Quick Diagnostic Checklist

Run through this checklist:

- [ ] Backend is deployed and running on Azure
- [ ] Backend URL works when opened in browser (`/` endpoint returns OK)
- [ ] `OPENROUTER_API_KEY` is set in Azure
- [ ] `VITE_API_BASE_URL` is set in Vercel (with Azure URL)
- [ ] Vercel has been redeployed after setting environment variable
- [ ] Browser console shows the actual error (not just "Failed to create conversation")
- [ ] No CORS errors in browser console

---

## 📞 Still Having Issues?

1. **Check Railway logs** - They will show backend errors
2. **Check browser console** - It will show frontend/network errors
3. **Verify URLs** - Make sure Railway URL is correct and accessible
4. **Test backend directly** - Use curl or Postman to test the API

The improved error messages should now tell you exactly what's wrong!

