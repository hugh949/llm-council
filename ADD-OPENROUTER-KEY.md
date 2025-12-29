# 🔑 How to Add OpenRouter API Key to Railway

## Step-by-Step Instructions

### Step 1: Get Your OpenRouter API Key

1. Go to: **https://openrouter.ai/keys**
2. Sign in (or create an account if you don't have one)
3. If you don't have a key yet:
   - Click **"Create Key"** or **"Generate API Key"**
   - Name it: `LLM-Council-Production`
   - Click **"Create"**
4. **Copy the API key** (it starts with `sk-or-v1-...`)
   - You won't be able to see it again, so copy it now!

---

### Step 2: Add API Key to Railway

1. Go to: **https://railway.app**
2. Sign in with GitHub
3. Click on your **`llm-council`** project
4. Click on your service (the one that's running)
5. Click the **"Variables"** tab (left sidebar or top menu)

### Step 3: Add the Environment Variable

1. Click **"New Variable"** button
2. In the **"Key"** field, type exactly:
   ```
   OPENROUTER_API_KEY
   ```
   (Make sure it's all uppercase and has underscores)

3. In the **"Value"** field, paste your OpenRouter API key:
   ```
   sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   (Paste the full key you copied from OpenRouter)

4. Click **"Add"** or **"Save"**

### Step 4: Wait for Railway to Restart

- Railway will automatically restart your service (takes 1-2 minutes)
- You'll see a new deployment starting
- Wait for it to finish (status will show "Active")

---

## ✅ Verify It's Working

### Check Railway:
1. Railway dashboard → Your service → **"Variables"** tab
2. You should see:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-...` (your key)

### Check Railway Logs:
1. Railway dashboard → Your service → **"Deployments"** tab
2. Click on the latest deployment → **"View Logs"**
3. Should see: `✅ Database initialized successfully`
4. No errors about API key

### Test Your App:
1. Go to: **https://llm-council-wine.vercel.app**
2. Click **"New Conversation"**
3. Try submitting a message in **Step 1 (Prompt Engineering)**
4. Should work now! ✅

---

## 🚨 Common Issues

### Issue: "Still getting the same error"
**Solutions:**
- Make sure you clicked **"Add"** or **"Save"** after entering the key
- Wait for Railway to restart (check Deployments tab)
- Make sure the key name is exactly: `OPENROUTER_API_KEY` (all uppercase)
- Copy the entire API key (no spaces before/after)

### Issue: "Invalid API key" or "401 Unauthorized"
**Solutions:**
- Make sure you copied the entire key
- Check the key is still valid at openrouter.ai
- Try regenerating the key at openrouter.ai
- Make sure the key has credits/usage remaining

### Issue: "Key not showing up"
**Solutions:**
- Refresh the Railway page
- Make sure you're looking at the correct service
- Check if Railway restarted (Deployments tab)

---

## 📋 Quick Checklist

- [ ] Got API key from https://openrouter.ai/keys
- [ ] Added `OPENROUTER_API_KEY` in Railway Variables
- [ ] Pasted the full API key as the value
- [ ] Railway service restarted (check Deployments)
- [ ] Tested the app - Step 1 works now!

---

## 🎯 Summary

**Where:** Railway → Your Service → Variables tab

**What to add:**
- **Key:** `OPENROUTER_API_KEY`
- **Value:** Your API key from openrouter.ai (starts with `sk-or-v1-...`)

**Then:** Wait for Railway to restart and test!

That's it! 🎉

