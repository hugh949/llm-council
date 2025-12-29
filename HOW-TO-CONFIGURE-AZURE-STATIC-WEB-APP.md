# 🔧 How to Configure Azure Static Web App Deployment

Azure Static Web Apps uses **GitHub Actions** for deployment, not the same "Deployment Center" as App Service. Here's how to configure it correctly:

---

## ✅ Step 1: Check Your Static Web App Configuration

1. Go to: **https://portal.azure.com**
2. Search for: **"Static Web Apps"**
3. Click on your Static Web App
4. In the **Overview** page, look for **"GitHub repository"** or check the left sidebar

---

## ✅ Step 2: Verify GitHub Connection

### Option A: Check in Azure Portal

In your Static Web App, look for:
- **Left sidebar** → **"Configuration"** → Check for GitHub settings
- **Left sidebar** → **"Overview"** → Look for repository information
- **Left sidebar** → **"Deployment"** or **"Deployment history"**

### Option B: Check GitHub Actions (Most Reliable)

1. Go to: **https://github.com/hugh949/llm-council** (your repository)
2. Click **"Actions"** tab (top navigation)
3. Look for workflows named something like:
   - `Azure Static Web Apps CI/CD`
   - `azure-static-web-apps-xxx` (where xxx is your app name)

**If you see GitHub Actions workflows:**
- ✅ GitHub is connected!
- ✅ Auto-deployment is enabled!
- ✅ Every push to `main` triggers a deployment

**If you don't see GitHub Actions workflows:**
- GitHub might not be connected properly
- Follow Step 3 to connect it

---

## ✅ Step 3: Connect GitHub (If Not Connected)

### Method 1: During Static Web App Creation (Recommended)

If you haven't created the Static Web App yet:

1. Go to Azure Portal → Create Resource → **Static Web App**
2. In the **"Basics"** tab:
   - Fill in app details
3. In the **"Deployment"** tab:
   - **Source:** Select **"GitHub"**
   - **Sign in with GitHub:** Click and authorize
   - **Organization:** Select your GitHub username
   - **Repository:** Select **`llm-council`**
   - **Branch:** Select **`main`**
   - **Build Presets:** Select **"Vite"**
   - **App location:** `/frontend`
   - **Output location:** `dist`
4. Click **"Review + create"** then **"Create"**

**This automatically:**
- Creates a GitHub Actions workflow file
- Sets up automatic deployment
- Connects GitHub to Azure

### Method 2: Disconnect and Recreate (If Already Created)

If your Static Web App exists but GitHub isn't connected:

**Note:** Azure Static Web Apps doesn't easily allow changing the GitHub connection after creation. You may need to:

1. **Option A: Recreate the Static Web App** (if it's new/empty)
   - Delete the existing one
   - Create new one with GitHub connection (Method 1 above)

2. **Option B: Manually Add GitHub Actions Workflow**
   - See Step 4 below

---

## ✅ Step 4: Manually Set Up GitHub Actions (If Needed)

If GitHub Actions workflow is missing, you can create it manually:

1. Go to: **https://github.com/hugh949/llm-council**
2. Click **"Actions"** tab
3. If prompted, click **"Set up a workflow yourself"** or **"New workflow"**
4. Create a file: `.github/workflows/azure-static-web-apps.yml`

**Content for the workflow file:**

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_XXX }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: ""
          output_location: "dist"
        env:
          NODE_VERSION: "18.x"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_XXX }}
          action: "close"
```

**⚠️ Important:** Replace `XXX` in `AZURE_STATIC_WEB_APPS_API_TOKEN_XXX` with your actual deployment token.

**To get the deployment token:**
1. Azure Portal → Your Static Web App
2. Look for **"Manage deployment token"** or **"Deployment token"**
3. Copy the token
4. In GitHub: Repository → Settings → Secrets → New repository secret
5. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_XXX` (use the exact name from Azure)
6. Value: Paste the token

---

## ✅ Step 5: Verify Auto-Deployment is Working

1. **Make a small change** to your code
2. **Push to GitHub:**
   ```bash
   git push origin main
   ```
3. **Go to GitHub:**
   - Repository → **"Actions"** tab
   - You should see a workflow running
   - Wait 2-3 minutes
   - Status should show **"Completed"** with green checkmark

4. **Check your Azure Static Web App:**
   - The app should update automatically

---

## 🔍 Alternative: Check Deployment Status in Azure

In Azure Portal → Your Static Web App:

1. Look for **"Deployment history"** or **"Deployments"** (left sidebar)
2. Or check **"Configuration"** → **"General settings"**
3. Look for **"GitHub repository"** information

---

## 📋 Quick Checklist

- [ ] Static Web App is created in Azure
- [ ] GitHub Actions workflow exists (check GitHub → Actions tab)
- [ ] Workflow runs when you push to GitHub
- [ ] Deployment completes successfully
- [ ] App updates after deployment

---

## 🎯 Summary

**Azure Static Web Apps uses GitHub Actions for deployment:**

1. ✅ If GitHub was connected during creation → Auto-deployment is enabled
2. ✅ Check GitHub → Actions tab to verify
3. ✅ Every push to `main` triggers deployment
4. ✅ No manual sync needed - it's automatic!

**The key is: Check GitHub Actions, not "Deployment Center"!**

