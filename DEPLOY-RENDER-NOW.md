# 🚀 Deploy to Render - Step by Step (Do This Now)

Follow these steps exactly to deploy your backend to Render.

---

## 📦 Step 1: Create Render Account & Connect GitHub

1. Go to: **https://render.com**
2. Click **"Get Started"** (or "Sign Up")
3. Click **"Sign up with GitHub"** (easiest option)
4. Authorize Render to access your GitHub account
5. You'll be taken to the Render dashboard

---

## 📦 Step 2: Create New Web Service

1. In Render dashboard, click the **"New +"** button (top right)
2. Click **"Web Service"** from the dropdown
3. You'll see a list of your GitHub repositories
4. Find **`llm-council`** in the list
5. Click **"Connect"** next to it

---

## 📦 Step 3: Configure Your Service

Fill in these settings (copy exactly):

### Basic Settings:
- **Name:** `llm-council-backend`
- **Region:** Choose closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
- **Branch:** `main` (should be auto-selected)
- **Root Directory:** Leave **EMPTY** (don't type anything)
- **Runtime:** `Python 3`

### Build & Start Commands:
- **Build Command:** `pip install -r requirements.txt`
  (This installs all Python dependencies)
  
- **Start Command:** `python -m backend.main`
  (This starts the FastAPI server)

### Plan:
- Select **"Free"** plan (good for testing)

### Auto-Deploy:
- Leave **"Auto-Deploy"** set to **"Yes"** ✅

---

## 🔑 Step 4: Add Environment Variables

Scroll down to the **"Environment Variables"** section:

1. Click **"Add Environment Variable"**

2. Add **`OPENROUTER_API_KEY`**:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** Paste your OpenRouter API key here
     - Get it from: https://openrouter.ai/keys
     - If you don't have one, create it there first
   - Click **"Add Environment Variable"** (or just click outside the box)

3. **Optional:** Add `PORT` (Render sets this automatically, but you can add it if you want):
   - **Key:** `PORT`
   - **Value:** `10000`
   - (Actually, you can skip this - Render handles it automatically)

---

## 🚀 Step 5: Create & Deploy

1. Scroll all the way to the bottom
2. Click the blue **"Create Web Service"** button
3. Render will start building your service
4. You'll see build logs in real-time
5. Wait 3-5 minutes for deployment to complete

---

## ✅ Step 6: Get Your Backend URL

Once deployment is complete:

1. At the top of the page, you'll see:
   - **"Your service is live at"** followed by a URL
   - Or look for **"URL"** in the info section
   
2. The URL will look like:
   - `https://llm-council-backend.onrender.com`
   - (Your actual URL might be slightly different)

3. **Copy this URL** - you'll need it for Vercel!

4. **Test it:** Open the URL in a new browser tab
   - Should see: `{"status":"ok","service":"LLM Council API"}`
   - If you see this, backend is working! ✅

---

## 🌐 Step 7: Update Vercel Frontend

Now update your frontend to use the Render backend:

1. Go to: **https://vercel.com**
2. Open your **`llm-council`** project
3. Go to **"Settings"** → **"Environment Variables"**
4. Find **`VITE_API_BASE_URL`**:
   - If it exists: Click **"Edit"** (or delete and recreate)
   - If it doesn't exist: Click **"Add New"**
5. Set the value to your **Render backend URL**:
   ```
   https://llm-council-backend.onrender.com
   ```
   (Use YOUR actual Render URL from Step 6!)
6. Make sure **"Production"** is checked
7. Click **"Save"**

---

## 🔄 Step 8: Redeploy Vercel

1. Go to **"Deployments"** tab in Vercel
2. Click the **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Confirm the redeploy
5. Wait 2-3 minutes for it to finish

---

## 🧪 Step 9: Test Everything

1. Open your Vercel app: **https://llm-council-wine.vercel.app**
2. Open browser console (F12 → Console tab)
3. Click **"New Conversation"**
4. Try submitting a message in **Step 1 (Prompt Engineering)**
5. Should work now! ✅

---

## 📋 Quick Checklist

- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Web Service created
- [ ] `OPENROUTER_API_KEY` environment variable added
- [ ] Service deployed successfully
- [ ] Backend URL copied
- [ ] Backend URL tested (shows {"status":"ok"...})
- [ ] `VITE_API_BASE_URL` updated in Vercel (to Render URL)
- [ ] Vercel redeployed
- [ ] App tested - everything works!

---

## 🚨 If Something Goes Wrong

### Build Fails:
- Check the **"Logs"** tab in Render
- Look for error messages
- Common issues:
  - Missing dependencies (check pyproject.toml)
  - Wrong build command
  - Python version issue

### Service Won't Start:
- Check **"Logs"** tab
- Look for startup errors
- Make sure `OPENROUTER_API_KEY` is set
- Verify Start Command is correct

### Can't Find Environment Variables:
- Dashboard → Your Service → **"Environment"** tab (left sidebar)
- Very clearly labeled!

### Backend URL Doesn't Work:
- Make sure deployment completed successfully
- Check "Logs" tab for errors
- Wait a minute - sometimes takes time to be fully ready

---

## ✅ You're Done!

Once all steps are complete:
- ✅ Backend runs on Render (easy to manage)
- ✅ Frontend runs on Vercel (already working)
- ✅ Everything connected and working
- ✅ Ready for users! 🎉

---

**Need help?** Check the "Logs" tab in Render - it shows clear error messages!

