# 🔧 Fix "Failed to create conversation: 405" Error

## What 405 Error Means

**405 "Method Not Allowed"** means the backend is receiving a request, but it's hitting the wrong endpoint or URL. Usually this means:

❌ **The frontend is calling the frontend URL instead of the backend URL**

---

## ✅ Quick Fix: Check Azure Static Web App Environment Variable

The issue is almost always that `VITE_API_BASE_URL` in Azure Static Web Apps is pointing to the wrong place.

### Step 1: Check Current Setting

1. Go to: **https://portal.azure.com**
2. Find your **Static Web App** (not the backend Web App)
3. Go to **"Configuration"** → **"Application settings"**
4. Find **`VITE_API_BASE_URL`**
5. Check what value it has

### Step 2: What It Should Be

**❌ WRONG (These won't work):**
- `https://your-frontend.azurestaticapps.net` (This is your frontend!)
- Empty or missing

**✅ CORRECT (Use YOUR Azure backend URL):**
- `https://your-backend.azurewebsites.net`

**Format:**
- Must start with `https://`
- No trailing slash `/`
- No `/api` at the end
- Should be your **backend URL**, not frontend

### Step 3: Update It

1. Click on **`VITE_API_BASE_URL`** to edit
2. Set it to your **backend URL** (e.g., `https://llm-council-backend.azurewebsites.net`)
3. Click **"OK"**
4. Click **"Save"** at the top

Azure will automatically redeploy your Static Web App.

---

## 🧪 Verify Your Backend URL

Before updating, make sure your backend is working:

1. Go to Azure Portal (https://portal.azure.com)
2. Find your **Web App** (backend)
3. Copy the URL (e.g., `https://llm-council-backend.azurewebsites.net`)
4. Test it: Open in browser → Should show `{"status":"ok","service":"LLM Council API"}`

---

## 🔍 Debug: Check What's Actually Happening

### Check Browser Console:

1. Open your Azure Static Web App URL
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
   - Should be: `https://your-backend.azurewebsites.net/api/conversations`
   - Should **NOT** be: `https://your-frontend.azurestaticapps.net/api/conversations`

---

## 📋 Step-by-Step Fix

1. Get your Azure backend URL (e.g., `https://llm-council-backend.azurewebsites.net`)
2. Azure Portal → Your Static Web App → Configuration → Application settings
3. Set `VITE_API_BASE_URL` = `https://llm-council-backend.azurewebsites.net`
   (Use YOUR actual Azure backend URL)
4. Click "Save"
5. Wait for Azure to redeploy (2-3 minutes)
6. Test your app!

---

## ✅ After Fixing

1. Wait for Azure to redeploy your Static Web App (2-3 minutes)
2. Open your Azure Static Web App URL
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
   curl -X POST https://your-backend.azurewebsites.net/api/conversations \
     -H "Content-Type: application/json" \
     -d "{}"
   ```
   Should return a conversation object

3. **Check Azure logs:**
   - Static Web App: Deployment history → View logs
   - Backend: Log stream (left sidebar)

4. **Make sure you saved the environment variable** and Azure redeployed!

---

## 📝 Quick Checklist

- [ ] Backend is deployed and running on Azure
- [ ] Backend URL works when opened in browser
- [ ] `VITE_API_BASE_URL` is set in Azure Static Web Apps
- [ ] `VITE_API_BASE_URL` points to **backend URL** (not frontend!)
- [ ] Azure has redeployed Static Web App after setting the variable
- [ ] Browser console shows correct `VITE_API_BASE_URL`
- [ ] Network tab shows requests going to backend URL

---

**The fix is almost always: Update `VITE_API_BASE_URL` in Azure Static Web Apps to your backend URL!** 🎯
