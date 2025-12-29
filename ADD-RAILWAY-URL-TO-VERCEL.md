# 📝 How to Add Railway URL to Vercel

## Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard
1. Open: **https://vercel.com**
2. Sign in with your GitHub account
3. Click on your project: **`llm-council`** (or `llm-council-wine`)

### Step 2: Navigate to Environment Variables
1. Click on the **"Settings"** tab (top menu)
2. Click on **"Environment Variables"** (left sidebar)

### Step 3: Add the Railway URL
1. Click the **"Add New"** button
2. In the **"Key"** field, type:
   ```
   VITE_API_BASE_URL
   ```
3. In the **"Value"** field, type:
   ```
   https://web-production-a04bc.up.railway.app
   ```
   **Important:** Include `https://` at the beginning!

4. Select **"Production"** environment (or check all: Production, Preview, Development)
5. Click **"Save"**

### Step 4: Redeploy (CRITICAL!)
1. Go to the **"Deployments"** tab (top menu)
2. Find your latest deployment
3. Click the **"..."** (three dots) menu on the right
4. Click **"Redeploy"**
5. Confirm the redeploy

**⚠️ IMPORTANT:** Environment variables only take effect after redeploying!

---

## ✅ Verify It's Set Correctly

### Check the Variable:
1. Go back to **Settings** → **Environment Variables**
2. You should see:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://web-production-a04bc.up.railway.app`
   - **Environment:** Production (or all)

### Test After Redeploy:
1. Wait for redeploy to complete (2-3 minutes)
2. Open your app: **https://llm-council-wine.vercel.app**
3. Press **F12** → **Console** tab
4. Type:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```
5. Should show: `https://web-production-a04bc.up.railway.app`
6. Try "New Conversation" - should work now!

---

## 🚨 Common Mistakes

### ❌ Wrong Format:
- `web-production-a04bc.up.railway.app` (missing https://)
- `http://web-production-a04bc.up.railway.app` (should be https)
- `https://web-production-a04bc.up.railway.app/` (no trailing slash)
- `https://web-production-a04bc.up.railway.app/api` (no /api)

### ✅ Correct Format:
- `https://web-production-a04bc.up.railway.app`

---

## 📋 Quick Checklist

- [ ] Added `VITE_API_BASE_URL` in Vercel
- [ ] Value is: `https://web-production-a04bc.up.railway.app`
- [ ] Selected Production environment
- [ ] Clicked "Save"
- [ ] Redeployed the application
- [ ] Tested - "New Conversation" works!

---

## 🎯 Summary

**Where:** Vercel → Your Project → Settings → Environment Variables

**What to add:**
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://web-production-a04bc.up.railway.app`

**Then:** Redeploy!

That's it! 🎉

