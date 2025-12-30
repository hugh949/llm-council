# 🚀 Complete Deployment Guide - From Scratch

This guide will take you through everything from creating a new Azure App Service to deploying your app.

---

## ✅ Prerequisites

Before starting, make sure you have:
- [x] Your code pushed to GitHub (✅ Already done!)
- [ ] Azure Portal access (Xavor account)
- [ ] OpenRouter API key ready
- [ ] GitHub repository: `https://github.com/hugh949/llm-council`

---

## 📦 Step 1: Create Azure App Service

### 1.1 Access Azure Portal

1. Go to: **https://portal.azure.com**
2. Sign in with your **Xavor account** credentials
3. You'll see the Azure Portal dashboard

### 1.2 Create New Web App

1. Click **"Create a resource"** (top left, green + button)
2. Search for **"Web App"** in the search bar
3. Click **"Web App"** from the results
4. Click **"Create"** button

### 1.3 Configure Basics Tab

Fill in the following:

**Project Details:**
- **Subscription:** Select your Xavor subscription
- **Resource Group:** 
  - Click **"Create new"**
  - Name: `llm-council-rg` (or any name you like)
  - Click **"OK"**

**Instance Details:**
- **Name:** `llm-council-app` (or any unique name - must be globally unique)
  - Azure will show a green checkmark if available
  - Note: This will be part of your URL: `https://your-name.azurewebsites.net`
- **Publish:** Select **"Code"**
- **Runtime stack:** Select **"Python 3.11"** (or latest available)
- **Operating System:** Select **"Linux"**
- **Region:** Choose closest to you (e.g., `East US`, `West US 2`, `West Europe`)

**App Service Plan:**
- **Plan:** Click **"Create new"**
  - **Name:** `llm-council-plan`
  - **Operating System:** `Linux`
  - **Region:** Same as above
  - **Pricing tier:** 
    - Click **"Change size"**
    - For testing: **"Free F1"** (limited, but free)
    - For production: **"Basic B1"** or **"Standard S1"** (recommended)
  - Click **"Review + create"**
  - Click **"OK"**

Click **"Review + create"** at the bottom, then **"Create"**

**Wait 2-3 minutes** for Azure to create your app service.

---

## 🔗 Step 2: Link GitHub Repository

### 2.1 Access Deployment Center

1. Once created, click **"Go to resource"** button
2. Or search for your app service name in the top search bar
3. In the left sidebar, find **"Deployment"** section
4. Click **"Deployment Center"**

### 2.2 Connect GitHub

1. **Source:** Select **"GitHub"**
   - If prompted, click **"Authorize"** and sign in to GitHub
   - Authorize Azure to access your GitHub repositories

2. **Organization:** Select your GitHub username/organization

3. **Repository:** Select **`llm-council`**

4. **Branch:** Select **`main`**

5. **Build provider:** Select **"GitHub Actions"** (recommended)
   - Azure will automatically create a GitHub Actions workflow file

6. Click **"Save"** at the top

**Azure will now:**
- Create a GitHub Actions workflow file in your repository
- Set up automatic deployment
- Deploy your code automatically

**Wait 2-3 minutes** for the first deployment to complete.

---

## ⚙️ Step 3: Configure Application Settings

### 3.1 Add Environment Variables

1. In your App Service, go to **"Configuration"** (left sidebar, under "Settings")
2. Click **"Application settings"** tab
3. Click **"+ New application setting"**

Add these settings:

