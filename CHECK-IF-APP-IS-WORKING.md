# 🔍 Check If App Is Working

## Quick Health Checks

### 1. Check Frontend Build

The frontend should build without errors. Let's verify:

**If you can run this locally:**
```bash
cd frontend
npm run build
```

Should complete without errors.

### 2. Check Backend Health

**Test your backend directly:**

Open this URL in your browser (replace with YOUR backend URL):
```
https://your-backend.azurewebsites.net/
```

**Should return:**
```json
{"status":"ok","service":"LLM Council API"}
```

**If it doesn't work:**
- Backend is not running
- Check Azure Portal → Your Web App → Log stream

### 3. Check Frontend URL

**Test your frontend:**
```
https://purple-cliff-052a1150f.4.azurestaticapps.net
```

**Should show:**
- LLM Council app interface
- Xavor logo
- "+ New Conversation" button

**If you get 404 or blank page:**
- Frontend might not be deployed
- Check GitHub Actions for deployment status
- Check Azure Static Web App deployment logs

### 4. Check GitHub Actions

1. Go to: https://github.com/hugh949/llm-council
2. Click **"Actions"** tab
3. Look for latest workflow run
4. Status should be **"Completed"** (green checkmark)

**If it shows "Failed":**
- Click on the failed workflow
- Check the error messages
- Common issues: Build errors, missing dependencies

---

## 🔧 Quick Fixes

### Frontend Not Loading

**Check deployment:**
1. GitHub → Actions → Latest workflow
2. If failed, check error messages
3. If succeeded but not working, try:
   - Clear browser cache
   - Try incognito/private window
   - Check if URL is correct

### Backend Not Responding

**Check backend:**
1. Azure Portal → Your Web App → Log stream
2. Look for errors
3. Check if service is running
4. Verify startup command: `python -m backend.main`

### Both Not Working

**Possible causes:**
1. Deployment didn't complete
2. Configuration errors
3. Network/DNS issues

**Fix:**
1. Check GitHub Actions status
2. Check Azure deployment logs
3. Verify all environment variables are set

---

## 📋 Status Checklist

- [ ] Frontend URL loads: `https://purple-cliff-052a1150f.4.azurestaticapps.net`
- [ ] Backend health check works: `https://your-backend.azurewebsites.net/`
- [ ] GitHub Actions shows successful deployment
- [ ] No errors in browser console (F12)
- [ ] Frontend builds successfully (test locally if possible)

---

**If nothing works, check GitHub Actions and Azure logs first!**

