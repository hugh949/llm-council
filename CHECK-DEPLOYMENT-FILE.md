# 🔍 Check if .deployment File is Working

## How to Verify

### Step 1: Check Deployment Logs

1. **Azure Portal** → Your App Service
2. **Deployment Center** → **Logs** tab
3. Look for build messages during deployment

**What to look for:**
- `npm install`
- `npm run build`
- `Building frontend...`
- `Copying frontend build...`

**If you see these:** ✅ `.deployment` file is working!  
**If you don't see these:** ❌ `.deployment` file is NOT working

---

### Step 2: Check GitHub Actions (If Using)

1. Go to: https://github.com/hugh949/llm-council/actions
2. Click on latest workflow run
3. Check build logs
4. Look for npm build commands

---

### Step 3: Check if Files Were Built

After deployment, check in Azure SSH:

```bash
# Check if dist was created
ls -la /tmp/8de475922a03fff/frontend/dist/ 2>/dev/null || echo "dist doesn't exist"

# Check if backend/static was created
ls -la /tmp/8de475922a03fff/backend/static/ 2>/dev/null || echo "static doesn't exist"
```

**If `dist/` or `backend/static/` exists:** ✅ Build happened  
**If neither exists:** ❌ Build didn't happen

---

## Common Issues

### Issue 1: .deployment File Not Recognized

**Problem:** Azure might not recognize the `.deployment` file format

**Check:**
- File is in repository root (not in a subdirectory)
- File is named exactly `.deployment` (with the dot)
- File is committed to Git

### Issue 2: POST_BUILD_COMMAND Not Executing

**Problem:** The command might not be running

**Possible causes:**
- Node.js not available during build
- Build process fails silently
- Command syntax error

### Issue 3: Files Built But Not Persisted

**Problem:** Files are built but lost during extraction

**Check:** Files might be in build output but not in final location

---

## Alternative: Use startup.sh Instead

If `.deployment` isn't working, we can rely on `startup.sh`:

1. Make sure `startup.sh` is set as startup command
2. It will build frontend when app starts
3. Check Log Stream for build messages

---

## Verify .deployment File Format

The file should be:

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
POST_BUILD_COMMAND="cd frontend && npm install && npm run build && cd .. && mkdir -p backend/static && rm -rf backend/static/* && cp -r frontend/dist/* backend/static/"
```

**Check:**
- ✅ File exists in repo root
- ✅ Format is correct
- ✅ Committed to Git

---

## Quick Test

**Easiest way to check:** Look at Deployment Center logs during next deployment.

You should see npm commands if `.deployment` is working!

---

**Check Deployment Center → Logs during the next deployment to see if it's working!** 🔍

