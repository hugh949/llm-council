# 🔄 How to Sync Azure Static Web App with GitHub

## Quick Steps

1. Go to **Azure Portal**: https://portal.azure.com
2. Find your **Static Web App** (not the backend Web App)
3. Click **"Deployment Center"** (left sidebar)
4. Click **"Sync"** button (top toolbar)
5. Wait 2-3 minutes for deployment to complete

---

## 📋 Detailed Step-by-Step Instructions

### Step 1: Go to Azure Portal

1. Open your browser
2. Go to: **https://portal.azure.com**
3. Sign in with your Xavor account

### Step 2: Find Your Static Web App

**Option A: Search for it**
1. In the search bar at the top, type: **"Static Web Apps"**
2. Click on **"Static Web Apps"** service
3. Find your Static Web App in the list (e.g., `llm-council-frontend`)

**Option B: From All Resources**
1. Click **"All resources"** (left sidebar)
2. Filter by type: **"Static Web App"**
3. Click on your Static Web App

### Step 3: Open Deployment Center

1. In your Static Web App overview page
2. Look at the left sidebar
3. Under **"Deployment"** section
4. Click **"Deployment Center"**

### Step 4: Sync with GitHub

1. In the Deployment Center page
2. Look at the top toolbar
3. Click the **"Sync"** button
   - It's usually a circular arrow icon
   - Or a button that says "Sync" or "Redeploy"

4. Confirm if asked (usually no confirmation needed)
5. You'll see a notification that sync has started

### Step 5: Wait for Deployment

1. Stay on the Deployment Center page
2. Click **"Logs"** tab (if not already there)
3. You'll see the deployment progress
4. Wait 2-3 minutes for it to complete
5. Status will show **"Succeeded"** when done

---

## ✅ How to Verify Sync Worked

### Check Deployment Status

1. In Deployment Center → **"Logs"** tab
2. Look for the latest deployment
3. Status should show:
   - **"In Progress"** - Still deploying
   - **"Succeeded"** - Deployment complete ✅
   - **"Failed"** - Something went wrong (check logs)

### Check Deployment Logs

1. Click on the latest deployment log
2. Look for:
   - Build commands executing
   - "Build succeeded" or similar success messages
   - Any error messages (if deployment failed)

### Test Your App

1. Open your Static Web App URL (from Overview page)
2. Test the feature you just fixed
3. Should work correctly now!

---

## 🔍 What "Sync" Does

When you click "Sync":
- Azure pulls the latest code from your GitHub repository
- Builds your frontend application (using Vite)
- Deploys it to the Azure CDN
- Updates your app with the latest changes

---

## ⏱️ How Long Does It Take?

- **Typical sync time:** 2-3 minutes
- **Can be faster:** 1-2 minutes if minimal changes
- **Can be slower:** 3-5 minutes if many dependencies need updating

---

## 🚨 If Sync Fails

### Check Logs

1. Deployment Center → **"Logs"** tab
2. Click on the failed deployment
3. Look for error messages

### Common Issues:

**"Build failed"**
- Check if `package.json` exists
- Verify build settings (Vite preset, App location: `/frontend`)

**"Repository not found"**
- Check GitHub connection in Deployment Center → **"Settings"**
- Reconnect if needed

**"Branch not found"**
- Verify branch is set to `main` (or your default branch)
- Check Settings → Branch

---

## 📋 Quick Checklist

- [ ] Logged into Azure Portal
- [ ] Found Static Web App (not backend Web App)
- [ ] Opened Deployment Center
- [ ] Clicked "Sync" button
- [ ] Waited 2-3 minutes
- [ ] Checked deployment status (should show "Succeeded")
- [ ] Tested app to verify changes

---

## 🎯 Important Notes

1. **Frontend vs Backend:**
   - Make sure you're syncing the **Static Web App** (frontend)
   - NOT the Web App (backend)
   - They are separate services

2. **Automatic Sync:**
   - Azure can auto-sync when you push to GitHub
   - But manual "Sync" ensures you get the latest code immediately

3. **No Code Changes:**
   - If you just changed environment variables (like `VITE_API_BASE_URL`)
   - Azure will auto-redeploy after saving
   - No need to click "Sync" separately

---

**After syncing, your latest code changes will be live!** ✅

