# 🔗 How to Find Your App URL

## Your App URL is Your Azure Static Web App URL

The link you need to run the app is your **Azure Static Web App URL** (the frontend).

---

## 📍 How to Find It

### Step 1: Go to Azure Portal

1. Go to: **https://portal.azure.com**
2. Sign in with your Xavor account

### Step 2: Find Your Static Web App

1. In the search bar at the top, type: **"Static Web Apps"**
2. Click on **"Static Web Apps"** service
3. Find your Static Web App (e.g., `llm-council-frontend` or similar name)

### Step 3: Copy Your URL

1. Click on your Static Web App
2. In the **Overview** page (default view)
3. Look for **"URL"** field (usually near the top)
4. It will look like:
   ```
   https://your-app-name.azurestaticapps.net
   ```
   or
   ```
   https://your-app-name-xxxxx.azurestaticapps.net
   ```

5. **This is your app URL!** Copy it and open it in your browser.

---

## 🌐 Example URLs

Your URL will look something like:
- `https://llm-council-frontend.azurestaticapps.net`
- `https://llm-council-wine.azurestaticapps.net`
- `https://your-app-name-12345.azurestaticapps.net`

---

## ✅ Verify It's Working

1. Open the URL in your browser
2. You should see the **LLM Council** app with:
   - Xavor logo
   - "+ New Conversation" button
   - Sidebar on the left

3. If you see the app, **you're good to go!** ✅

---

## 🔍 Alternative: Find URL from All Resources

If you can't find it in Static Web Apps:

1. In Azure Portal, click **"All resources"** (left sidebar)
2. Look for resources with type: **"Static Web App"**
3. Click on it to see the Overview page
4. The URL will be in the Overview section

---

## 📋 Quick Checklist

- [ ] Logged into Azure Portal
- [ ] Found "Static Web Apps" service
- [ ] Clicked on your Static Web App
- [ ] Found "URL" field in Overview page
- [ ] Copied the URL
- [ ] Opened URL in browser
- [ ] App loads correctly ✅

---

## 🆘 If You Can't Find It

**If you haven't deployed the frontend yet:**

Follow the guide: **`DEPLOY-FRONTEND-AZURE.md`**

Quick steps:
1. Create Azure Static Web App
2. Connect GitHub repository
3. Configure build settings
4. Deploy
5. Get your URL from Overview page

---

**Once you have the URL, that's the link you use to access your app!** 🎉


