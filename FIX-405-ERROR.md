# 🔧 Fix "Failed to create conversation: 405" Error

## What 405 Error Means

**405 "Method Not Allowed"** means the backend is receiving a request, but it's hitting the wrong endpoint or URL. Usually this means:

❌ **The frontend is calling the frontend URL instead of the backend URL**

---

## ✅ Quick Fix: Check Vercel Environment Variable

The issue is almost always that `VITE_API_BASE_URL` in Vercel is pointing to the wrong place.

### Step 1: Check Current Setting

1. Go to: **https://vercel.com**
2. Open your **`llm-council`** (or `llm-council-wine`) project
3. Go to **"Settings"** → **"Environment Variables"**
4. Find **`VITE_API_BASE_URL`**
5. Check what value it has

### Step 2: What It Should Be

**❌ WRONG (These won't work):**
- `https://llm-council-wine.vercel.app` (This is your frontend!)
- `https://your-app.onrender.com` (If you're not using Render)
- `https://your-app.up.railway.app` (If you're not using Railway)
- Empty or missing

**✅ CORRECT (Use YOUR Azure backend URL):**
- `https://your-backend.azurewebsites.net`

**Format:**
- Must start with `https://`
- No trailing slash `/`
- No `/api` at the end
- Should be your **backend URL**, not frontend

### Step 3: Update It

1. Click **"Edit"** on `VITE_API_BASE_URL` (or delete and recreate)
2. Set it to your **backend URL**
3. Click **"Save"**

### Step 4: Redeploy (CRITICAL!)

1. Go to **"Deployments"** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

**⚠️ IMPORTANT:** Environment variables only take effect after redeploying!

---

## 🧪 Verify Your Backend URL

Before updating Vercel, make sure your backend is working:

### Get Your Azure Backend URL:
1. Go to Azure Portal (https://portal.azure.com)
2. Find your Web App
3. Copy the URL (e.g., `https://llm-council-backend.azurewebsites.net`)
4. Test it: Open in browser → Should show `{"status":"ok","service":"LLM Council API"}`

---

## 🔍 Debug: Check What's Actually Happening

### Check Browser Console:

1. Open your app: **https://llm-council-wine.vercel.app**
2. Press **F12** → **Console** tab
3. Type:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```
4. This shows what URL the frontend is using
5. **It should be your backend URL, not the frontend URL!**

### Check Network Tab:

1. Press **F12** → **Network** tab
2. Click **"New Conversation"**
3. Find the request (should be to `/api/conversations`)
4. Check the **Request URL**:
   - Should be: `https://your-backend.com/api/conversations`
   - Should **NOT** be: `https://llm-council-wine.vercel.app/api/conversations`

---

## 📋 Step-by-Step Fix

### Fix Steps:

1. Get your Azure backend URL (e.g., `https://llm-council-backend.azurewebsites.net`)
2. Vercel → Settings → Environment Variables
3. Set `VITE_API_BASE_URL` = `https://llm-council-backend.azurewebsites.net`
   (Use YOUR actual Azure URL)
4. Save and Redeploy Vercel
5. Test!

---

## ✅ After Fixing

1. Wait for Vercel to redeploy (2-3 minutes)
2. Open your app: **https://llm-council-wine.vercel.app**
3. Open browser console (F12)
4. Check `import.meta.env.VITE_API_BASE_URL` shows backend URL
5. Try "New Conversation" - should work! ✅

---

## 🚨 Still Getting 405?

If you're still getting 405 after fixing the URL:

1. **Verify backend is running:**
   - Open your backend URL in browser
   - Should see: `{"status":"ok","service":"LLM Council API"}`

2. **Test backend endpoint directly:**
   ```bash
   curl -X POST https://your-backend.com/api/conversations \
     -H "Content-Type: application/json" \
     -d "{}"
   ```
   Should return a conversation object

3. **Check backend logs:**
   - Azure: Log stream (left sidebar in your Web App)

4. **Make sure you redeployed Vercel** after changing the environment variable!

---

## 📝 Quick Checklist

- [ ] Backend is deployed and running
- [ ] Backend URL works when opened in browser
- [ ] `VITE_API_BASE_URL` is set in Vercel
- [ ] `VITE_API_BASE_URL` points to **backend URL** (not frontend!)
- [ ] Vercel has been **redeployed** after setting the variable
- [ ] Browser console shows correct `VITE_API_BASE_URL`
- [ ] Network tab shows requests going to backend URL

---

**The fix is almost always: Update `VITE_API_BASE_URL` in Vercel to your backend URL and redeploy!** 🎯

