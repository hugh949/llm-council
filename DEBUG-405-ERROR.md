# 🔧 Debugging 405 Error

## What 405 Error Means

A **405 "Method Not Allowed"** error means the backend is receiving the request, but it doesn't accept the HTTP method (POST) you're using. This usually means:

1. ✅ Backend is reachable (otherwise you'd get connection error)
2. ❌ Wrong URL (hitting frontend instead of backend)
3. ❌ Backend route not configured correctly

---

## ✅ Step 1: Check Vercel Environment Variable

**The most common cause:** `VITE_API_BASE_URL` is pointing to your frontend URL instead of backend URL.

### Check in Vercel:

1. Go to: **https://vercel.com**
2. Click on your project: **`llm-council`**
3. Go to **"Settings"** → **"Environment Variables"**
4. Check `VITE_API_BASE_URL` value

### ❌ WRONG (Frontend URL):
```
https://llm-council-wine.vercel.app
```

### ✅ CORRECT (Backend Railway URL):
```
https://your-app-name.up.railway.app
```

**If it's wrong:**
1. Edit the variable
2. Change it to your Railway backend URL
3. Click "Save"
4. Go to "Deployments" → Redeploy

---

## ✅ Step 2: Verify Backend is Running

Test your Railway backend directly:

1. Get your Railway URL (from Railway dashboard)
2. Open it in browser: `https://your-app.up.railway.app/`
3. Should see: `{"status":"ok","service":"LLM Council API"}`

**If you get an error:**
- Backend is not running
- Check Railway logs (Deployments → View Logs)
- Make sure `OPENROUTER_API_KEY` is set

---

## ✅ Step 3: Test Backend Endpoint Directly

Test if the POST endpoint works:

### Using Browser Console (Easiest):

1. Open your Vercel app: https://llm-council-wine.vercel.app
2. Press **F12** → **Console** tab
3. Type this (replace with your Railway URL):

```javascript
fetch('https://YOUR-RAILWAY-URL.up.railway.app/api/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}'
}).then(r => r.json()).then(console.log).catch(console.error)
```

**Expected result:**
- ✅ Success: Returns conversation object with `id`
- ❌ 405 Error: Wrong URL (probably hitting frontend)
- ❌ Connection error: Backend not accessible

---

## ✅ Step 4: Check Browser Network Tab

1. Open your app: https://llm-council-wine.vercel.app
2. Press **F12** → **Network** tab
3. Try "New Conversation"
4. Look for the request to `/api/conversations`
5. Check:
   - **Request URL:** Should be your Railway URL, not Vercel URL
   - **Status:** What status code?
   - **Response:** What does it say?

---

## ✅ Step 5: Common Issues & Fixes

### Issue: VITE_API_BASE_URL points to Vercel URL

**Symptom:** 405 error, request URL is `https://llm-council-wine.vercel.app/api/conversations`

**Fix:**
1. Set `VITE_API_BASE_URL` to your Railway URL in Vercel
2. Redeploy Vercel

---

### Issue: VITE_API_BASE_URL not set

**Symptom:** Request goes to `http://localhost:8001/api/conversations` (or similar)

**Fix:**
1. Add `VITE_API_BASE_URL` in Vercel
2. Set it to your Railway URL
3. Redeploy

---

### Issue: Backend not deployed

**Symptom:** Connection error or 404

**Fix:**
1. Deploy backend to Railway
2. Get Railway URL
3. Set `VITE_API_BASE_URL` in Vercel
4. Redeploy Vercel

---

## 🧪 Quick Test Script

Copy this into your browser console (F12) on your Vercel app:

```javascript
// Get the API base URL (what frontend is using)
console.log('API_BASE should be:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001');

// Test backend directly (replace with your Railway URL)
const backendUrl = 'https://YOUR-RAILWAY-URL.up.railway.app';
fetch(`${backendUrl}/api/conversations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}'
})
  .then(r => {
    console.log('Status:', r.status);
    return r.text();
  })
  .then(text => {
    console.log('Response:', text);
    try {
      console.log('Parsed:', JSON.parse(text));
    } catch(e) {
      console.log('Not JSON:', text);
    }
  })
  .catch(err => console.error('Error:', err));
```

Replace `YOUR-RAILWAY-URL` with your actual Railway backend URL.

---

## 📋 Checklist

- [ ] `VITE_API_BASE_URL` is set in Vercel
- [ ] `VITE_API_BASE_URL` points to Railway URL (not Vercel URL)
- [ ] Railway backend is deployed and running
- [ ] Railway URL works when opened in browser
- [ ] Vercel has been redeployed after setting env var
- [ ] Browser console shows correct API_BASE URL
- [ ] Network tab shows requests going to Railway URL

---

## ✅ Once Fixed

After fixing, test:
1. Open https://llm-council-wine.vercel.app
2. Click "New Conversation"
3. Should work without 405 error!

