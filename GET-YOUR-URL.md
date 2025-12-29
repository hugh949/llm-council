# 🔗 How to Get Your Public URLs

## 🌐 Frontend URL (Vercel)

**To get your Vercel URL:**

1. Go to: **https://vercel.com**
2. Sign in with GitHub
3. Click on your **`llm-council`** project
4. You'll see your deployment URL at the top, like:
   - `https://llm-council.vercel.app`
   - or `https://llm-council-abc123.vercel.app`
5. **This is your public URL** - share this with users!

---

## 📦 Backend URL (Railway)

**To get your Railway URL:**

1. Go to: **https://railway.app**
2. Sign in with GitHub
3. Click on your **`llm-council`** project
4. Click on your service
5. Go to **"Settings"** tab
6. Scroll to **"Domains"** section
7. If you haven't generated a domain yet, click **"Generate Domain"**
8. Copy the URL (e.g., `https://llm-council-production.up.railway.app`)
9. **This URL should be set as `VITE_API_BASE_URL` in Vercel**

---

## 🧪 Quick Test

### Test Backend:
Open your Railway URL in browser:
```
https://your-app.up.railway.app/
```
Should show: `{"status":"ok","service":"LLM Council API"}`

### Test Frontend:
Open your Vercel URL in browser - this is what you share with users!

---

## ✅ Before Sharing with Users

Make sure:
- [ ] Backend URL works (test in browser)
- [ ] Frontend URL works (opens the app)
- [ ] You can create a new conversation (no errors)
- [ ] All 3 steps work (Prompt, Context, Council)

Once these work, your Vercel URL is ready to share! 🎉

