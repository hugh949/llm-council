# 🔧 Fix Oryx Node.js Detection Error

## ❌ The Error

```
Error: Couldn't detect a version for the platform 'nodejs' in the repo.
```

Azure is trying to build with Node.js, but this is a **Python app**.

## 🔍 Root Cause

Azure's Oryx build system is detecting the `frontend/` directory and trying to use Node.js as the primary platform. But we need **Python** as the primary platform.

## ✅ Solution: Configure App Service for Python

### Step 1: Check App Service Stack

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings** tab
3. **Stack settings:**
   - **Stack:** Should be **"Python"** (not Node.js)
   - **Python version:** Should be **3.11** or **3.10**

**If it shows Node.js:**
- Change it to **Python**
- Select Python version **3.11** or **3.10**
- **Save** and **Restart**

### Step 2: Verify Startup Command

1. Still in **General settings**
2. **Startup Command:** Should be `bash startup.sh`
3. **Save** if you changed anything

### Step 3: Check GitHub Actions Workflow (If Using)

If you have a GitHub Actions workflow, it might be forcing Node.js. Check:

1. Go to: https://github.com/hugh949/llm-council
2. Click **"Actions"** tab
3. Check the workflow file (usually `.github/workflows/*.yml`)
4. Look for `--platform nodejs` and change to `--platform python`

---

## 🔧 Alternative: Use Python Build Command

If the issue persists, we can explicitly tell Oryx to use Python:

1. **Configuration** → **General settings**
2. **Startup Command:** Keep as `bash startup.sh`
3. **Stack:** Ensure it's **Python**

The `.deployment` file should handle the frontend build, but if Oryx is trying to use Node.js, we need to fix the stack setting first.

---

## 📋 Quick Checklist

- [ ] App Service Stack is set to **Python** (not Node.js)
- [ ] Python version is **3.11** or **3.10**
- [ ] Startup Command is `bash startup.sh`
- [ ] Save and Restart App Service

---

**The main fix is ensuring the App Service Stack is set to Python, not Node.js!** ✅

