# ✅ Remaining Steps Checklist

Since you've already set the startup command, here's what's left:

---

## ✅ Step 1: Verify Environment Variables

### Check if OPENROUTER_API_KEY is set:

1. In Azure Portal, go to your App Service
2. Left sidebar → **"Configuration"**
3. Click **"Application settings"** tab
4. Look for: **`OPENROUTER_API_KEY`**

**If it's NOT there:**
- Click **"+ New application setting"**
- **Name:** `OPENROUTER_API_KEY`
- **Value:** Your OpenRouter API key (from https://openrouter.ai/keys)
- Click **"OK"**
- Click **"Save"** at the top

**If it IS there:**
- ✅ Good! Move to next step

---

## ✅ Step 2: Add Node.js Runtime

**This is CRITICAL** - needed to build the frontend!

### Option A: Install Node.js Extension (Recommended)

1. In your App Service, left sidebar → **"Extensions"**
2. Click **"+ Add"** button
3. Search for: **"Node.js LTS"** or **"Node.js 18.x"**
4. Click on it, then **"Next"**
5. Click **"OK"** to install
6. Wait 1-2 minutes for installation

### Option B: Set Node.js in Configuration (Alternative)

1. Go to **"Configuration"** → **"General settings"** tab
2. Scroll to **"Stack settings"** section
3. Find **"Node.js version"**
4. Select: **"18 LTS"** or **"20 LTS"**
5. Click **"Save"**

**⚠️ IMPORTANT:** Choose ONE method (not both)

---

## ✅ Step 3: Link GitHub Repository (If Not Done)

### Check if GitHub is already linked:

1. Left sidebar → **"Deployment Center"** (or **"Deployment"**)
2. Check if it shows your GitHub repository

**If NOT linked:**

1. Click **"Settings"** or **"Edit"**
2. **Source:** Select **"GitHub"**
3. **Organization:** Your GitHub username
4. **Repository:** `llm-council`
5. **Branch:** `main`
6. **Build provider:** **"GitHub Actions"**
7. Click **"Save"**
8. Wait 2-3 minutes for first deployment

**If already linked:**
- ✅ Good! Move to next step

---

## ✅ Step 4: Save All Configuration Changes

Make sure all changes are saved:

1. If you added/edited any settings, click **"Save"** in Configuration
2. Click **"Continue"** when prompted
3. Wait for "Successfully updated" message

---

## ✅ Step 5: Restart App Service

**This is IMPORTANT** - ensures all changes take effect:

1. Left sidebar → **"Overview"**
2. Click **"Restart"** button at the top
3. Click **"Yes"** to confirm
4. Wait 2-3 minutes for restart

---

## ✅ Step 6: Verify Deployment

### Check GitHub Actions (if using GitHub Actions):

1. Go to: **https://github.com/hugh949/llm-council/actions**
2. Look for the latest workflow run
3. Should show **green checkmark** ✅ (success)

### Check Deployment Center:

1. In Azure Portal → Your App Service → **"Deployment Center"**
2. Click **"Logs"** tab
3. Look for successful deployment messages

---

## ✅ Step 7: Test Your App

### Test 1: Frontend (Main App)

1. In Azure Portal → **"Overview"**
2. Find **"Default domain"** (e.g., `https://your-app.azurewebsites.net`)
3. Click the URL to open it

**Expected Result:**
- ✅ You should see the **React app** (LLM Council interface with Xavor logo)
- ✅ **NOT** a JSON response
- ✅ The app should load completely

**If you see JSON instead of React app:**
- Check **"Log stream"** for errors
- Verify Node.js extension is installed (Step 2)
- Check if build succeeded in logs

### Test 2: API Endpoint

1. Open: `https://your-app.azurewebsites.net/api/`
2. Should return: `{"status":"ok","service":"LLM Council API"}`

**If 404 error:**
- Backend might not be running
- Check **"Log stream"** for errors

---

## ✅ Step 8: Check Logs (If Issues)

If something's not working:

1. Left sidebar → **"Log stream"**
2. Look for error messages
3. Common issues:
   - `npm: command not found` → Node.js not installed (Step 2)
   - `Failed to build` → Check build errors in logs
   - `Module not found` → Check startup command is `startup.sh`

---

## 📋 Quick Checklist

Use this to track your progress:

- [ ] ✅ Startup command set to `startup.sh` (DONE!)
- [ ] `OPENROUTER_API_KEY` environment variable set
- [ ] Node.js extension installed OR Node.js version set
- [ ] GitHub repository linked (if using GitHub deployment)
- [ ] All configuration changes saved
- [ ] App Service restarted
- [ ] Deployment completed successfully
- [ ] Frontend loads at root URL (React app, not JSON)
- [ ] API endpoint `/api/` works

---

## 🎯 Priority Order

**Most Critical (do these first):**
1. ✅ Node.js runtime (Step 2) - **REQUIRED** for frontend build
2. ✅ OPENROUTER_API_KEY (Step 1) - **REQUIRED** for app to work
3. ✅ Restart App Service (Step 5) - **REQUIRED** for changes to take effect

**Then:**
4. GitHub linking (if not done)
5. Testing
6. Troubleshooting (if needed)

---

## 🆘 Common Issues After Setup

### Issue: Frontend shows JSON instead of React app

**Cause:** Frontend not built (Node.js missing or build failed)

**Fix:**
1. Verify Node.js extension is installed (Step 2)
2. Check **"Log stream"** for build errors
3. Restart App Service (Step 5)

### Issue: "Cannot connect to backend" error

**This shouldn't happen** with single URL deployment, but if it does:

1. Check that backend is running (Log stream)
2. Verify no `VITE_API_BASE_URL` is set (should use same origin)
3. Check API endpoint `/api/` works

### Issue: App won't start

**Check:**
1. Log stream for errors
2. Startup command is exactly: `startup.sh` (no quotes)
3. All environment variables are set
4. Node.js is installed

---

## ✅ Next Steps After Everything Works

Once your app is working:

1. ✅ Test creating a new conversation
2. ✅ Test the full workflow (Step 1 → Step 2 → Step 3)
3. ✅ Share your app URL with users!

---

**That's it! Follow these steps in order and you'll be good to go! 🚀**


