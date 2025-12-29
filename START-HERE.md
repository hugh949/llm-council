# 🎯 START HERE - Simple Deployment Instructions

I've set up everything for you! Just follow these steps:

---

## 📋 What You Need (3 Things):

1. **GitHub account** (free) - https://github.com
2. **OpenRouter API key** - Get it from: https://openrouter.ai/keys
3. **About 15 minutes** of your time

---

## 🚀 Step-by-Step Instructions

### Step 1: Create GitHub Repository (2 minutes)

1. Go to: **https://github.com/new**
2. Repository name: Type `llm-council`
3. ✅ Check **"Public"** (so Vercel/Railway can access it)
4. Click **"Create repository"** (don't check any other boxes)
5. **Copy your GitHub username** from the top right corner

---

### Step 2: Push Your Code to GitHub (3 minutes)

**Open Terminal on your Mac** (Press Cmd+Space, type "Terminal", press Enter)

Then copy and paste these commands **one at a time** (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
cd /Users/hughrashid/Cursor/LLM-Council
```

```bash
git add .
```

```bash
git commit -m "Initial commit"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YOUR-USERNAME/llm-council.git
```
*(Replace YOUR-USERNAME with your actual GitHub username)*

```bash
git push -u origin main
```

**If it asks for login:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Get one at: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Check "repo" checkbox
  - Click "Generate token"
  - Copy and paste it as the password

---

### Step 3: Deploy Backend to Railway (5 minutes)

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select **`llm-council`** from the list
5. Wait 2-3 minutes for deployment to start
6. Click on your project name
7. Click **"Variables"** tab (left sidebar)
8. Click **"New Variable"** button
9. Enter:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** (paste your OpenRouter API key here)
10. Click **"Add"**
11. Wait for automatic redeploy (about 1 minute)
12. Click **"Settings"** tab
13. Scroll down to **"Domains"** section
14. Click **"Generate Domain"**
15. **Copy the URL** (looks like: `https://llm-council-production-xxxx.up.railway.app`)

**📝 Save this URL somewhere - you'll need it in Step 4!**

---

### Step 4: Deploy Frontend to Vercel (5 minutes)

1. Go to: **https://vercel.com**
2. Click **"Sign Up"** → Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Find **`llm-council`** in the list and click **"Import"**
5. **IMPORTANT:** Under "Root Directory", click **"Edit"** and type: `frontend`
6. Scroll down to **"Environment Variables"**
7. Click **"Add"** button
8. Enter:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** (paste the Railway URL from Step 3, #15)
9. Click **"Add"**
10. Scroll to bottom and click **"Deploy"** button
11. Wait 2-3 minutes for deployment

---

### Step 5: Test Your App! (1 minute)

1. Once Vercel shows **"Ready"**, you'll see a URL like: `https://llm-council-xxxx.vercel.app`
2. Click on that URL
3. Your app should open!
4. Try clicking **"+ New Conversation"**
5. If it works, **you're done!** 🎉

---

## ✅ That's It!

Share the Vercel URL with others so they can test your app!

---

## 🆘 If Something Doesn't Work:

**App won't load:**
- Make sure you typed `frontend` (not `Frontend` or `FRONTEND`) in Vercel Step 4, #5
- Make sure the Railway URL in Vercel doesn't have a trailing slash (no `/` at the end)

**Can't see conversations:**
- Check Railway logs: Click your project → "Deployments" → Latest → "View Logs"
- Make sure `OPENROUTER_API_KEY` is set in Railway

**Need help?** Check the logs in Railway and Vercel dashboards.

