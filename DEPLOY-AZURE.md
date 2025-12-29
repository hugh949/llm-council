# 🚀 Deploy Backend to Microsoft Azure (Xavor Account)

Azure offers much better performance than Render's free tier. Follow these steps to deploy using your Xavor account.

---

## ✅ Prerequisites

- Xavor Microsoft Azure account access
- Your `llm-council` code already pushed to GitHub
- OpenRouter API key ready

---

## 📦 Step 1: Create Azure App Service

### 1.1 Access Azure Portal

1. Go to: **https://portal.azure.com**
2. Sign in with your **Xavor account** credentials
3. You'll see the Azure Portal dashboard

### 1.2 Create Web App

1. Click **"Create a resource"** (top left, green + button)
2. Search for **"Web App"** in the search bar
3. Click **"Web App"** from the results
4. Click **"Create"** button

---

## 📝 Step 2: Configure Web App Settings

Fill in the **"Basics"** tab:

### Project Details:
- **Subscription:** Select your Xavor subscription
- **Resource Group:** 
  - Click **"Create new"**
  - Name: `llm-council-rg` (or any name you like)
  - Click **"OK"**

### Instance Details:
- **Name:** `llm-council-backend` (or any unique name - must be globally unique)
  - Azure will tell you if it's available
- **Publish:** Select **"Code"**
- **Runtime stack:** Select **"Python 3.11"** (or latest available)
- **Operating System:** Select **"Linux"**
- **Region:** Choose closest to you (e.g., `East US`, `West US 2`, `West Europe`)

### App Service Plan:
- **Plan:** Click **"Create new"**
  - **Name:** `llm-council-plan`
  - **Operating System:** `Linux`
  - **Region:** Same as above
  - **Pricing tier:** 
    - For better performance: **"Basic B1"** or **"Standard S1"** (recommended)
    - For testing: **"Free F1"** (limited, but free)
  - Click **"OK"**

Click **"Review + create"** at the bottom, then **"Create"**

---

## 🔗 Step 3: Connect GitHub Repository

After your web app is created:

1. In Azure Portal, go to your **Web App** (search for it in the top search bar)
2. In the left sidebar, find **"Deployment"** section
3. Click **"Deployment Center"**

### Configure Deployment:

1. **Source:** Select **"GitHub"**
2. **Organization:** Select your GitHub organization/user
3. **Repository:** Select **`llm-council`**
4. **Branch:** Select **`main`**
5. **Build provider:** Select **"GitHub Actions"** (recommended)
   - Azure will create a workflow file for you
6. Click **"Save"**

Azure will automatically set up continuous deployment from GitHub.

---

## 🔑 Step 4: Configure Application Settings (Environment Variables)

1. In your Web App, go to **"Configuration"** (left sidebar, under "Settings")
2. Click **"Application settings"** tab
3. Click **"+ New application setting"**

### Add Required Settings:

