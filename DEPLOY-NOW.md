# 🚀 Deploy Single URL - Step by Step

## ✅ Pre-Deployment Checklist

Before deploying, make sure:
- [x] Code is pushed to GitHub (✅ Done!)
- [ ] You have Azure Portal access
- [ ] You have your OpenRouter API key ready

---

## 📋 Step 1: Go to Azure Portal

1. Open: **https://portal.azure.com**
2. Sign in with your Xavor account

---

## 📋 Step 2: Find Your Existing App Service

1. In the Azure Portal search bar (top), type: **"App Services"**
2. Click on **"App Services"**
3. Find your existing backend app (e.g., `llm-council-backend` or similar)
4. Click on it to open

---

## 📋 Step 3: Update Startup Command

1. In the left sidebar, click **"Configuration"**
2. Click on the **"General settings"** tab
3. Scroll down to **"Startup Command"**
4. Enter: `startup.sh`
5. Click **"Save"** at the top
6. Click **"Continue"** when prompted

---

## 📋 Step 4: Add Node.js Runtime

Since we need Node.js to build the frontend:

### Option A: Add Node.js Extension (Easiest)

1. In the left sidebar, click **"Extensions"**
2. Click **"+ Add"**
3. Search for: **"Node.js LTS"** or **"Node.js 18.x"**
4. Click **"Next"** → **"OK"** to install
5. Wait for installation (takes 1-2 minutes)

### Option B: Set Node.js Version (Alternative)

1. Go to **"Configuration"** → **"General settings"**
2. Find **"Stack settings"** → **"Node.js version"**
3. Select: **"18 LTS"** or **"20 LTS"**
4. Click **"Save"**

---

## 📋 Step 5: Verify Environment Variables

1. Go to **"Configuration"** → **"Application settings"**
2. Make sure you have:
   - `OPENROUTER_API_KEY` = Your OpenRouter API key
3. If missing, click **"+ New application setting"** to add it
4. Click **"Save"**

---

## 📋 Step 6: Restart the App Service

1. In the left sidebar, click **"Overview"**
2. Click **"Restart"** button at the top
3. Click **"Yes"** to confirm
4. Wait 1-2 minutes for restart

---

## 📋 Step 7: Check Deployment Status

1. In the left sidebar, click **"Deployment Center"** (or **"Deployment"**)
2. Make sure it's connected to your GitHub repository
3. Check that the latest deployment is successful

**OR** if using GitHub Actions:

1. Go to: **https://github.com/hugh949/llm-council/actions**
2. Check that the latest workflow completed successfully

---

## 📋 Step 8: Test Your App

1. In Azure Portal, go to **"Overview"** of your App Service
2. Find **"Default domain"** (e.g., `https://llm-council-backend.azurewebsites.net`)
3. Click the URL to open it
4. You should see:
   - ✅ The React app (LLM Council interface)
   - ✅ Not the JSON API response

---

## 📋 Step 9: Test API Endpoint

1. Open: `https://your-app.azurewebsites.net/api/`
2. Should return: `{"status":"ok","service":"LLM Council API"}`

---

## 🎉 Done!

Your app is now deployed at **one URL**!

- **Frontend + Backend:** `https://your-app.azurewebsites.net`
- **API Health Check:** `https://your-app.azurewebsites.net/api/`

---

## 🔧 Troubleshooting

### Frontend Not Showing

**Problem:** You see JSON instead of React app

**Solution:**
1. Check **"Log stream"** in Azure Portal for errors
2. Verify `startup.sh` is set as startup command
3. Check if Node.js extension is installed
4. Look for build errors in the logs

### Build Fails

**Problem:** `npm: command not found` in logs

**Solution:**
1. Install Node.js extension (Step 4)
2. Restart the App Service
3. Check logs again

### API Not Working

**Problem:** API endpoints return 404

**Solution:**
1. Test `/api/` endpoint directly
2. Check that routes start with `/api/`
3. Verify backend is running (check logs)

---

## 📞 Need Help?

Check the logs:
1. Azure Portal → Your App Service → **"Log stream"**
2. Look for error messages
3. Common issues:
   - Node.js not installed → Install extension
   - Build failed → Check npm errors in logs
   - Frontend files not found → Check startup.sh ran successfully

---

**That's it! Your app should now work at one URL! 🎉**


