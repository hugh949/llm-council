# 🎯 START HERE - Simple Deployment Instructions

I've set up everything for you! Just follow these steps:

---

## 📋 What You Need (3 Things):

1. **GitHub account** (free) - https://github.com
2. **OpenRouter API key** - Get it from: https://openrouter.ai/keys
3. **Microsoft Azure account** (Xavor account) - https://portal.azure.com
4. **About 30 minutes** of your time

---

## 🚀 Step-by-Step Instructions

### Step 1: Create GitHub Repository (2 minutes)

1. Go to: **https://github.com/new**
2. Repository name: Type `llm-council`
3. ✅ Check **"Public"** (so Azure can access it)
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

### Step 3: Deploy Backend to Azure (10 minutes)

**Follow the detailed guide: `DEPLOY-AZURE.md`**

Quick overview:
1. Go to: **https://portal.azure.com**
2. Sign in with your **Xavor account**
3. Create a **Web App** (Python 3.11, Linux)
4. Connect your **GitHub repository**
5. Add environment variable: `OPENROUTER_API_KEY` (your API key from https://openrouter.ai/keys)
6. Configure startup command: `python -m backend.main`
7. Deploy and get your Azure backend URL
8. **Copy the URL** (looks like: `https://llm-council-backend.azurewebsites.net`)

**📝 Save this URL somewhere - you'll need it in Step 4!**

**See `DEPLOY-AZURE.md` for complete step-by-step instructions.**

---

### Step 4: Deploy Frontend to Azure Static Web Apps (10 minutes)

**Follow the detailed guide: `DEPLOY-FRONTEND-AZURE.md`**

Quick overview:
1. Go to: **https://portal.azure.com**
2. Create a **Static Web App**
3. Connect your **GitHub repository**
4. Configure build settings (Vite preset, App location: `/frontend`)
5. Add environment variable: `VITE_API_BASE_URL` = (paste backend URL from Step 3)
6. Deploy and get your Azure Static Web App URL
7. **Copy the URL** (looks like: `https://llm-council-frontend.azurestaticapps.net`)

**See `DEPLOY-FRONTEND-AZURE.md` for complete step-by-step instructions.**

---

### Step 5: Test Your App! (1 minute)

1. Once deployment is complete, open your Azure Static Web App URL
2. Your app should open!
3. Try clicking **"+ New Conversation"**
4. If it works, **you're done!** 🎉

---

## ✅ That's It!

Share the Azure Static Web App URL with others so they can test your app!

---

## 🆘 If Something Doesn't Work:

**App won't load:**
- Make sure both backend and frontend are deployed
- Check Azure Static Web App deployment history for errors
- Verify `VITE_API_BASE_URL` is set correctly

**Can't see conversations:**
- Check Azure App Service logs: "Log stream" (left sidebar)
- Make sure `OPENROUTER_API_KEY` is set in Azure App Service

**Need help?** Check the logs in Azure Portal for both services.

---

**Everything is now in Azure - easy to manage!** 🎉
