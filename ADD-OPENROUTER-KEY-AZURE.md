# 🔐 Add OpenRouter API Key to Azure

## ❌ The Error

```
Error: Failed to get prompt engineering response. Please check your OpenRouter API key and try again. (Status: 500)
```

This means the `OPENROUTER_API_KEY` environment variable is not set in Azure App Service.

---

## ✅ Solution: Add API Key to Azure

### Step 1: Get Your OpenRouter API Key

1. Go to: **https://openrouter.ai/keys**
2. Sign in or create an account
3. Create a new API key
4. **Copy the key** (you'll need it in Step 2)

---

### Step 2: Add Key to Azure App Service

1. **Azure Portal** → Your App Service
2. **Configuration** → **Application settings** tab
3. Click **"+ New application setting"**
4. Fill in:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Paste your API key from Step 1
5. Click **"OK"**
6. Click **"Save"** at the top of the page
7. Click **"Continue"** when prompted

---

### Step 3: Restart App Service

1. **Overview** → Click **"Restart"**
2. Wait 1-2 minutes for restart

---

### Step 4: Test

1. Go to your app URL
2. Click **"New Conversation"**
3. Submit a prompt in Step 1
4. Should work now! ✅

---

## 🔍 Verify Key is Set

After adding the key, you can verify in Azure:

1. **Configuration** → **Application settings**
2. Look for `OPENROUTER_API_KEY` in the list
3. Should show: `OPENROUTER_API_KEY = sk-or-v1-...` (value is hidden)

---

## ⚠️ Important Notes

- **Never share your API key** publicly
- The key is stored securely in Azure
- You'll be charged by OpenRouter based on usage
- Make sure you have credits in your OpenRouter account

---

**After adding the key and restarting, the app should work!** ✅

