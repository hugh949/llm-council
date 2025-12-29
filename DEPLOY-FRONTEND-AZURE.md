# 🌐 Deploy Frontend to Azure Static Web Apps

Azure Static Web Apps is perfect for React/Vite applications and integrates seamlessly with Azure App Service for the backend.

---

## ✅ Why Azure Static Web Apps?

- ✅ **Free tier available** (great for testing)
- ✅ **Easy deployment** from GitHub
- ✅ **Environment variables** support
- ✅ **Built-in HTTPS** and CDN
- ✅ **Same platform** as backend (easier management)
- ✅ **Fast performance** with global CDN

---

## 📦 Step 1: Create Azure Static Web App

### 1.1 Access Azure Portal

1. Go to: **https://portal.azure.com**
2. Sign in with your **Xavor account**
3. You'll see the Azure Portal dashboard

### 1.2 Create Static Web App

1. Click **"Create a resource"** (top left, green + button)
2. Search for **"Static Web App"** in the search bar
3. Click **"Static Web App"** from the results
4. Click **"Create"** button

---

## 📝 Step 2: Configure Static Web App

Fill in the **"Basics"** tab:

### Project Details:
- **Subscription:** Select your Xavor subscription
- **Resource Group:** 
  - Select existing: `llm-council-rg` (same as backend)
  - Or create new if you prefer

### Static Web App Details:
- **Name:** `llm-council-frontend` (or any unique name)
- **Plan type:** Select **"Free"** (or "Standard" for production)
- **Region:** Choose closest to you (same region as backend recommended)

### Source:
- **Source:** **GitHub** (recommended - enables automatic deployment!)
- **Sign in with GitHub:** Click and authorize Azure
- **Organization:** Select your GitHub organization/user
- **Repository:** Select **`llm-council`**
- **Branch:** Select **`main`**

**✅ IMPORTANT:** Once connected to GitHub, Azure will **automatically deploy** whenever you push code to GitHub. No manual sync needed!

### Build Details:
- **Build Presets:** Select **"Vite"**
  - This auto-configures build settings
- **App location:** `/frontend`
- **Api location:** Leave empty (backend is separate)
- **Output location:** `dist`

Click **"Review + create"**, then **"Create"**

---

## 🔑 Step 3: Configure Environment Variables

After the Static Web App is created:

1. In Azure Portal, go to your **Static Web App**
2. In the left sidebar, go to **"Configuration"**
3. Click **"Application settings"** tab
4. Click **"+ Add"** button

### Add Required Setting:

1. **`VITE_API_BASE_URL`**
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** Your Azure backend URL (e.g., `https://llm-council-backend.azurewebsites.net`)
   - Click **"OK"**

5. Click **"Save"** at the top

---

## 🚀 Step 4: Get Your Frontend URL

1. In your Static Web App overview page
2. Look for **"URL"** at the top
3. It will be: `https://your-app-name.azurestaticapps.net`
4. **This is your frontend URL!**

---

## ✅ Step 5: Verify Deployment

**Azure will automatically deploy from GitHub!** When you push code to GitHub, Azure will:
1. Detect the push
2. Pull the latest code
3. Build the frontend (using Vite)
4. Deploy to the CDN
5. Update your app (takes 2-3 minutes)

**No manual sync needed** - it's fully automatic! 🎉

### Check Deployment Status:

1. Go to **"Deployment history"** (left sidebar)
2. You'll see build logs and deployment status
3. Wait for first deployment to complete (5-10 minutes)

### Test Your App:

1. Open your Static Web App URL: `https://your-app-name.azurestaticapps.net`
2. Should see your LLM Council app
3. Try creating a new conversation
4. Should work perfectly! ✅

---

## 🔄 Step 6: Update Backend CORS (Optional but Recommended)

If you want to restrict CORS to only your frontend domain:

1. Go to your **Backend Web App** (not Static Web App)
2. Go to **"Configuration"** → **"Application settings"**
3. Add:
   - **Name:** `CORS_ORIGINS`
   - **Value:** `https://your-app-name.azurestaticapps.net`
   - Click **"OK"** → **"Save"**

This restricts backend access to only your frontend domain for better security.

---

## 📋 Quick Checklist

- [ ] Static Web App created
- [ ] GitHub repository connected
- [ ] Build settings configured (Vite preset)
- [ ] `VITE_API_BASE_URL` set in Application settings
- [ ] First deployment completed
- [ ] Frontend URL works in browser
- [ ] Can create conversations (backend connection works)

---

## 🚨 Common Issues & Fixes

### Issue: Build fails
**Fix:**
- Check "Deployment history" → Click on failed deployment → View logs
- Make sure "App location" is set to `/frontend`
- Make sure "Output location" is set to `dist`

### Issue: App shows blank page
**Fix:**
- Check browser console (F12) for errors
- Verify `VITE_API_BASE_URL` is set correctly
- Check deployment logs for build errors

### Issue: Can't connect to backend
**Fix:**
- Verify `VITE_API_BASE_URL` points to your backend URL
- Check backend CORS settings (should allow your Static Web App URL)
- Test backend URL directly in browser

---

## ⚡ Performance Tips

1. **Use Standard Plan for Production:**
   - Better performance and SLA
   - Custom domains support
   - More features

2. **Custom Domain (Optional):**
   - Configuration → Custom domains
   - Add your own domain name

3. **Environment-Specific Settings:**
   - You can set different env vars for different environments (staging/production)

---

## 💰 Cost Comparison

### Azure Static Web Apps:
- **Free:** Up to 100 GB bandwidth/month
- **Standard:** Starting at ~$9/month (better features)

**For your use case (10 active users), the Free tier should be sufficient!**

---

## ✅ Advantages of Azure Static Web Apps

- ✅ **Same platform** as backend (easier management)
- ✅ **Integrated monitoring** and logs
- ✅ **Single Azure subscription** for everything
- ✅ **Better control** over deployment
- ✅ **Free tier available**
- ✅ **Global CDN** included

---

---

**You now have everything in Azure - backend and frontend!** 🎉