**Setting 1: OpenRouter API Key**
- **Name:** `OPENROUTER_API_KEY`
- **Value:** Your OpenRouter API key (from https://openrouter.ai/keys)
- Click **"OK"**

**Setting 2: Port (Optional but recommended)**
- **Name:** `PORT`
- **Value:** `8001`
- Click **"OK"**

4. Click **"Save"** at the top
5. Click **"Continue"** when prompted

---

## 🔧 Step 4: Configure Startup Command

### 4.1 Set Startup Command

**Navigation:**
1. In your App Service, look at the **left sidebar**
2. Find **"Settings"** section (scroll down if needed)
3. Click **"Configuration"** (under Settings)
4. You'll see tabs at the top: **Application settings** | **General settings** | etc.
5. Click the **"General settings"** tab

**Setting the Command:**
1. Scroll down on the General settings page
2. Look for **"Startup Command"** field (usually near the bottom)
3. Click in the text box
4. Enter: `startup.sh` (no quotes, just the text)
5. Click **"Save"** button at the **top** of the page (blue button in toolbar)
6. Click **"Continue"** when prompted

**💡 Can't find it?** See detailed guide: `HOW-TO-SET-STARTUP-COMMAND.md`

---

## 📦 Step 5: Add Node.js Runtime

Since we need Node.js to build the frontend:

### 5.1 Install Node.js Extension

1. In the left sidebar, click **"Extensions"**
2. Click **"+ Add"** button
3. Search for: **"Node.js LTS"** or **"Node.js 18.x"**
4. Click on it, then click **"Next"**
5. Click **"OK"** to install
6. Wait 1-2 minutes for installation

**OR** (Alternative method):

1. Go to **"Configuration"** → **"General settings"**
2. Find **"Stack settings"**
3. Under **"Node.js version"**, select **"18 LTS"** or **"20 LTS"**
4. Click **"Save"**

---

## 🔄 Step 6: Restart App Service

1. In the left sidebar, click **"Overview"**
2. Click **"Restart"** button at the top
3. Click **"Yes"** to confirm
4. Wait 2-3 minutes for restart

This ensures all configuration changes take effect.

---

## ✅ Step 7: Verify Deployment

### 7.1 Check Deployment Status

1. Go to **"Deployment Center"** (left sidebar)
2. Check **"Logs"** tab
3. Look for successful deployment messages

**OR** check GitHub Actions:

1. Go to: **https://github.com/hugh949/llm-council/actions**
2. Look for the latest workflow run
3. Should show **green checkmark** ✅ (success)

### 7.2 Test Your App

1. In Azure Portal, go to **"Overview"**
2. Find **"Default domain"** (e.g., `https://llm-council-app.azurewebsites.net`)
3. Click the URL to open it in a new tab

**Expected Results:**
- ✅ You should see the **React app** (LLM Council interface with Xavor logo)
- ✅ **NOT** a JSON response
- ✅ The app should load completely

### 7.3 Test API Endpoint

1. Open: `https://your-app-name.azurewebsites.net/api/`
2. Should return: `{"status":"ok","service":"LLM Council API"}`

---

## 🐛 Troubleshooting

### Problem: Frontend Not Showing (JSON instead of React app)

**Solution:**
1. Check **"Log stream"** in Azure Portal for errors
2. Verify `startup.sh` is set as startup command (Step 4)
3. Check if Node.js extension is installed (Step 5)
4. Look for build errors in the logs

### Problem: Build Fails (npm: command not found)

**Solution:**
1. Make sure Node.js extension is installed (Step 5)
2. Restart the App Service (Step 6)
3. Check **"Log stream"** for specific errors

### Problem: API Returns 404

**Solution:**
1. Test `/api/` endpoint directly
2. Check that backend is running (check logs)
3. Verify startup command is correct

### Problem: Deployment Fails in GitHub Actions

**Solution:**
1. Check GitHub Actions logs: https://github.com/hugh949/llm-council/actions
2. Look for specific error messages
3. Common issues:
   - Missing dependencies
   - Build errors
   - Configuration errors

### Problem: "Cannot connect to backend" in app

**Solution:**
1. This shouldn't happen with single URL deployment!
2. If it does, check that:
   - Frontend is being served from the same origin
   - No `VITE_API_BASE_URL` is set (should use same origin)
   - Backend is running (check logs)

---

## 📋 Checklist

Use this checklist to make sure everything is configured:

- [ ] Azure App Service created
- [ ] GitHub repository linked (Deployment Center)
- [ ] GitHub Actions workflow created
- [ ] `OPENROUTER_API_KEY` environment variable set
- [ ] Startup command set to `startup.sh`
- [ ] Node.js extension installed
- [ ] App Service restarted
- [ ] Deployment completed successfully
- [ ] Frontend loads at root URL
- [ ] API endpoint `/api/` works

---

## 🎉 Success!

Once everything is working:

- **Your app URL:** `https://your-app-name.azurewebsites.net`
- **API health check:** `https://your-app-name.azurewebsites.net/api/`
- **Everything in one URL!** No cross-reference needed!

---

## 📞 Need Help?

1. Check **"Log stream"** in Azure Portal for errors
2. Check GitHub Actions logs for deployment errors
3. Review this guide step by step
4. Common issues are covered in Troubleshooting section above

---

**That's it! Your complete deployment from scratch! 🚀**

