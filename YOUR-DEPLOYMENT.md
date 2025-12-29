# 🚀 Your Deployment - Simple Steps

Everything is ready! Here's what YOU need to do:

---

## ✅ STEP 1: Create Your Own GitHub Repository

**Go to:** https://github.com/new

**Fill in:**
- Repository name: `llm-council` (or any name you like)
- ✅ Make it **Public**
- **DO NOT** check any other boxes
- Click **"Create repository"**

**After creating, copy your GitHub username** (top right corner)

---

## ✅ STEP 2: Push Code to GitHub

**Open Terminal** (Press `Cmd + Space`, type "Terminal")

**Run these commands one by one** (replace `YOUR-USERNAME` with your GitHub username):

```bash
cd /Users/hughrashid/Cursor/LLM-Council
```

```bash
git remote remove origin
```

```bash
git remote add origin https://github.com/YOUR-USERNAME/llm-council.git
```

```bash
git push -u origin main
```

**When it asks for password:** Use a GitHub Personal Access Token (get it from https://github.com/settings/tokens)

---

## ✅ STEP 3: Deploy Backend (Railway)

1. Go to: **https://railway.app**
2. Sign in with **GitHub**
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select **`llm-council`**
5. Wait 2-3 minutes
6. Click **"Variables"** tab
7. Click **"New Variable"**
8. Name: `OPENROUTER_API_KEY`
9. Value: (your OpenRouter API key from https://openrouter.ai/keys)
10. Click **"Add"**
11. Click **"Settings"** → **"Generate Domain"**
12. **Copy the URL** (save it!)

---

## ✅ STEP 4: Deploy Frontend (Vercel)

1. Go to: **https://vercel.com**
2. Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Import **`llm-council`**
5. **Root Directory:** Type `frontend` (IMPORTANT!)
6. **Environment Variables:** Click **"Add"**
   - Name: `VITE_API_BASE_URL`
   - Value: (paste Railway URL from Step 3)
7. Click **"Deploy"**
8. Wait 2-3 minutes
9. **Copy your Vercel URL** - This is your live app! 🎉

---

## 📝 What You Need to Enter:

1. **GitHub username** (for Step 2)
2. **OpenRouter API key** (for Railway Step 3)
3. **Railway URL** (for Vercel Step 4)

That's it! Everything else is automatic.

