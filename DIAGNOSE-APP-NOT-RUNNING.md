# 🔍 Diagnose: App Not Running

Follow these steps to identify what's wrong:

---

## Step 1: Check Log Stream (Most Important!)

This will show you exactly what's happening:

1. In Azure Portal → Your App Service
2. Left sidebar → **"Log stream"** (under "Monitoring")
3. Click to open it
4. **Copy ALL error messages** you see

**Look for:**
- ❌ `npm: command not found` → Node.js not installed
- ❌ `ModuleNotFoundError` → Python dependency missing
- ❌ `FileNotFoundError: startup.sh` → Startup script not found
- ❌ `Permission denied` → Script permissions issue
- ❌ Build errors → Frontend build failed
- ❌ `Failed to start` → Application startup error

**Share these error messages** and we can fix them!

---

## Step 2: Check App Service Status

1. In Azure Portal → Your App Service → **"Overview"**
2. Check **"Status"** - should be **"Running"**
3. If it says **"Stopped"**, click **"Start"**

---

## Step 3: Verify Configuration

### Check Startup Command:

1. **Configuration** → **General settings** tab
2. **Startup Command** should be: `startup.sh`
3. Should NOT have quotes: not `"startup.sh"` or `'startup.sh'`

### Check Environment Variables:

1. **Configuration** → **Application settings** tab
2. Look for: `OPENROUTER_API_KEY`
3. Should have a value (your API key)

### Check Node.js:

1. **Extensions** → Should show **"Node.js LTS"** or similar
2. OR **Configuration** → **General settings** → **Node.js version** should be set

---

## Step 4: Check GitHub Deployment

1. **Deployment Center** → **Logs** tab
2. Check if deployment completed successfully
3. Look for errors in deployment logs

**OR** check GitHub Actions:

1. Go to: https://github.com/hugh949/llm-council/actions
2. Check latest workflow run
3. Should show **green checkmark** ✅

---

## Step 5: Common Issues & Fixes

### Issue 1: `npm: command not found`

**Problem:** Node.js not installed

**Fix:**
1. Go to **Extensions** → **+ Add**
2. Install **"Node.js LTS"**
3. Restart App Service

---

### Issue 2: `FileNotFoundError: startup.sh`

**Problem:** Startup script not in repository or wrong path

**Fix:**
1. Check that `startup.sh` exists in your GitHub repo root
2. Verify startup command is exactly: `startup.sh` (no path, no quotes)
3. If using GitHub Actions, check that file is included in deployment

---

### Issue 3: `ModuleNotFoundError: No module named 'xxx'`

**Problem:** Python dependency missing

**Fix:**
1. Check `requirements.txt` includes all dependencies
2. Restart App Service (should reinstall dependencies)
3. Check Log stream for specific missing module

---

### Issue 4: Frontend Build Fails

**Problem:** npm build fails

**Fix:**
1. Check Log stream for specific build error
2. Verify Node.js is installed
3. Check that `frontend/package.json` exists
4. May need to check npm/node versions

---

### Issue 5: App Starts But Shows Error Page

**Problem:** App runs but has runtime errors

**Fix:**
1. Check Log stream for runtime errors
2. Test API endpoint: `/api/`
3. Check environment variables are set
4. Verify database initialization (if using SQLite)

---

### Issue 6: Shows JSON Instead of React App

**Problem:** Frontend not being served

**Fix:**
1. Check that `backend/static/index.html` exists (after build)
2. Check Log stream for static file serving errors
3. Verify startup script built frontend successfully
4. Check that routes are configured correctly in main.py

---

## Step 6: Quick Diagnostic Commands

If you have Azure CLI, you can run:

```bash
# Check app status
az webapp show --name YOUR-APP-NAME --resource-group YOUR-RG --query "state"

# View recent logs
az webapp log tail --name YOUR-APP-NAME --resource-group YOUR-RG

# Check configuration
az webapp config show --name YOUR-APP-NAME --resource-group YOUR-RG
```

---

## Step 7: What to Share for Help

If still not working, share:

1. **Log Stream output** - Copy all error messages
2. **App Status** - Running/Stopped?
3. **Startup Command** - What does it show?
4. **Environment Variables** - Is OPENROUTER_API_KEY set?
5. **Node.js** - Is extension installed?
6. **Deployment Status** - Did GitHub Actions succeed?
7. **What you see** - Blank page? Error message? JSON?

---

## 🆘 Emergency Fixes

### Try This First: Full Restart

1. **Configuration** → Save all settings again (even if unchanged)
2. **Overview** → **Stop** → Wait 30 seconds → **Start**
3. Check Log stream again

### Check File Structure

Make sure in your GitHub repo you have:
- ✅ `startup.sh` in root
- ✅ `requirements.txt` in root
- ✅ `backend/` directory with `main.py`
- ✅ `frontend/` directory with `package.json`

---

**Start with Step 1 (Log Stream) - that will tell us exactly what's wrong!** 🔍

