# 🔍 Comprehensive Diagnostic Guide

## Quick Diagnostic Tool

I've created a diagnostic page you can access directly:

**Open this URL in your browser:**
```
https://purple-cliff-052a1150f.4.azurestaticapps.net/test-backend.html
```

This page will let you:
1. Test your backend connection directly
2. See exactly what's failing
3. Get detailed error messages

---

## Step-by-Step Diagnosis

### Step 1: Use the Diagnostic Tool

1. Open: `https://purple-cliff-052a1150f.4.azurestaticapps.net/test-backend.html`
2. Enter your backend URL (e.g., `https://your-backend.azurewebsites.net`)
3. Click "Run All Tests"
4. Check the results - it will tell you exactly what's wrong

### Step 2: Check Browser Console (Main App)

1. Open your main app: `https://purple-cliff-052a1150f.4.azurestaticapps.net`
2. Press F12 → Console tab
3. Click "New Conversation"
4. **Copy ALL error messages** you see
5. Look for messages like:
   - `Creating conversation at: [URL]`
   - `API_BASE is: [URL]`
   - Any red error messages

### Step 3: Check Network Tab

1. F12 → Network tab
2. Clear the log (trash icon)
3. Click "New Conversation"
4. Find the request to `/api/conversations`
5. Click on it
6. Check:
   - **Request URL:** What URL is it trying?
   - **Status:** What status code?
   - **Response:** What does it say?

---

## Common Issues and Fixes

### Issue 1: VITE_API_BASE_URL Not Set

**Symptoms:**
- Console shows: `API_BASE is: undefined` or `API_BASE is: http://localhost:8001`
- Network tab shows request to `http://localhost:8001/api/conversations`

**Fix:**
1. Azure Portal → Static Web App → Configuration → Application settings
2. Add `VITE_API_BASE_URL` = `https://your-backend.azurewebsites.net`
3. Save and wait 2-3 minutes

### Issue 2: Backend Not Running

**Symptoms:**
- Health check fails in diagnostic tool
- Network tab shows connection error

**Fix:**
1. Check backend is running in Azure Portal
2. Test backend URL directly: `https://your-backend.azurewebsites.net/`
3. Should return: `{"status":"ok","service":"LLM Council API"}`

### Issue 3: CORS Error

**Symptoms:**
- Browser console shows CORS error
- Network tab shows CORS policy error

**Fix:**
- Backend CORS should allow all origins (already configured)
- If still failing, check backend logs

### Issue 4: 404 Error

**Symptoms:**
- Network tab shows 404 status
- Diagnostic tool shows 404

**Fix:**
1. Backend endpoint doesn't exist
2. Sync backend with GitHub (Deployment Center → Sync)
3. Verify startup command: `python -m backend.main`

---

## What to Share for Help

If you're still stuck, please share:

1. **Diagnostic Tool Results:**
   - Screenshot or copy of results from test-backend.html

2. **Browser Console Output:**
   - All messages when clicking "New Conversation"

3. **Network Tab Details:**
   - Request URL
   - Status code
   - Response body

4. **Backend URL:**
   - What is your backend URL?
   - Does it work when opened directly?

5. **Environment Variable:**
   - What does `console.log(import.meta.env.VITE_API_BASE_URL)` show?

---

## Quick Checklist

- [ ] Used diagnostic tool: `/test-backend.html`
- [ ] Checked browser console (F12)
- [ ] Checked Network tab
- [ ] Verified backend URL works directly
- [ ] Verified `VITE_API_BASE_URL` is set in Azure
- [ ] Waited 2-3 minutes after setting environment variable

---

**The diagnostic tool at `/test-backend.html` will show you exactly what's wrong!** 🔍


