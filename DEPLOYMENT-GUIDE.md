# 🚀 Complete Deployment Guide - Azure Backend + Vercel Frontend

This guide covers deploying the LLM Council application using **Azure App Service** for the backend and **Vercel** for the frontend.

---

## 📋 Prerequisites

- Microsoft Azure account (Xavor account access)
- GitHub account
- OpenRouter API key (from https://openrouter.ai/keys)
- Code pushed to GitHub

---

## 🎯 Overview

1. **Backend:** Azure App Service (Python/FastAPI)
2. **Frontend:** Vercel (React)
3. **Database:** SQLite (built-in, or PostgreSQL for production scale)

---

## 📦 Part 1: Deploy Backend to Azure

Follow the detailed guide: **`DEPLOY-AZURE.md`**

### Quick Steps:
1. Create Azure Web App
2. Connect GitHub repository
3. Configure environment variables
4. Deploy
5. Get backend URL

**See `DEPLOY-AZURE.md` for complete step-by-step instructions.**

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to: **https://vercel.com**
2. Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Import your **`llm-council`** repository
5. Configure:
   - **Root Directory:** `frontend` (IMPORTANT!)
   - **Framework Preset:** Vite (should auto-detect)
6. Click **"Deploy"**

### Step 2: Configure Environment Variables

1. Go to **"Settings"** → **"Environment Variables"**
2. Click **"Add New"**
3. Add:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** Your Azure backend URL (e.g., `https://your-app.azurewebsites.net`)
   - **Environment:** Production
4. Click **"Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## ✅ Part 3: Verify Deployment

### Test Backend:
1. Open your Azure backend URL
2. Should see: `{"status":"ok","service":"LLM Council API"}`

### Test Frontend:
1. Open your Vercel URL
2. Click "New Conversation"
3. Should work without errors!

---

## 🔑 Required Environment Variables

### Azure Backend:
- `OPENROUTER_API_KEY` (required)
- `PORT` (optional, Azure sets automatically)
- `WEBSITES_PORT` (optional, set to 8000)

### Vercel Frontend:
- `VITE_API_BASE_URL` (required - your Azure backend URL)

---

## 📝 Quick Checklist

- [ ] Backend deployed to Azure
- [ ] `OPENROUTER_API_KEY` set in Azure
- [ ] Azure backend URL works (test in browser)
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_BASE_URL` set in Vercel (points to Azure URL)
- [ ] Vercel redeployed after setting env var
- [ ] Everything tested and working!

---

## 🚨 Troubleshooting

- **405 Error:** Check `VITE_API_BASE_URL` points to Azure backend (not frontend)
- **Backend not accessible:** Verify Azure service is running
- **API errors:** Check `OPENROUTER_API_KEY` is set in Azure

See:
- `FIX-405-ERROR.md` for 405 errors
- `DEPLOY-AZURE.md` for Azure-specific issues
- `TROUBLESHOOTING.md` for general troubleshooting

---

## 📚 Detailed Guides

- **Azure Deployment:** `DEPLOY-AZURE.md`
- **Environment Variables:** `ENVIRONMENT-VARIABLES.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

**You're all set! Your app is deployed and ready for users.** 🎉
