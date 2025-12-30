# 🔧 Fix: startup.sh: not found

## Problem

Azure can't find your `startup.sh` file. The error shows:
```
startup.sh: not found
```

## Solution

The issue is that Azure needs the startup script to be in the repository root and properly committed to Git.

### Step 1: Verify startup.sh is in Git

1. Check if `startup.sh` is tracked by Git:
   ```bash
   git ls-files | grep startup.sh
   ```

2. If it's NOT listed, add it:
   ```bash
   git add startup.sh
   git commit -m "Add startup.sh to repository"
   git push
   ```

### Step 2: Verify File Permissions

The file should be executable. Check:
```bash
ls -la startup.sh
```

Should show: `-rwxr-xr-x` (executable)

If not, make it executable:
```bash
chmod +x startup.sh
git add startup.sh
git commit -m "Make startup.sh executable"
git push
```

### Step 3: Alternative - Use Full Path

If the file still isn't found, try using the full path in Azure:

1. **Configuration** → **General settings**
2. **Startup Command** change to: `/home/site/wwwroot/startup.sh`
3. **Save** and **Restart**

### Step 4: Verify File Location

Make sure `startup.sh` is in the **root** of your repository, not in a subdirectory.

Your repo structure should be:
```
llm-council/
├── startup.sh          ← Should be here
├── requirements.txt
├── backend/
├── frontend/
└── ...
```

### Step 5: Check Deployment

1. **Deployment Center** → **Logs**
2. Verify that `startup.sh` is included in the deployment
3. Check GitHub Actions logs if using GitHub Actions

---

## Quick Fix

**Most likely:** The file isn't committed to Git or isn't in the repo root.

1. Make sure `startup.sh` is in the repository root
2. Add it to Git: `git add startup.sh`
3. Commit: `git commit -m "Add startup.sh"`
4. Push: `git push`
5. Wait for Azure to redeploy
6. Restart App Service

---

## Verify It's Fixed

After pushing to Git:

1. Wait for deployment to complete (2-3 minutes)
2. **Restart** App Service
3. Check **Log stream** again
4. Should see: `Building frontend...` instead of `not found`

---

**The file needs to be in Git and in the repo root!** 📁

