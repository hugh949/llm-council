# 🚀 Deploy Backend with Render (Easier Alternative)

Render has a cleaner, more consistent UI than Railway. Here's how to deploy your backend there instead.

---

## ✅ Why Render?

- ✅ **Cleaner UI** - More intuitive and consistent
- ✅ **Better documentation** - UI matches instructions
- ✅ **Easier to find settings** - Everything is clearly labeled
- ✅ **Free tier available** - Good for testing
- ✅ **Simple environment variables** - Easy to add and edit

---

## 📦 Step 1: Deploy Backend to Render

### 1.1 Create Account
1. Go to: **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign in with **GitHub** (easiest option)
4. Authorize Render to access your GitHub

### 1.2 Create New Web Service
1. In Render dashboard, click **"New +"** (top right)
2. Click **"Web Service"**
3. Select **"Connect account"** if prompted
4. Find and select your **`llm-council`** repository
5. Click **"Connect"**

### 1.3 Configure the Service
Fill in these settings:

- **Name:** `llm-council-backend` (or any name you like)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main` (should be selected by default)
- **Root Directory:** Leave empty (or type `backend` if needed)
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r requirements.txt` or `uv sync`
- **Start Command:** `uv run python -m backend.main` or `python -m backend.main`

**Important Settings:**
- **Plan:** Select **"Free"** (or "Starter" if you need more resources)
- **Auto-Deploy:** ✅ Yes (deploys automatically when you push to GitHub)

### 1.4 Add Environment Variables
Scroll down to **"Environment Variables"** section:

Click **"Add Environment Variable"** and add:

1. **`OPENROUTER_API_KEY`**
   - Key: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key (get from https://openrouter.ai/keys)

2. **`PORT`** (Optional - Render sets this automatically, but you can add it)
   - Key: `PORT`
   - Value: `10000` (or leave it - Render will set it automatically)

### 1.5 Deploy
1. Scroll to bottom
2. Click **"Create Web Service"**
3. Wait 3-5 minutes for deployment
4. You'll see build logs in real-time

### 1.6 Get Your Backend URL
1. Once deployed, you'll see your service dashboard
2. Look for **"URL"** or **"Your service is live at"** at the top
3. Copy the URL (e.g., `https://llm-council-backend.onrender.com`)
4. **This is your backend URL!** Save it.

---

## 🌐 Step 2: Update Vercel Frontend

### 2.1 Update Environment Variable
1. Go to: **https://vercel.com**
2. Open your **`llm-council`** project
3. Go to **"Settings"** → **"Environment Variables"**
4. Find **`VITE_API_BASE_URL`**
5. Click **"Edit"** (or delete and recreate)
6. Change the value to your **Render backend URL**:
   ```
   https://llm-council-backend.onrender.com
   ```
   (Use YOUR Render URL from Step 1.6)
7. Click **"Save"**

### 2.2 Redeploy Vercel
1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ Step 3: Test Everything

1. **Test Backend:**
   - Open your Render URL: `https://your-backend.onrender.com/`
   - Should see: `{"status":"ok","service":"LLM Council API"}`

2. **Test Frontend:**
   - Open: https://llm-council-wine.vercel.app
   - Click "New Conversation"
   - Try Step 1 - should work! ✅

---

## 📋 Quick Checklist

- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Created Web Service
- [ ] Added `OPENROUTER_API_KEY` environment variable
- [ ] Service deployed successfully
- [ ] Copied Render backend URL
- [ ] Updated `VITE_API_BASE_URL` in Vercel (to Render URL)
- [ ] Redeployed Vercel
- [ ] Tested - everything works!

---

## 🔍 Finding Things in Render (Much Easier!)

### Environment Variables:
- Dashboard → Your Service → **"Environment"** tab (left sidebar)
- Click **"Add Environment Variable"**

### Service URL:
- Dashboard → Your Service → Look at top of page
- Shows: **"Your service is live at https://..."**

### Logs:
- Dashboard → Your Service → **"Logs"** tab (left sidebar)
- Real-time logs showing everything

### Settings:
- Dashboard → Your Service → **"Settings"** tab (left sidebar)
- All service configuration in one place

---

## 🆚 Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| UI Consistency | ✅ Consistent | ❌ Can be confusing |
| Finding Settings | ✅ Easy | ❌ Hard to find |
| Environment Variables | ✅ Clear "Environment" tab | ❌ Varies by page |
| Documentation Match | ✅ UI matches docs | ❌ Often outdated |
| Free Tier | ✅ Available | ✅ Available |

---

## 🚨 Common Issues & Fixes

### Issue: Build fails
**Fix:** Check "Logs" tab - Render shows clear error messages

### Issue: Service won't start
**Fix:** 
- Check "Logs" tab for errors
- Verify `OPENROUTER_API_KEY` is set (Environment tab)
- Make sure Start Command is correct

### Issue: Can't find Environment Variables
**Fix:** 
- Dashboard → Your Service → **"Environment"** tab (left sidebar)
- Very clearly labeled!

---

## ✅ You're Done!

Once everything is set up:

1. Backend runs on Render (stable, easy to manage)
2. Frontend runs on Vercel (already working)
3. Environment variables are easy to update
4. Logs are easy to view
5. Everything just works! 🎉

---

**Need help?** Render's UI is much more intuitive - you'll find everything easily!

