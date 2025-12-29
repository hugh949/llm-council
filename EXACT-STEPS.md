# 🎯 EXACT STEPS - Follow These in Order

I've prepared everything. Here's exactly what YOU need to do:

---

## ✅ STEP 1: Create GitHub Repository

**What to do:**
1. Open: https://github.com/new
2. Repository name: Type exactly: `llm-council`
3. ✅ Make it **Public**
4. **DO NOT** check "Add a README file" or any other boxes
5. Click green **"Create repository"** button
6. **Copy your GitHub username** (top right corner of GitHub)

**Time:** 2 minutes

---

## ✅ STEP 2: Push Code to GitHub

**What to do:**
1. Open **Terminal** on your Mac (Press `Cmd + Space`, type "Terminal", press Enter)
2. Copy and paste this command (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
cd /Users/hughrashid/Cursor/LLM-Council && ./DEPLOY-NOW.sh YOUR-USERNAME
```

**Example:** If your username is `johnsmith`, the command is:
```bash
cd /Users/hughrashid/Cursor/LLM-Council && ./DEPLOY-NOW.sh johnsmith
```

3. Press Enter
4. If it asks for username: Enter your GitHub username
5. If it asks for password: **DO NOT use your password!** Instead:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name it: "LLM Council"
   - Check the **"repo"** checkbox
   - Click "Generate token" at bottom
   - **Copy the token** (you'll only see it once!)
   - Paste it as the password in Terminal

**Time:** 3-5 minutes

---

## ✅ STEP 3: Deploy Backend to Railway

**What to do:**
1. Open: https://railway.app
2. Click **"Start a New Project"** (or "Login" if you have an account)
3. Sign in with **GitHub** (click the GitHub button)
4. Click **"Deploy from GitHub repo"**
5. Find **`llm-council`** in the list and click it
6. Wait 2-3 minutes (Railway will start deploying)
7. Click on your project name (left sidebar)
8. Click **"Variables"** tab (left sidebar)
9. Click **"New Variable"** button
10. Enter exactly:
    - **Name:** `OPENROUTER_API_KEY`
    - **Value:** (paste your OpenRouter API key - get it from https://openrouter.ai/keys)
11. Click **"Add"**
12. Wait 1 minute for automatic redeploy
13. Click **"Settings"** tab (left sidebar)
14. Scroll down to **"Domains"** section
15. Click **"Generate Domain"** button
16. **Copy the URL** that appears (looks like: `https://llm-council-production-xxxx.up.railway.app`)

**📝 WRITE THIS URL DOWN - You'll need it in Step 4!**

**Time:** 5 minutes

---

## ✅ STEP 4: Deploy Frontend to Vercel

**What to do:**
1. Open: https://vercel.com
2. Click **"Sign Up"** (or "Login" if you have an account)
3. Sign in with **GitHub** (click the GitHub button)
4. Click **"Add New..."** → **"Project"**
5. Find **`llm-council`** in the list and click **"Import"**
6. **IMPORTANT:** Under "Root Directory", click the **"Edit"** link
7. Type exactly: `frontend` (all lowercase)
8. Scroll down to **"Environment Variables"** section
9. Click **"Add"** button
10. Enter exactly:
    - **Name:** `VITE_API_BASE_URL`
    - **Value:** (paste the Railway URL from Step 3, #16 - make sure there's NO slash at the end)
11. Click **"Add"** button
12. Scroll all the way to the bottom
13. Click the big blue **"Deploy"** button
14. Wait 2-3 minutes for deployment

**Time:** 5 minutes

---

## ✅ STEP 5: Test Your App!

**What to do:**
1. Once Vercel shows **"Ready"** (green checkmark), you'll see a URL
2. Click on that URL (or copy it)
3. Your app should open in a new tab!
4. Try clicking **"+ New Conversation"**
5. If it works, **SUCCESS!** 🎉

**Time:** 1 minute

---

## 📝 Summary - What You Need to Enter:

1. **GitHub username** (for Step 2 command)
2. **OpenRouter API key** (for Railway Step 3, #10) - Get from: https://openrouter.ai/keys
3. **Railway URL** (for Vercel Step 4, #10) - Copy from Railway Step 3, #16

---

## 🆘 Troubleshooting

**If Step 2 fails (GitHub push):**
- Make sure you created the repository first (Step 1)
- Make sure you're using a Personal Access Token, not your password
- Try the commands manually from START-HERE.md

**If Step 3 fails (Railway):**
- Check Railway logs: Click project → "Deployments" → Latest → "View Logs"
- Make sure `OPENROUTER_API_KEY` is set correctly

**If Step 4 fails (Vercel):**
- Make sure you typed `frontend` (not `Frontend`) as root directory
- Make sure Railway URL has no trailing slash
- Check Vercel logs: Click project → "Deployments" → Latest → "View Function Logs"

**If app doesn't work:**
- Check that `VITE_API_BASE_URL` in Vercel matches your Railway URL exactly
- Make sure Railway is running (check Railway dashboard)

---

## ✅ Ready to Start?

1. Go to Step 1 above
2. Follow each step in order
3. That's it!

