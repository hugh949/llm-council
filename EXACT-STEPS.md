# 🎯 EXACT STEPS - Follow These in Order (Azure Only)

I've prepared everything. Here's exactly what YOU need to do:

---

## ✅ STEP 1: Create GitHub Repository

**What to do:**
1. Open: https://github.com/new
2. Repository name: Type exactly: `llm-council`
3. ✅ Make it **Public**
4. **DO NOT** check "Add a README file" or any other boxes
5. Click green **"Create repository"** button
6. **Copy your GitHub username** (top right corner of GitHub)

**Time:** 2 minutes

---

## ✅ STEP 2: Push Code to GitHub

**What to do:**
1. Open **Terminal** on your Mac (Press `Cmd + Space`, type "Terminal", press Enter)
2. Copy and paste this command (replace `YOUR-USERNAME` with your actual GitHub username):

```bash
cd /Users/hughrashid/Cursor/LLM-Council && ./push-with-token.sh YOUR-USERNAME
```

**Example:** If your username is `johnsmith`, the command is:
```bash
cd /Users/hughrashid/Cursor/LLM-Council && ./push-with-token.sh johnsmith
```

3. Press Enter
4. If it asks for username: Enter your GitHub username
5. If it asks for password: **DO NOT use your password!** Instead:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name it: "LLM Council"
   - Check the **"repo"** checkbox
   - Click "Generate token" at bottom
   - **Copy the token** (you'll only see it once!)
   - Paste it as the password in Terminal

**Time:** 3-5 minutes

---

## ✅ STEP 3: Deploy Backend to Azure App Service

**Follow the detailed guide: `DEPLOY-AZURE.md`**

**Quick overview:**
1. Go to: https://portal.azure.com
2. Sign in with your Xavor account
3. Create Web App (Python 3.11, Linux)
4. Connect GitHub repository
5. Add environment variable: `OPENROUTER_API_KEY` (your API key from https://openrouter.ai/keys)
6. Set startup command: `python -m backend.main`
7. Deploy and get your backend URL

**📝 WRITE THIS URL DOWN - You'll need it in Step 4!**

**Time:** 10 minutes

---

## ✅ STEP 4: Deploy Frontend to Azure Static Web Apps

**Follow the detailed guide: `DEPLOY-FRONTEND-AZURE.md`**

**Quick overview:**
1. Go to: https://portal.azure.com
2. Create Static Web App
3. Connect GitHub repository
4. Configure build settings (Vite preset, App location: `/frontend`)
5. Add environment variable: `VITE_API_BASE_URL` = (your backend URL from Step 3)
6. Deploy and get your frontend URL

**Time:** 10 minutes

---

## ✅ STEP 5: Test Your App!

**What to do:**
1. Open your Azure Static Web App URL
2. Your app should open!
3. Try clicking **"+ New Conversation"**
4. If it works, **SUCCESS!** 🎉

**Time:** 1 minute

---

## 📝 Summary - What You Need to Enter:

1. **GitHub username** (for Step 2 command)
2. **OpenRouter API key** (for Azure Step 3) - Get from: https://openrouter.ai/keys
3. **Azure backend URL** (for Azure Static Web Apps Step 4) - Copy from Step 3

---

## 🆘 Troubleshooting

**If Step 2 fails (GitHub push):**
- Make sure you created the repository first (Step 1)
- Make sure you're using a Personal Access Token, not your password

**If Step 3 fails (Azure backend):**
- Check Azure Log stream: Web App → Log stream
- Make sure `OPENROUTER_API_KEY` is set correctly

**If Step 4 fails (Azure frontend):**
- Check build logs: Static Web App → Deployment history
- Make sure `VITE_API_BASE_URL` points to your backend URL

**If app doesn't work:**
- Check that `VITE_API_BASE_URL` in Azure Static Web Apps matches your backend URL exactly
- Make sure backend is running (check Azure dashboard)

---

## ✅ Ready to Start?

1. Go to Step 1 above
2. Follow each step in order
3. That's it!

**See `DEPLOYMENT-GUIDE.md` for complete detailed instructions!**
