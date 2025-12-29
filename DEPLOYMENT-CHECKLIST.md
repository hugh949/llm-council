# ✅ Complete Deployment Checklist for External Users

## 🎯 Required Steps for Production

### 📦 BACKEND (Railway) - Required Configuration

#### ✅ Step 1: Deploy Backend to Railway
- [ ] Go to https://railway.app
- [ ] Sign in with GitHub
- [ ] New Project → Deploy from GitHub repo
- [ ] Select `llm-council` repository
- [ ] Wait for deployment to complete

#### ✅ Step 2: Set Environment Variables in Railway
**Required variables:**

1. **`OPENROUTER_API_KEY`** (REQUIRED)
   - Value: Your OpenRouter API key
   - Get it from: https://openrouter.ai/keys
   - Without this, the app cannot call LLM APIs

**Optional variables:**
2. **`DATABASE_URL`** (Optional - defaults to SQLite)
   - Only needed if you want PostgreSQL
   - Railway provides this automatically if you add a PostgreSQL service
   - For small scale (< 10 users), SQLite is fine

3. **`CORS_ORIGINS`** (Optional - defaults to allow all)
   - Format: `https://your-app.vercel.app,https://another-domain.com`
   - Leave empty to allow all origins (recommended for simplicity)

4. **`PORT`** (Optional - Railway sets this automatically)
   - Railway automatically provides the PORT environment variable

#### ✅ Step 3: Get Railway Backend URL
- [ ] Click on your Railway service
- [ ] Go to "Settings" tab
- [ ] Scroll to "Domains" section
- [ ] Click "Generate Domain"
- [ ] **Copy the URL** (e.g., `https://llm-council-production.up.railway.app`)
- [ ] Test it in browser - should show: `{"status":"ok","service":"LLM Council API"}`

---

### 🌐 FRONTEND (Vercel) - Required Configuration

#### ✅ Step 4: Deploy Frontend to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import `llm-council` repository
- [ ] **IMPORTANT:** Set "Root Directory" to: `frontend`
- [ ] Click "Deploy"

#### ✅ Step 5: Set Environment Variables in Vercel
**Required variable:**

1. **`VITE_API_BASE_URL`** (REQUIRED)
   - Value: Your Railway backend URL from Step 3
   - Example: `https://llm-council-production.up.railway.app`
   - **DO NOT** include `/api` or trailing slash
   - **MUST** be `https://` (not `http://`)

**After setting:**
- [ ] Click "Save"
- [ ] Go to "Deployments" tab
- [ ] Click "..." menu on latest deployment
- [ ] Click "Redeploy" (required for env vars to take effect)

---

## 🧪 Testing Checklist

### ✅ Backend Tests
- [ ] Open Railway URL in browser: `https://your-app.up.railway.app/`
  - Should show: `{"status":"ok","service":"LLM Council API"}`
- [ ] Test list endpoint: `https://your-app.up.railway.app/api/conversations`
  - Should return: `[]` (empty array, or list of conversations)
- [ ] Check Railway logs (Deployments → View Logs)
  - Should see: `✅ Database initialized successfully`
  - No error messages

### ✅ Frontend Tests
- [ ] Open your Vercel URL in browser
- [ ] Open Developer Tools (F12) → Console tab
- [ ] Click "New Conversation"
  - Should create a conversation (no errors)
- [ ] Check browser console for errors
  - Should see no red error messages
- [ ] Test Step 1 (Prompt Engineering)
  - Should be able to send messages
  - Should receive AI responses

### ✅ Integration Tests
- [ ] Create a new conversation
- [ ] Complete Step 1 (Prompt Engineering)
- [ ] Complete Step 2 (Context Engineering)
- [ ] Complete Step 3 (Council Deliberation)
- [ ] Verify all steps work end-to-end

---

## 🔒 Security Checklist

- [ ] `OPENROUTER_API_KEY` is set in Railway (not exposed in frontend)
- [ ] Backend CORS allows your Vercel domain (or allows all if using default)
- [ ] Environment variables are not committed to Git
- [ ] Railway URL uses HTTPS
- [ ] Vercel URL uses HTTPS

---

## 📊 Scale Considerations (10 active users, 5 conversations/day)

### Current Setup (SQLite)
- ✅ **Sufficient for your use case**
- ✅ No additional configuration needed
- ✅ Automatic database initialization
- ✅ Works out of the box

### If You Need to Scale Later (PostgreSQL)
1. Add PostgreSQL service in Railway
2. Railway automatically provides `DATABASE_URL`
3. Backend will automatically use PostgreSQL
4. No code changes needed

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Failed to create conversation"
**Check:**
1. ✅ `VITE_API_BASE_URL` is set in Vercel
2. ✅ Vercel has been redeployed after setting env var
3. ✅ Railway backend is running (test the URL)
4. ✅ Browser console shows actual error (F12 → Console)

### Issue: "Cannot connect to backend"
**Check:**
1. ✅ Railway URL is correct (no trailing slash)
2. ✅ Railway URL uses `https://` (not `http://`)
3. ✅ Railway service is active (green status)
4. ✅ Railway logs show no errors

### Issue: LLM calls failing
**Check:**
1. ✅ `OPENROUTER_API_KEY` is set in Railway
2. ✅ API key is valid (check at openrouter.ai)
3. ✅ Railway logs show API errors (if any)

---

## 📋 Final Pre-Launch Checklist

Before sharing with external users:

- [ ] ✅ Backend deployed on Railway
- [ ] ✅ `OPENROUTER_API_KEY` set in Railway
- [ ] ✅ Backend URL works (test in browser)
- [ ] ✅ Frontend deployed on Vercel
- [ ] ✅ `VITE_API_BASE_URL` set in Vercel (pointing to Railway URL)
- [ ] ✅ Vercel has been redeployed after setting env var
- [ ] ✅ Frontend URL works (test in browser)
- [ ] ✅ Can create new conversation (no errors)
- [ ] ✅ All 3 steps work (Prompt, Context, Council)
- [ ] ✅ Browser console shows no errors (F12 → Console)
- [ ] ✅ Both URLs use HTTPS

---

## 🎉 You're Ready!

Once all checkboxes are ✅, your app is ready for external users!

**Share your Vercel URL** - that's all users need to access the app.

---

## 📞 Still Having Issues?

1. Check `TROUBLESHOOTING.md` for detailed error solutions
2. Check Railway logs for backend errors
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set correctly

