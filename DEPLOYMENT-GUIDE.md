# Simple Deployment Guide for LLM Council

This guide will help you deploy your app so others can use it. Follow these steps in order.

## Prerequisites

You'll need accounts for:
1. **GitHub** (free) - https://github.com
2. **Vercel** (free) - https://vercel.com (sign up with GitHub)
3. **Railway** (free tier available) - https://railway.app (sign up with GitHub)

## Step 1: Push Your Code to GitHub

**What you need to do:**
1. Go to https://github.com and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `llm-council` (or any name you like)
4. Make it **Public** (so Vercel/Railway can access it)
5. Click "Create repository"
6. GitHub will show you commands - **DON'T run them yet**

**What I'll do for you:**
I'll prepare your code and give you the exact commands to run.

---

## Step 2: Deploy Backend to Railway

**What you need to do:**
1. Go to https://railway.app and sign in with GitHub
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select your `llm-council` repository
5. Railway will start deploying automatically
6. Once deployed, click on your project
7. Click "Variables" tab
8. Click "New Variable"
9. Add this:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** (paste your OpenRouter API key here - get it from https://openrouter.ai/keys)
10. Click "Add"
11. Wait for Railway to redeploy (happens automatically)
12. Click "Settings" → "Generate Domain" → Copy the URL (looks like: `https://your-app.railway.app`)

**You'll need this URL for Step 3!**

---

## Step 3: Deploy Frontend to Vercel

**What you need to do:**
1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your `llm-council` repository
4. Configure:
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `frontend` (IMPORTANT - type this exactly)
   - **Build Command:** `npm run build` (should be auto-filled)
   - **Output Directory:** `dist` (should be auto-filled)
5. Click "Environment Variables"
6. Click "Add" and enter:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** (paste the Railway URL from Step 2, e.g., `https://your-app.railway.app`)
7. Click "Add"
8. Click "Deploy"

**Wait 2-3 minutes for deployment to complete!**

---

## Step 4: Test Your Deployment

**What you need to do:**
1. Once Vercel deployment is done, you'll see a URL like: `https://your-project.vercel.app`
2. Click on that URL to open your app
3. Try creating a new conversation
4. If it works, you're done! 🎉

---

## Troubleshooting

**If the app doesn't work:**
1. Check that you set `VITE_API_BASE_URL` in Vercel (Step 3, #6)
2. Check that you set `OPENROUTER_API_KEY` in Railway (Step 2, #9)
3. Make sure the Railway URL in Vercel doesn't have a trailing slash

**Need help?** Check the Railway and Vercel logs:
- Railway: Click your project → "Deployments" → Click latest deployment → "View Logs"
- Vercel: Click your project → "Deployments" → Click latest → "View Function Logs"

---

## Your Deployment URLs

After deployment, you'll have:
- **Frontend:** `https://your-project.vercel.app` (share this with others!)
- **Backend:** `https://your-app.railway.app` (keep this private)

---

## That's It!

Once deployed, share the Vercel URL with others so they can test your app!