1. **`OPENROUTER_API_KEY`**
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Your OpenRouter API key (from https://openrouter.ai/keys)
   - Click **"OK"**

2. **`PORT`** (Optional - Azure sets this automatically, but add it to be safe)
   - **Name:** `PORT`
   - **Value:** `8000`
   - Click **"OK"**

3. **`WEBSITES_PORT`** (Tells Azure which port your app uses)
   - **Name:** `WEBSITES_PORT`
   - **Value:** `8000`
   - Click **"OK"**

4. Click **"Save"** at the top (Azure will restart your app)

---

## ⚙️ Step 5: Configure Startup Command

1. In your Web App, go to **"Configuration"**
2. Click **"General settings"** tab
3. Scroll to **"Startup Command"**
4. Enter:
   ```
   python -m backend.main
   ```
5. Click **"Save"** at the top

---

## 📄 Step 6: Create Startup File (if needed)

Azure needs to know how to start your app. Let's create a startup script:

Create `startup.sh` in the root of your project:

```bash
#!/bin/bash
python -m backend.main
```

Or Azure can use the Python module directly (which we configured above).

---

## 🚀 Step 7: Deploy

Azure will automatically deploy when you:
1. Push to GitHub (if you set up continuous deployment)
2. Or manually trigger deployment from Deployment Center

### Manual Deployment (if needed):

1. Go to **"Deployment Center"** in your Web App
2. Click **"Sync"** or **"Redeploy"**
3. Wait for deployment to complete (5-10 minutes first time)

---

## ✅ Step 8: Get Your Azure Backend URL

1. In your Web App overview page
2. Look for **"Default domain"** or **"URL"**
3. It will be: `https://your-app-name.azurewebsites.net`
4. **Copy this URL** - you'll need it for Vercel!

---

## 🌐 Step 9: Update Vercel Frontend

1. Go to: **https://vercel.com**
2. Open your **`llm-council`** project
3. Go to **"Settings"** → **"Environment Variables"**
4. Update **`VITE_API_BASE_URL`**:
   - **Value:** `https://your-app-name.azurewebsites.net`
   - (Use YOUR Azure URL from Step 8)
5. Click **"Save"**
6. Go to **"Deployments"** → **"Redeploy"**

---

## 🧪 Step 10: Test Everything

1. **Test Backend:**
   - Open: `https://your-app-name.azurewebsites.net/`
   - Should see: `{"status":"ok","service":"LLM Council API"}`

2. **Test Frontend:**
   - Open: https://llm-council-wine.vercel.app
   - Click "New Conversation"
   - Try Step 1 - should work and be much faster! ✅

---

## ⚡ Performance Tips

### To Improve Performance Further:

1. **Use a higher App Service Plan:**
   - **Standard S1** or higher for better performance
   - Basic B1 is good for moderate use

2. **Enable Always On** (if not on Free tier):
   - Configuration → General settings → **"Always On"** → **On**
   - Prevents cold starts

3. **Set up Application Insights** (optional):
   - For monitoring and performance tracking
   - Deployment Center → Monitoring

---

## 📋 Quick Checklist

- [ ] Azure account access (Xavor)
- [ ] Web App created
- [ ] GitHub connected (Deployment Center)
- [ ] `OPENROUTER_API_KEY` added (Configuration → Application settings)
- [ ] Startup command set: `python -m backend.main`
- [ ] Service deployed
- [ ] Azure URL copied
- [ ] Frontend deployed to Azure Static Web Apps
- [ ] `VITE_API_BASE_URL` set in Azure Static Web Apps
- [ ] Tested - everything works!

---

## 🚨 Common Issues & Fixes

### Issue: Deployment fails
**Fix:**
- Check **"Deployment Center"** → **"Logs"** for errors
- Make sure `requirements.txt` exists
- Verify Python version matches (3.11 recommended)

### Issue: App won't start
**Fix:**
- Check **"Log stream"** (left sidebar) for startup errors
- Verify startup command: `python -m backend.main`
- Check Application settings are saved

### Issue: 502 Bad Gateway
**Fix:**
- App might be starting - wait 2-3 minutes
- Check Log stream for errors
- Verify PORT is set correctly (8000)
- Check `WEBSITES_PORT` is set

### Issue: Can't find settings
**Fix:**
- **Environment Variables:** Configuration → Application settings
- **Startup Command:** Configuration → General settings
- **Logs:** Log stream (left sidebar)

---

## 💰 Cost Considerations

- **Free F1:** Free, but limited performance (1 GB RAM, shared CPU)
- **Basic B1:** ~$13/month, better performance (1.75 GB RAM, shared CPU)
- **Standard S1:** ~$55/month, good performance (1.75 GB RAM, dedicated CPU)

For 10 active users, **Basic B1** should be sufficient and much faster than Render's free tier.

---

## ✅ Advantages of Azure

- ✅ **Much faster** than Render free tier
- ✅ **No cold starts** (with Always On)
- ✅ **Better reliability**
- ✅ **Enterprise-grade infrastructure**
- ✅ **Easy to scale** if needed
- ✅ **Good monitoring** tools

---

**You're all set! Azure will be much faster than Render.** 🚀

