# 🔍 How to Check Deployment Status

## ✅ Code Status (Already Verified)

- ✅ Frontend builds successfully
- ✅ Backend imports work
- ✅ No code errors

**If links don't work, it's a DEPLOYMENT issue, not a code issue.**

---

## Step 1: Check GitHub Actions

1. Go to: **https://github.com/hugh949/llm-council/actions**

2. Look for the **latest workflow run** at the top

3. Check the status:
   - ✅ **Green checkmark** = Deployment succeeded
   - ❌ **Red X** = Deployment failed (click to see errors)
   - 🟡 **Yellow circle** = Deployment in progress

4. **If failed:**
   - Click on the failed workflow
   - Scroll down to see error messages
   - Common errors:
     - Build errors (missing dependencies)
     - Configuration errors
     - Permission issues

---

## Step 2: Check Azure Static Web App

1. Go to **Azure Portal**: https://portal.azure.com

2. Navigate to your **Static Web App** resource

3. In the left sidebar, click **"Deployment history"** or **"GitHub Actions"**

4. Check:
   - Latest deployment status
   - Any error messages
   - Deployment time (should be recent)

5. Also check **"Configuration"**:
   - Verify `VITE_API_BASE_URL` is set
   - Should be your backend URL (e.g., `https://your-backend.azurewebsites.net`)

---

## Step 3: Check Backend (Azure App Service)

1. Go to **Azure Portal**

2. Navigate to your **App Service** (backend)

3. Click **"Log stream"** in the left sidebar

4. Check for:
   - Any error messages
   - Service running status
   - Startup errors

5. Test backend directly:
   - Open: `https://your-backend.azurewebsites.net/`
   - Should return: `{"status":"ok","service":"LLM Council API"}`

---

## Step 4: Test Frontend URL

1. Open: `https://purple-cliff-052a1150f.4.azurestaticapps.net`

2. **If you see:**
   - ✅ App interface = Frontend is working
   - ❌ 404 error = Deployment didn't complete
   - ❌ Blank page = Check browser console (F12)

3. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - Or try **incognito/private window**

---

## Step 5: Force Redeploy (If Needed)

If deployments are stuck or failed:

### Option 1: Trigger GitHub Actions Manually

1. Go to: https://github.com/hugh949/llm-council/actions
2. Click on the workflow (e.g., "Azure Static Web Apps CI/CD")
3. Click **"Run workflow"** button (top right)
4. Select branch: **main**
5. Click **"Run workflow"**

### Option 2: Make a Small Change and Push

1. Make a small change (like adding a space to a file)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Trigger redeploy"
   git push
   ```

---

## Quick Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 404 error on frontend | Deployment didn't complete | Check GitHub Actions, trigger redeploy |
| Blank page | JavaScript error | Check browser console (F12) |
| "Cannot connect to backend" | Backend not running or wrong URL | Check backend health, verify `VITE_API_BASE_URL` |
| Links don't work | Deployment issue | Check GitHub Actions status |

---

## What to Share If Still Stuck

1. **GitHub Actions status**: Screenshot or status message
2. **Browser console errors**: F12 → Console tab → Copy errors
3. **Backend health check**: Does `https://your-backend.azurewebsites.net/` work?
4. **Frontend URL status**: What do you see when opening the frontend URL?

---

**Most likely issue: GitHub Actions deployment failed or didn't complete. Check that first!**

