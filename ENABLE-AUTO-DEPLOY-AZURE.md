# 🔄 Enable Automatic Deployment from GitHub to Azure Static Web App

Azure Static Web Apps **should automatically deploy** when you push to GitHub. If it's not working, follow these steps to enable/verify automatic deployment.

---

## ✅ Step 1: Verify GitHub Connection

1. Go to: **https://portal.azure.com**
2. Search for: **"Static Web Apps"**
3. Click on your Static Web App
4. Click **"Deployment Center"** (left sidebar)

### Check Current Configuration:

Look at the **"Source"** section:
- Should show: **"GitHub"**
- Should show your repository: `hugh949/llm-council` (or your repo)
- Should show branch: **`main`**

**If it shows "GitHub" and your repo:**
- ✅ Auto-deployment should already be enabled!
- Skip to Step 3 to verify it's working

**If it shows something else or is disconnected:**
- Follow Step 2 to reconnect GitHub

---

## ✅ Step 2: Connect GitHub (If Not Connected)

1. In **Deployment Center**, click **"Settings"** tab
2. Click **"Disconnect"** if there's a connection (to reset)
3. Click **"Connect"** button
4. Select **"GitHub"**
5. **Authorize Azure:**
   - You'll be redirected to GitHub
   - Click **"Authorize AzureAppService"** (or similar)
   - Approve the permissions
6. **Select Repository:**
   - Organization: Your GitHub username or organization
   - Repository: Select **`llm-council`**
   - Branch: Select **`main`**
7. Click **"Save"**

**Azure will now automatically deploy whenever you push to GitHub!**

---

## ✅ Step 3: Verify Auto-Deployment is Working

### Test It:

1. Make a small change to your code (or just push the latest code)
2. Push to GitHub:
   ```bash
   git push origin main
   ```
3. Go back to Azure Portal → Your Static Web App → **Deployment Center**
4. Click **"Logs"** tab
5. You should see a new deployment starting automatically!
6. Wait 2-3 minutes for it to complete

### What to Look For:

- **New deployment appears** in the logs (without you clicking "Sync")
- Status shows **"In Progress"** then **"Succeeded"**
- Deployment happens **automatically** after git push

---

## ✅ Step 4: Manual Sync (If Needed)

If auto-deployment isn't working yet, you can manually trigger a deployment:

1. In **Deployment Center**, look for **"Sync"** button (top toolbar)
   - It might be a circular arrow icon
   - Or a "Redeploy" button

2. Click **"Sync"** or **"Redeploy"**

3. Wait 2-3 minutes

**Note:** Once GitHub is properly connected, you shouldn't need to manually sync - it will happen automatically when you push code.

---

## 🔍 Troubleshooting

### Issue: No "Sync" Button Visible

**Possible reasons:**
- GitHub is not connected
- Deployment Center interface has changed
- Try refreshing the page

**Solution:**
1. Go to Deployment Center → **"Settings"** tab
2. Check if GitHub is connected
3. If not, follow Step 2 above to connect

### Issue: Auto-Deployment Not Working

**Check:**
1. Deployment Center → **"Settings"**
   - Repository is correct?
   - Branch is `main`?
   - Connection status is "Connected"?

2. Try disconnecting and reconnecting GitHub (Step 2)

3. Verify your git push succeeded:
   ```bash
   git log -1
   ```
   Should show your latest commit

### Issue: Can't Find Deployment Center

**Alternative ways to find it:**
1. In your Static Web App overview page
2. Left sidebar → Under **"Deployment"** section
3. Or search in the search bar within the Static Web App page

---

## 📋 Quick Checklist

- [ ] Deployment Center shows "GitHub" as source
- [ ] Repository is correct: `hugh949/llm-council`
- [ ] Branch is set to `main`
- [ ] Connection status shows "Connected"
- [ ] Tested: Pushed code and saw automatic deployment

---

## 🎯 Summary

**Azure Static Web Apps should automatically deploy when:**
- ✅ GitHub is connected in Deployment Center
- ✅ You push code to the connected branch (`main`)
- ✅ Deployment Center → Settings shows "Connected"

**No manual sync needed** - it happens automatically! 🎉

---

## 🚀 Going Forward

Once configured correctly:
1. **Make code changes**
2. **Push to GitHub:** `git push origin main`
3. **Azure automatically deploys** (2-3 minutes)
4. **Your app updates** with latest changes

**That's it! No manual steps needed.** ✅

