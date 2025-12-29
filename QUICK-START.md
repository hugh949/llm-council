# 🚀 Quick Deployment - Azure Only

Everything runs on Azure - backend and frontend!

## ✅ Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `llm-council`
3. Make it **Public** ✅
4. Click **"Create repository"**
5. **Copy your GitHub username**

---

## ✅ Step 2: Push Code to GitHub

Open Terminal and run (replace `YOUR-USERNAME` with your GitHub username):

```bash
cd /Users/hughrashid/Cursor/LLM-Council
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/llm-council.git
git push -u origin main
```

**If asked for password:** Use a GitHub Personal Access Token (get from https://github.com/settings/tokens)

---

## ✅ Step 3: Deploy Backend (Azure App Service)

**Follow: `DEPLOY-AZURE.md`**

Quick steps:
1. Go to: https://portal.azure.com
2. Create Web App (Python 3.11, Linux)
3. Connect GitHub repository
4. Add `OPENROUTER_API_KEY` environment variable
5. Set startup command: `python -m backend.main`
6. Get backend URL

---

## ✅ Step 4: Deploy Frontend (Azure Static Web Apps)

**Follow: `DEPLOY-FRONTEND-AZURE.md`**

Quick steps:
1. Go to: https://portal.azure.com
2. Create Static Web App
3. Connect GitHub repository
4. Configure build (Vite preset, App location: `/frontend`)
5. Add `VITE_API_BASE_URL` = (your backend URL)
6. Get frontend URL

---

## ✅ Step 5: Test!

Open your Azure Static Web App URL and try creating a conversation!

---

## 📝 What You Need:

1. **GitHub username**
2. **OpenRouter API key** (from https://openrouter.ai/keys)
3. **Azure account** (Xavor account)

---

**See `DEPLOYMENT-GUIDE.md` for complete instructions!** 🎉
