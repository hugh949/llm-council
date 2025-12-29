# ✅ Complete Deployment Checklist - Azure Only

## 🎯 Required Steps for Production

### 📦 BACKEND (Azure App Service) - Required Configuration

#### ✅ Step 1: Deploy Backend to Azure
- [ ] Go to https://portal.azure.com
- [ ] Sign in with Xavor account
- [ ] Create Web App (Python 3.11, Linux)
- [ ] Connect GitHub repository
- [ ] Wait for deployment to complete

#### ✅ Step 2: Set Environment Variables in Azure
**Required variables:**

1. **`OPENROUTER_API_KEY`** (REQUIRED)
   - Value: Your OpenRouter API key
   - Get it from: https://openrouter.ai/keys
   - Without this, the app cannot call LLM APIs
   - Set in: Configuration → Application settings

**Optional variables:**
2. **`PORT`** (Optional - Azure sets this automatically)
   - Value: `8000`
   - Set in: Configuration → Application settings

3. **`WEBSITES_PORT`** (Optional but recommended)
   - Value: `8000`
   - Tells Azure which port your app uses
   - Set in: Configuration → Application settings

4. **`DATABASE_URL`** (Optional - defaults to SQLite)
   - Only needed if you want PostgreSQL
   - Azure provides this automatically if you add Azure Database for PostgreSQL
   - For small scale (< 10 users), SQLite is fine

#### ✅ Step 3: Configure Startup Command
- [ ] Go to Configuration → General settings
- [ ] Set Startup Command: `python -m backend.main`
- [ ] Click "Save"

#### ✅ Step 4: Get Azure Backend URL
- [ ] In your Web App overview page
- [ ] Look for "Default domain" or "URL"
- [ ] Copy the URL (e.g., `https://llm-council-backend.azurewebsites.net`)
- [ ] Test it in browser - should show: `{"status":"ok","service":"LLM Council API"}`

---

### 🌐 FRONTEND (Azure Static Web Apps) - Required Configuration

#### ✅ Step 5: Deploy Frontend to Azure Static Web Apps
- [ ] Go to https://portal.azure.com
- [ ] Create Static Web App
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build Presets: Vite
  - App location: `/frontend`
  - Output location: `dist`
- [ ] Wait for deployment to complete

#### ✅ Step 6: Set Environment Variables in Azure Static Web Apps
**Required variable:**

1. **`VITE_API_BASE_URL`** (REQUIRED)
   - Value: Your Azure backend URL from Step 4
   - Example: `https://llm-council-backend.azurewebsites.net`
   - **DO NOT** include `/api` or trailing slash
   - **MUST** be `https://` (not `http://`)
   - Set in: Configuration → Application settings

**After setting:**
- [ ] Click "Save"
- [ ] Azure will automatically redeploy (wait 2-3 minutes)

---

## 🧪 Testing Checklist

### ✅ Backend Tests
- [ ] Open Azure backend URL in browser: `https://your-backend.azurewebsites.net/`
  - Should show: `{"status":"ok","service":"LLM Council API"}`
- [ ] Test list endpoint: `https://your-backend.azurewebsites.net/api/conversations`
  - Should return: `[]` (empty array, or list of conversations)
- [ ] Check Azure Log stream (Web App → Log stream)
  - Should see: `✅ Database initialized successfully`
  - No error messages

### ✅ Frontend Tests
- [ ] Open your Azure Static Web App URL in browser
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

- [ ] `OPENROUTER_API_KEY` is set in Azure App Service (not exposed in frontend)
- [ ] Backend CORS allows your Azure Static Web App domain (or allows all if using default)
- [ ] Environment variables are not committed to Git
- [ ] Backend URL uses HTTPS
- [ ] Frontend URL uses HTTPS

---

## 📊 Scale Considerations (10 active users, 5 conversations/day)

### Current Setup (SQLite)
- ✅ **Sufficient for your use case**
- ✅ No additional configuration needed
- ✅ Automatic database initialization
- ✅ Works out of the box

### If You Need to Scale Later (PostgreSQL)
1. Add Azure Database for PostgreSQL service
2. Azure automatically provides `DATABASE_URL`
3. Backend will automatically use PostgreSQL
4. No code changes needed

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Failed to create conversation: 405"
**Check:**
1. ✅ `VITE_API_BASE_URL` is set in Azure Static Web Apps
2. ✅ Azure has redeployed Static Web App after setting env var
3. ✅ Azure backend is running (test the URL)
4. ✅ Browser console shows actual error (F12 → Console)

### Issue: "Cannot connect to backend"
**Check:**
1. ✅ Backend URL is correct (no trailing slash)
2. ✅ Backend URL uses `https://` (not `http://`)
3. ✅ Azure App Service is active (Running status)
4. ✅ Azure logs show no errors

### Issue: LLM calls failing
**Check:**
1. ✅ `OPENROUTER_API_KEY` is set in Azure App Service
2. ✅ API key is valid (check at openrouter.ai)
3. ✅ Azure logs show API errors (if any)

---

## 📋 Final Pre-Launch Checklist

Before sharing with external users:

- [ ] ✅ Backend deployed on Azure App Service
- [ ] ✅ `OPENROUTER_API_KEY` set in Azure App Service
- [ ] ✅ Startup command configured in Azure
- [ ] ✅ Azure backend URL works (test in browser)
- [ ] ✅ Frontend deployed on Azure Static Web Apps
- [ ] ✅ `VITE_API_BASE_URL` set in Azure Static Web Apps (pointing to backend URL)
- [ ] ✅ Azure has redeployed Static Web App after setting env var
- [ ] ✅ Frontend URL works (test in browser)
- [ ] ✅ Can create new conversation (no errors)
- [ ] ✅ All 3 steps work (Prompt, Context, Council)
- [ ] ✅ Browser console shows no errors (F12 → Console)
- [ ] ✅ Both URLs use HTTPS

---

## 🎉 You're Ready!

Once all checkboxes are ✅, your app is ready for external users!

**Share your Azure Static Web App URL** - that's all users need to access the app.

---

## 📞 Still Having Issues?

1. Check `TROUBLESHOOTING.md` for detailed error solutions
2. Check Azure Log stream for backend errors
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set correctly
