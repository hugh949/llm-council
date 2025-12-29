# 🔐 Environment Variables Reference

## Backend (Railway) - Required Variables

### ✅ `OPENROUTER_API_KEY` (REQUIRED)
- **Purpose:** API key for OpenRouter to access LLM models
- **Where to get it:** https://openrouter.ai/keys
- **How to set in Railway:**
  1. Railway dashboard → Your service → "Variables" tab
  2. Click "New Variable"
  3. Name: `OPENROUTER_API_KEY`
  4. Value: Your API key from OpenRouter
  5. Click "Add"
- **Important:** Without this, the app cannot call LLM APIs

---

## Backend (Railway) - Optional Variables

### `DATABASE_URL` (Optional)
- **Purpose:** PostgreSQL database connection string
- **Default:** Uses SQLite if not set (sufficient for small scale)
- **When to use:** If you add PostgreSQL service in Railway, Railway provides this automatically
- **Format:** `postgresql://user:pass@host:port/dbname`
- **Note:** For 10 users, SQLite is perfectly fine - no need to set this

### `CORS_ORIGINS` (Optional)
- **Purpose:** Restrict which domains can access your backend
- **Default:** `*` (allows all origins)
- **When to use:** If you want to restrict access to specific domains
- **Format:** `https://your-app.vercel.app,https://another-domain.com`
- **Recommendation:** Leave empty for simplicity (allows all origins)

### `PORT` (Optional)
- **Purpose:** Port number for the backend
- **Default:** Railway automatically sets this
- **When to use:** Never - Railway handles this automatically

---

## Frontend (Vercel) - Required Variables

### ✅ `VITE_API_BASE_URL` (REQUIRED)
- **Purpose:** Tells frontend where to find the backend API
- **Value:** Your Railway backend URL
- **How to set in Vercel:**
  1. Vercel dashboard → Your project → "Settings" → "Environment Variables"
  2. Click "Add New"
  3. Name: `VITE_API_BASE_URL`
  4. Value: Your Railway URL (e.g., `https://your-app.up.railway.app`)
  5. **IMPORTANT:** 
     - Use `https://` (not `http://`)
     - No trailing slash `/`
     - No `/api` at the end
  6. Click "Save"
  7. **CRITICAL:** Go to "Deployments" → Redeploy for changes to take effect

---

## 📋 Quick Reference

### Railway Variables:
```
OPENROUTER_API_KEY=your-key-here        (REQUIRED)
DATABASE_URL=postgresql://...           (Optional - only if using PostgreSQL)
CORS_ORIGINS=https://app.vercel.app     (Optional - defaults to allow all)
PORT=8000                               (Optional - Railway sets automatically)
```

### Vercel Variables:
```
VITE_API_BASE_URL=https://your-app.up.railway.app    (REQUIRED)
```

---

## ✅ Verification

### Check Railway Variables:
1. Railway dashboard → Service → "Variables" tab
2. Verify `OPENROUTER_API_KEY` is present
3. Check "Deployments" → "Logs" for initialization messages

### Check Vercel Variables:
1. Vercel dashboard → Project → "Settings" → "Environment Variables"
2. Verify `VITE_API_BASE_URL` is present and correct
3. Make sure you've redeployed after adding/changing variables

### Test Backend:
```bash
curl https://your-app.up.railway.app/
# Should return: {"status":"ok","service":"LLM Council API"}
```

### Test Frontend:
1. Open your Vercel URL
2. Open browser console (F12)
3. Should see no errors about API connection
4. Try creating a conversation

---

## 🚨 Common Mistakes

1. ❌ **Forgetting to redeploy Vercel after setting environment variable**
   - ✅ Fix: Always redeploy after adding/changing env vars

2. ❌ **Wrong format for `VITE_API_BASE_URL`**
   - ❌ `http://your-app.up.railway.app` (should be https)
   - ❌ `https://your-app.up.railway.app/` (no trailing slash)
   - ❌ `https://your-app.up.railway.app/api` (no /api)
   - ✅ `https://your-app.up.railway.app` (correct)

3. ❌ **Missing `OPENROUTER_API_KEY` in Railway**
   - ✅ Fix: Add it in Railway Variables tab

4. ❌ **Using frontend URL as `VITE_API_BASE_URL`**
   - ❌ `https://your-app.vercel.app` (this is frontend, not backend)
   - ✅ `https://your-app.up.railway.app` (this is backend)

