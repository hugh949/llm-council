# 🚀 Complete Deployment Guide - Azure Only

This guide covers deploying the entire LLM Council application using **Azure only** - backend and frontend.

---

## 📋 Prerequisites

- Microsoft Azure account (Xavor account access)
- GitHub account
- OpenRouter API key (from https://openrouter.ai/keys)
- Code pushed to GitHub

---

## 🎯 Overview

1. **Backend:** Azure App Service (Python/FastAPI)
2. **Frontend:** Azure Static Web Apps (React/Vite)
3. **Database:** SQLite (built-in)

**Everything in one platform - easier to manage!**

---

## 📦 Part 1: Deploy Backend to Azure App Service

Follow the detailed guide: **`DEPLOY-AZURE.md`**

### Quick Steps:
1. Create Azure Web App
2. Connect GitHub repository
3. Configure environment variables
4. Set startup command
5. Deploy
6. Get backend URL

**See `DEPLOY-AZURE.md` for complete step-by-step instructions.**

**After deployment, copy your backend URL** (e.g., `https://llm-council-backend.azurewebsites.net`)

---

## 🌐 Part 2: Deploy Frontend to Azure Static Web Apps

Follow the detailed guide: **`DEPLOY-FRONTEND-AZURE.md`**

### Quick Steps:
1. Create Azure Static Web App
2. Connect GitHub repository
3. Configure build settings (Vite preset)
4. Add environment variable: `VITE_API_BASE_URL` = (your backend URL)
5. Deploy
6. Get frontend URL

**See `DEPLOY-FRONTEND-AZURE.md` for complete step-by-step instructions.**

---

## ✅ Part 3: Verify Deployment

### Test Backend:
1. Open your Azure App Service URL
2. Should see: `{"status":"ok","service":"LLM Council API"}`

### Test Frontend:
1. Open your Azure Static Web App URL
2. Click "New Conversation"
3. Should work without errors!

---

## 🔑 Required Environment Variables

### Azure App Service (Backend):
- `OPENROUTER_API_KEY` (required)
- `PORT` (optional, Azure sets automatically)
- `WEBSITES_PORT` (optional, set to 8000)

### Azure Static Web Apps (Frontend):
- `VITE_API_BASE_URL` (required - your backend URL)

---

## 📝 Quick Checklist

- [ ] Backend deployed to Azure App Service
- [ ] `OPENROUTER_API_KEY` set in backend
- [ ] Backend URL copied
- [ ] Frontend deployed to Azure Static Web Apps
- [ ] `VITE_API_BASE_URL` set in frontend (points to backend URL)
- [ ] Both services tested and working
- [ ] Everything in Azure! ✅

---

## 🚨 Troubleshooting

- **405 Error:** Check `VITE_API_BASE_URL` points to backend (not frontend)
- **Backend not accessible:** Verify App Service is running
- **Frontend build fails:** Check build settings in Static Web Apps
- **API errors:** Check `OPENROUTER_API_KEY` is set in backend

See:
- `FIX-405-ERROR.md` for 405 errors
- `DEPLOY-AZURE.md` for backend issues
- `DEPLOY-FRONTEND-AZURE.md` for frontend issues
- `TROUBLESHOOTING.md` for general troubleshooting

---

## 💰 Cost Estimate

### Azure App Service (Backend):
- **Free F1:** Free (limited, shared CPU)
- **Basic B1:** ~$13/month (recommended for 10 users)
- **Standard S1:** ~$55/month (better performance)

### Azure Static Web Apps (Frontend):
- **Free:** Up to 100 GB bandwidth/month (sufficient for 10 users)
- **Standard:** ~$9/month (better features, custom domains)

**Total estimated cost for 10 active users:**
- Minimum: **Free** (Free tier for both)
- Recommended: **~$13/month** (Basic B1 backend + Free frontend)

---

## ✅ Advantages of Azure-Only Deployment

- ✅ **Single platform** - everything in Azure
- ✅ **Easier management** - one portal for everything
- ✅ **Better integration** - services work together seamlessly
- ✅ **Unified monitoring** - logs and metrics in one place
- ✅ **Cost efficient** - can optimize across services
- ✅ **Enterprise-grade** - Azure reliability and security

---

## 📚 Detailed Guides

- **Backend Deployment:** `DEPLOY-AZURE.md`
- **Frontend Deployment:** `DEPLOY-FRONTEND-AZURE.md`
- **Environment Variables:** `ENVIRONMENT-VARIABLES.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

**You're all set with everything in Azure!** 🎉


