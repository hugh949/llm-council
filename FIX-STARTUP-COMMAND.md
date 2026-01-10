# 🔧 Fix Startup Command - Directory Not Found

## ❌ The Error

Your logs show:
```
cd: can't cd to /tmp/8de475922a03fff
```

This means the startup command is trying to `cd` to a directory that doesn't exist yet.

## ✅ Solution: Use Simple Command

The `startup.sh` script already has logic to find the extracted directory. We don't need to `cd` first.

### Change Startup Command in Azure Portal

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings**
3. **Startup Command:** Change to:
   ```
   bash startup.sh
   ```
   (Just `bash startup.sh` - no path, no cd)

4. **Save** (top of page)
5. **Restart** App Service

## Why This Works

- Oryx extracts files to `/home/site/wwwroot`
- `startup.sh` is in the repo root, so it's at `/home/site/wwwroot/startup.sh`
- The script has logic to find the extracted directory (`/tmp/8de475922a03fff`)
- We don't need to `cd` manually - the script handles it

## What startup.sh Does

The script:
1. Finds the extracted directory automatically
2. Changes to that directory
3. Builds the frontend if needed
4. Starts the Python app

So we just need to call it from the working directory!

---

**Change startup command to: `bash startup.sh` and restart!** ✅


