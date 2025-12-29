# 🔐 Environment Variables Reference

## Backend (Azure App Service) - Required Variables

### ✅ `OPENROUTER_API_KEY` (REQUIRED)
- **Purpose:** API key for OpenRouter to access LLM models
- **Where to get it:** https://openrouter.ai/keys
- **How to set in Azure:**
  1. Azure Portal → Your Web App → "Configuration" → "Application settings"
  2. Click "+ New application setting"
  3. Name: `OPENROUTER_API_KEY`
  4. Value: Your API key from OpenRouter
  5. Click "OK" then "Save"
- **Important:** Without this, the app cannot call LLM APIs

---

## Backend (Azure App Service) - Optional Variables

### `DATABASE_URL` (Optional)
- **Purpose:** PostgreSQL database connection string
- **Default:** Uses SQLite if not set (sufficient for small scale)
- **When to use:** If you add Azure Database for PostgreSQL, Azure provides this automatically
- **Format:** `postgresql://user:pass@host:port/dbname`
- **Note:** For 10 users, SQLite is perfectly fine - no need to set this

### `CORS_ORIGINS` (Optional)
- **Purpose:** Restrict which domains can access your backend
- **Default:** `*` (allows all origins)
- **When to use:** If you want to restrict access to specific domains (e.g., your Azure Static Web App)
- **Format:** `https://your-app.azurestaticapps.net`
- **Recommendation:** Set to your Azure Static Web App URL for better security

### `PORT` (Optional)
- **Purpose:** Port number for the backend
- **Default:** Azure automatically sets this (but you can set it to 8000)
- **When to use:** Set to `8000` for consistency

### `WEBSITES_PORT` (Optional but recommended)
- **Purpose:** Tells Azure which port your app uses
- **Default:** Not set
- **When to use:** Set to `8000` to match your app's port
- **Value:** `8000`

---

## Frontend (Azure Static Web Apps) - Required Variables

### ✅ `VITE_API_BASE_URL` (REQUIRED)
- **Purpose:** Tells frontend where to find the backend API
- **Value:** Your Azure App Service backend URL
- **How to set in Azure:**
  1. Azure Portal → Your Static Web App → "Configuration" → "Application settings"
  2. Click "+ Add"
  3. Name: `VITE_API_BASE_URL`
  4. Value: Your backend URL (e.g., `https://llm-council-backend.azurewebsites.net`)
  5. **IMPORTANT:** 
     - Use `https://` (not `http://`)
     - No trailing slash `/`
     - No `/api` at the end
  6. Click "OK" then "Save"
  7. Azure will automatically redeploy

---

## 📋 Quick Reference

### Azure App Service (Backend) Variables:
```
OPENROUTER_API_KEY=your-key-here        (REQUIRED)
PORT=8000                               (Optional - Azure sets automatically)
WEBSITES_PORT=8000                      (Optional but recommended)
DATABASE_URL=postgresql://...           (Optional - only if using PostgreSQL)
CORS_ORIGINS=https://your-app.azurestaticapps.net  (Optional - for security)
```

### Azure Static Web Apps (Frontend) Variables:
```
VITE_API_BASE_URL=https://your-backend.azurewebsites.net    (REQUIRED)
```

---

## ✅ Verification

### Check Azure App Service Variables:
1. Azure Portal → Your Web App → "Configuration" → "Application settings"
2. Verify `OPENROUTER_API_KEY` is present
3. Check "Log stream" for initialization messages

### Check Azure Static Web Apps Variables:
1. Azure Portal → Your Static Web App → "Configuration" → "Application settings"
2. Verify `VITE_API_BASE_URL` is present and correct
3. Check "Deployment history" to ensure redeployment completed

### Test Backend:
```bash
curl https://your-backend.azurewebsites.net/
# Should return: {"status":"ok","service":"LLM Council API"}
```

### Test Frontend:
1. Open your Azure Static Web App URL
2. Open browser console (F12)
3. Type: `console.log(import.meta.env.VITE_API_BASE_URL)`
4. Should show your backend URL
5. Try creating a conversation

---

## 🚨 Common Mistakes

1. ❌ **Forgetting that Azure redeploys automatically after setting environment variables**
   - ✅ Fix: Wait 2-3 minutes after saving

2. ❌ **Wrong format for `VITE_API_BASE_URL`**
   - ❌ `http://your-backend.azurewebsites.net` (should be https)
   - ❌ `https://your-backend.azurewebsites.net/` (no trailing slash)
   - ❌ `https://your-backend.azurewebsites.net/api` (no /api)
   - ✅ `https://your-backend.azurewebsites.net` (correct)

3. ❌ **Missing `OPENROUTER_API_KEY` in Azure App Service**
   - ✅ Fix: Add it in Configuration → Application settings

4. ❌ **Using frontend URL as `VITE_API_BASE_URL`**
   - ❌ `https://your-app.azurestaticapps.net` (this is frontend, not backend)
   - ✅ `https://your-backend.azurewebsites.net` (this is backend)

5. ❌ **Setting variables in the wrong Azure service**
   - Backend variables go in **Azure App Service**
   - Frontend variables go in **Azure Static Web Apps**
   - ✅ Make sure you're editing the correct service!

---

## 📍 Where to Set Variables in Azure Portal

### Backend (Azure App Service):
1. Azure Portal → Your **Web App** (backend)
2. Left sidebar → **"Configuration"**
3. Tab: **"Application settings"**
4. Click **"+ New application setting"**

### Frontend (Azure Static Web Apps):
1. Azure Portal → Your **Static Web App** (frontend)
2. Left sidebar → **"Configuration"**
3. Tab: **"Application settings"**
4. Click **"+ Add"**

---

**All variables are set in Azure Portal - no external services needed!** ✅
