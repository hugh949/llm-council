# 🚀 Deploy to Railway & Vercel

## ✅ Step 1 & 2: DONE!
- ✅ GitHub repository created
- ✅ Code pushed to GitHub

---

## 📦 STEP 3: Deploy Backend to Railway (5 minutes)

1. **Go to:** https://railway.app
2. **Sign in** with your **GitHub** account
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select **`llm-council`** from the list
6. Wait 2-3 minutes for deployment to start
7. Click on your project to open it
8. Click the **"Variables"** tab
9. Click **"New Variable"**
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** (paste your OpenRouter API key from https://openrouter.ai/keys)
   - Click **"Add"**
10. Click **"Settings"** tab
11. Scroll down to **"Domains"** section
12. Click **"Generate Domain"**
13. **Copy the URL** (it will look like: `https://your-app-name.up.railway.app`)
14. **Save this URL** - you'll need it for Vercel!

---

## 🌐 STEP 4: Deploy Frontend to Vercel (5 minutes)

1. **Go to:** https://vercel.com
2. **Sign in** with your **GitHub** account
3. Click **"Add New..."** → **"Project"**
4. Find and select **`llm-council`** repository
5. **IMPORTANT:** In the **"Root Directory"** field, type: `frontend`
6. Click **"Environment Variables"** section
7. Click **"Add"** button
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** (paste the Railway URL from Step 3)
   - Click **"Add"**
8. Click **"Deploy"** button
9. Wait 2-3 minutes for deployment
10. When done, **copy your Vercel URL** (it will look like: `https://llm-council.vercel.app`)
11. **This is your live app!** 🎉

---

## ✅ What You Need:

1. **OpenRouter API Key** (for Railway)
   - Get it from: https://openrouter.ai/keys
   - If you don't have one, create an account and generate a key

2. **Railway URL** (for Vercel)
   - You'll get this after deploying to Railway (Step 3)

---

## 🧪 Test Your App

1. Open your Vercel URL in a browser
2. Try creating a new conversation
3. Test Step 1 (Prompt Engineering)
4. Everything should work! 🎊

---

## 📝 Quick Checklist:

- [ ] Deployed backend to Railway
- [ ] Added `OPENROUTER_API_KEY` in Railway
- [ ] Generated Railway domain and copied URL
- [ ] Deployed frontend to Vercel
- [ ] Set Root Directory to `frontend` in Vercel
- [ ] Added `VITE_API_BASE_URL` in Vercel (with Railway URL)
- [ ] Tested the app!

---

**Need help?** Check `YOUR-DEPLOYMENT.md` for more details.

