# 🚀 Quick Deployment - What YOU Need to Do

I've set up everything automatically. You just need to follow these 3 simple steps:

## ✅ Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `llm-council`
3. Make it **Public** ✅
4. Click **"Create repository"**
5. **Copy your GitHub username** (you'll need it in Step 2)

---

## ✅ Step 2: Push Code to GitHub

Open Terminal on your Mac and run these commands (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
cd /Users/hughrashid/Cursor/LLM-Council
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/llm-council.git
git push -u origin main
```

**Example:** If your username is `johnsmith`, the 4th command would be:
```bash
git remote add origin https://github.com/johnsmith/llm-council.git
```

**If it asks for username/password:** Use a GitHub Personal Access Token (not your password). Get one at: https://github.com/settings/tokens

---

## ✅ Step 3: Deploy Backend (Railway)

1. Go to: https://railway.app
2. Sign in with **GitHub**
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select **`llm-council`**
6. Railway will start deploying (wait 2-3 minutes)
7. Click **"Variables"** tab
8. Click **"New Variable"**
9. Enter:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** (paste your OpenRouter API key - get it from https://openrouter.ai/keys)
10. Click **"Add"**
11. Wait for redeploy (automatic)
12. Click **"Settings"** → Scroll down → Click **"Generate Domain"**
13. **Copy the URL** (looks like: `https://llm-council-production-xxxx.up.railway.app`)

**Save this URL - you'll need it next!**

---

## ✅ Step 4: Deploy Frontend (Vercel)

1. Go to: https://vercel.com
2. Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Import **`llm-council`** repository
5. **IMPORTANT:** Under "Root Directory", click "Edit" and type: `frontend`
6. Scroll down to **"Environment Variables"**
7. Click **"Add"** and enter:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** (paste the Railway URL from Step 3, #13)
8. Click **"Add"**
9. Click **"Deploy"** (bottom of page)
10. Wait 2-3 minutes for deployment

---

## ✅ Step 5: Test Your App!

1. Once Vercel shows "Ready", click the URL (looks like: `https://llm-council.vercel.app`)
2. Your app should open!
3. Try creating a new conversation
4. If it works, **you're done!** 🎉

---

## 📝 Summary - What You Need to Enter:

1. **GitHub:** Your username (for the git command)
2. **Railway:** Your OpenRouter API key (from https://openrouter.ai/keys)
3. **Vercel:** The Railway URL (from Step 3, #13)

That's it! Everything else is automatic.

---

## 🆘 Need Help?

If something doesn't work:
- Check that you typed `frontend` as the root directory in Vercel
- Make sure the Railway URL in Vercel doesn't have a trailing slash
- Check Railway logs: Project → Deployments → Latest → View Logs
- Check Vercel logs: Project → Deployments → Latest → View Function Logs

