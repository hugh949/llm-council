# 🔍 Check Files via Azure SSH/Console

## Quick Check: Are Files Deployed?

You can use Azure's SSH or Console to check if the static files are actually deployed.

### Option 1: Azure Console (Easiest)

1. **Azure Portal** → Your App Service
2. **Development Tools** → **Console** (or **SSH**)
3. Run these commands:

```bash
# Check if files exist in wwwroot
ls -la /home/site/wwwroot/backend/static/

# Check if index.html exists
ls -la /home/site/wwwroot/backend/static/index.html

# List all files
find /home/site/wwwroot -name "index.html" -type f
```

### Option 2: Check via Kudu

1. Go to: `https://llm-council-app-bnh9g9cwdhgdb5gj.scm.azurewebsites.net`
2. Click **"Debug console"** → **"CMD"** or **"Bash"**
3. Navigate to: `site/wwwroot/backend/static/`
4. Check if files exist

---

## What to Look For

**If files exist:**
- ✅ `index.html` should be there
- ✅ `assets/` directory should exist
- ✅ Files should have content

**If files DON'T exist:**
- ❌ Directory might be empty
- ❌ Files weren't deployed
- ❌ Need to check deployment process

---

## If Files Don't Exist

The files we committed might not be in the deployment. Check:

1. **Deployment Center** → **Logs**
   - See if files are being included
   - Check for any errors

2. **GitHub Actions** (if using)
   - Check build logs
   - Verify files are in the artifact

3. **Verify in Git:**
   - Check that `backend/static/index.html` is in the repo
   - Verify it was committed and pushed

---

**Use Azure Console to quickly check if files are deployed!** 🔍


