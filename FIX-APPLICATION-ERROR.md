# 🔧 Fix "Application Error" in Azure

The "Application Error" means your app failed to start. Let's fix it!

---

## Step 1: Check Log Stream (CRITICAL!)

This will show you exactly why the app failed:

1. **Azure Portal** → Your App Service (`llm-council-app-bnh9g9cwdhgdb5gj`)
2. **Left sidebar** → **"Log stream"** (under "Monitoring")
3. Click to open it
4. **Copy ALL error messages** you see

**Look for these common errors:**

### Error 1: `npm: command not found`
**Problem:** Node.js not installed  
**Fix:** Install Node.js extension (see Step 2)

### Error 2: `FileNotFoundError: startup.sh`
**Problem:** Startup script not found  
**Fix:** Check startup command is exactly `startup.sh` (no path, no quotes)

### Error 3: `ModuleNotFoundError: No module named 'fastapi'`
**Problem:** Python dependencies not installed  
**Fix:** Check `requirements.txt` exists and pip install works

### Error 4: `Failed to build` or npm errors
**Problem:** Frontend build failing  
**Fix:** Check Node.js is installed and npm works

### Error 5: `Permission denied` or `cannot execute`
**Problem:** Script permissions  
**Fix:** Startup script needs execute permissions

---

## Step 2: Verify Node.js is Installed

**This is often the cause!**

1. **Left sidebar** → **"Extensions"**
2. Check if **"Node.js LTS"** or similar is listed
3. **If NOT installed:**
   - Click **"+ Add"**
   - Search: **"Node.js LTS"**
   - Click **"Next"** → **"OK"**
   - Wait 1-2 minutes

---

## Step 3: Verify Startup Command

1. **Configuration** → **General settings** tab
2. **Startup Command** should be: `startup.sh`
   - ✅ Correct: `startup.sh`
   - ❌ Wrong: `"startup.sh"` or `./startup.sh` or `/startup.sh`

---

## Step 4: Check App Service Status

1. **Overview** → Check **"Status"**
2. Should be **"Running"**
3. If **"Stopped"**, click **"Start"**

---

## Step 5: Verify Environment Variables

1. **Configuration** → **Application settings**
2. Check `OPENROUTER_API_KEY` exists
3. If missing, add it

---

## Step 6: Check Deployment

1. **Deployment Center** → **Logs** tab
2. Check if deployment completed
3. Look for errors

**OR** check GitHub Actions:
- https://github.com/hugh949/llm-council/actions
- Latest workflow should be successful

---

## Step 7: Common Fixes

### Fix 1: Node.js Missing (Most Common!)

**If you see `npm: command not found` in logs:**

1. Install Node.js extension (Step 2)
2. **Restart App Service:**
   - **Overview** → **Restart**
   - Wait 2-3 minutes
3. Check Log stream again

---

### Fix 2: Startup Script Not Found

**If you see `FileNotFoundError: startup.sh`:**

1. Verify `startup.sh` exists in your GitHub repo root
2. Check startup command is exactly: `startup.sh`
3. **Restart App Service**

---

### Fix 3: Python Dependencies Not Installing

**If you see `ModuleNotFoundError`:**

1. Check `requirements.txt` exists in repo root
2. Check Log stream for pip install errors
3. May need to restart App Service

---

### Fix 4: Build Fails

**If frontend build fails:**

1. Check Node.js is installed
2. Check Log stream for specific npm errors
3. Verify `frontend/package.json` exists

---

## Step 8: Full Restart (Try This!)

Sometimes a full restart fixes everything:

1. **Overview** → **Stop**
2. Wait 30 seconds
3. **Start**
4. Wait 2-3 minutes
5. Check Log stream
6. Test URL again

---

## Step 9: What to Share for Help

If still not working, share:

1. **Log Stream output** - Copy all error messages
2. **Startup Command** - What does it show?
3. **Node.js** - Is extension installed?
4. **Environment Variables** - Is OPENROUTER_API_KEY set?
5. **Deployment Status** - Did GitHub Actions succeed?

---

## Quick Checklist

- [ ] Checked Log Stream for errors
- [ ] Node.js extension installed
- [ ] Startup command is `startup.sh` (no quotes)
- [ ] App Service status is "Running"
- [ ] OPENROUTER_API_KEY environment variable set
- [ ] Restarted App Service
- [ ] Checked deployment status

---

## Most Likely Issue

**90% of the time, it's missing Node.js!**

1. Go to **Extensions**
2. Install **"Node.js LTS"**
3. **Restart** App Service
4. Check Log stream again

---

**Start with Step 1 (Log Stream) - that will tell us exactly what's wrong!** 🔍


