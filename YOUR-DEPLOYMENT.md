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

## ✅ STEP 3: Deploy Backend (Azure)

**Follow the detailed guide: `DEPLOY-AZURE.md`**

Quick steps:
1. Go to: **https://portal.azure.com**
2. Sign in with your **Xavor account**
3. Create a **Web App** (Python 3.11, Linux)
4. Connect your **GitHub repository**
5. Add environment variable: `OPENROUTER_API_KEY` (your API key from https://openrouter.ai/keys)
6. Deploy and get your Azure backend URL
7. **Copy the URL** (save it!)

**See `DEPLOY-AZURE.md` for complete step-by-step instructions.**

---

## ✅ STEP 4: Deploy Frontend (Azure Static Web Apps)

**Follow the detailed guide: `DEPLOY-FRONTEND-AZURE.md`**

Quick steps:
1. Go to: **https://portal.azure.com**
2. Create a **Static Web App**
3. Connect your **GitHub repository**
4. Configure build settings (Vite preset, App location: `/frontend`)
5. Add environment variable: `VITE_API_BASE_URL` = (your backend URL from Step 3)
6. Deploy and get your Azure Static Web App URL
7. **Copy the URL** - This is your live app! 🎉

**See `DEPLOY-FRONTEND-AZURE.md` for complete step-by-step instructions.**

---

## 📝 What You Need to Enter:

1. **GitHub username** (for Step 2)
2. **OpenRouter API key** (for Azure Step 3)
3. **Azure backend URL** (for Azure Static Web Apps Step 4)

That's it! Everything else is automatic.

