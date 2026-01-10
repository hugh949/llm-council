# 🔧 Fix Azure Static Web Apps Deployment Error

## ❌ The Problem

You're getting this error in GitHub Actions:

```
The content server has rejected the request with: BadRequest
Reason: No matching Static Web App was found or the api key was invalid.
```

**Why this is happening:**
- GitHub Actions is trying to deploy to Azure Static Web Apps
- But we're using **single URL deployment** (frontend served from backend)
- So we **don't need** Azure Static Web Apps anymore!

---

## ✅ Solution: Disable Azure Static Web Apps Deployment

Since we're using a single URL (frontend + backend together), we need to **disable** the Azure Static Web Apps deployment.

### Option 1: Delete the GitHub Actions Workflow (Recommended)

1. **Go to GitHub:**
   - https://github.com/hugh949/llm-council
   - Click **"Actions"** tab (top navigation)

2. **Find the Static Web Apps workflow:**
   - Look for workflow named: `Azure Static Web Apps CI/CD` or similar
   - Click on it

3. **Delete the workflow file:**
   - Click the **"..."** menu (top right)
   - Click **"Delete workflow"**
   - Confirm deletion

   **OR** manually delete the file:
   - Go to your repository
   - Navigate to: `.github/workflows/`
   - Delete any file with `static-web-apps` in the name

---

### Option 2: Disable the Workflow (Keep File but Don't Run)

1. **Go to GitHub:**
   - https://github.com/hugh949/llm-council
   - Click **"Actions"** tab

2. **Find the Static Web Apps workflow**

3. **Disable it:**
   - Click on the workflow
   - Click **"..."** menu → **"Disable workflow"**

---

### Option 3: Delete Azure Static Web App Resource (If You Created One)

If you created an Azure Static Web App resource, you can delete it:

1. **Azure Portal:**
   - Go to: https://portal.azure.com
   - Search for: **"Static Web Apps"**
   - Find your Static Web App (if any)
   - Click on it → **"Delete"** → Confirm

**Note:** This is optional - just disabling the workflow is enough.

---

## ✅ Verify It's Fixed

After disabling/deleting the workflow:

1. **Make a small change** to your code
2. **Push to GitHub:**
   ```bash
   git push origin main
   ```
3. **Check GitHub Actions:**
   - Go to: https://github.com/hugh949/llm-council/actions
   - You should **NOT** see the Static Web Apps deployment running
   - No more errors!

---

## 📋 Summary

**What to do:**
1. ✅ Go to GitHub → Actions
2. ✅ Find "Azure Static Web Apps" workflow
3. ✅ Delete or disable it
4. ✅ Done!

**Why:**
- We're using **single URL deployment** (frontend + backend together)
- Azure Static Web Apps is **not needed** anymore
- The error will stop once the workflow is disabled/deleted

---

**After disabling the workflow, the error will stop!** ✅


