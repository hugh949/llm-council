# 🔧 Fix Oryx Startup Script Not Executing

## ❌ The Problem

Your logs show:
- ✅ Python is being used
- ✅ Startup command is set: `bash startup.sh`
- ❌ **No "🚀 STARTUP.SH STARTED" message**
- ❌ **App starts directly with Python**
- ❌ **startup.sh is NOT executing**

## 🔍 Root Cause

Oryx creates a wrapper script at `/opt/startup/startup.sh` that calls `bash startup.sh`, but:
1. It looks for `startup.sh` in `/home/site/wwwroot`
2. But files are extracted to `/tmp/8de47830c0021ed/`
3. So `startup.sh` is not found

## ✅ Solution: Use Full Path or Inline Command

### Option 1: Use Full Path in Startup Command (Recommended)

Change the startup command to use the extracted directory path:

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings**
3. **Startup Command:** Change to:
   ```
   find /tmp -maxdepth 1 -type d -name "*" | head -1 | xargs -I {} bash {}/startup.sh
   ```
   
   OR simpler:
   ```
   bash $(find /tmp -maxdepth 1 -type d -name "*" | head -1)/startup.sh
   ```

### Option 2: Inline the Build Logic (Alternative)

Put the build logic directly in the startup command:

```
cd $(find /tmp -maxdepth 1 -type d -name "*" | head -1) && if [ ! -f backend/static/index.html ]; then cd frontend && npm install && npm run build && cd .. && mkdir -p backend/static && cp -r frontend/dist/* backend/static/; fi && python -m backend.main
```

### Option 3: Use Python Directly with Build Script

Create a Python script that does the build, then starts the app:

1. Create `startup.py` in repo root
2. Change startup command to: `python startup.py`

---

## 🔍 Why This Happens

Oryx's wrapper script does:
```bash
cd /home/site/wwwroot
bash startup.sh
```

But `startup.sh` is in the extracted location `/tmp/.../`, not in `/home/site/wwwroot/`.

---

## ✅ Recommended Fix

**Use Option 1** - it's the cleanest and most reliable.

After changing the startup command, restart the App Service and check Log Stream for the build messages!

---

**The key is using the full path to startup.sh in the extracted location!** ✅


