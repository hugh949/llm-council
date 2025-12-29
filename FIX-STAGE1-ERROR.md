# 🔧 Fixing "Failed to send prompt engineering message" Error

## Most Common Cause: Missing OpenRouter API Key

The error "Failed to send prompt engineering message" usually means the backend cannot call the OpenRouter API because the API key is missing or invalid.

---

## ✅ Step 1: Check Railway Environment Variables

1. Go to: **https://railway.app**
2. Sign in with GitHub
3. Click on your project/service
4. Click **"Variables"** tab
5. Look for: **`OPENROUTER_API_KEY`**

### If it's missing:

1. Click **"New Variable"**
2. **Name:** `OPENROUTER_API_KEY`
3. **Value:** Your OpenRouter API key
   - Get it from: **https://openrouter.ai/keys**
   - If you don't have one, create an account and generate a key
4. Click **"Add"**
5. Railway will automatically restart your service

---

## ✅ Step 2: Verify API Key is Valid

1. Go to: **https://openrouter.ai/keys**
2. Check if your API key is active
3. Make sure it has credits/usage remaining
4. Copy the key again if needed

---

## ✅ Step 3: Check Railway Logs

After setting the API key, check if it's working:

1. Railway dashboard → Your service
2. Click **"Deployments"** tab
3. Click on latest deployment → **"View Logs"**
4. Look for errors related to:
   - `OPENROUTER_API_KEY`
   - `Authorization`
   - `401 Unauthorized`
   - `403 Forbidden`

---

## ✅ Step 4: Test Backend Directly

Test if the backend can call OpenRouter:

1. Open your Railway URL: `https://web-production-a04bc.up.railway.app`
2. Open browser console (F12)
3. Try creating a conversation first (this should work)
4. Then test the prompt engineering endpoint

Or use curl:

```bash
curl -X POST https://web-production-a04bc.up.railway.app/api/conversations/YOUR-CONV-ID/prompt-engineering/message \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello"}'
```

Replace `YOUR-CONV-ID` with an actual conversation ID.

---

## 🧪 Step 5: Check Browser Console

The improved error messages will now show more details:

1. Open your app: **https://llm-council-wine.vercel.app**
2. Press **F12** → **Console** tab
3. Try submitting a message in Stage 1
4. Check the error message - it should now tell you exactly what's wrong:
   - "OpenRouter API key not configured" → Set `OPENROUTER_API_KEY` in Railway
   - "401 Unauthorized" → API key is invalid
   - "Failed to fetch" → Backend connection issue

---

## 📋 Checklist

- [ ] `OPENROUTER_API_KEY` is set in Railway Variables
- [ ] API key is valid (check at openrouter.ai)
- [ ] Railway service has restarted after adding the key
- [ ] Railway logs show no API key errors
- [ ] Browser console shows detailed error (after latest deployment)

---

## 🚨 Common Issues

### Issue: "OpenRouter API key not configured"
**Fix:** Add `OPENROUTER_API_KEY` in Railway Variables

### Issue: "401 Unauthorized" or "403 Forbidden"
**Fix:** 
- Check API key is correct
- Regenerate key at openrouter.ai if needed
- Make sure key has credits/usage

### Issue: "Failed to fetch"
**Fix:**
- Check `VITE_API_BASE_URL` in Vercel points to Railway URL
- Check Railway backend is running
- Check Railway logs for errors

---

## ✅ After Fixing

Once you've set the API key:

1. Wait for Railway to restart (1-2 minutes)
2. Test your app: https://llm-council-wine.vercel.app
3. Try submitting a message in Stage 1
4. Should work now! 🎉

---

## 📞 Still Not Working?

1. Check Railway logs for detailed error messages
2. Check browser console (F12) for error details
3. Verify API key is set correctly (no extra spaces, correct format)
4. Test OpenRouter API key directly at openrouter.ai

The improved error messages should now tell you exactly what's wrong!

