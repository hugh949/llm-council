# GitHub Setup - Copy These Commands

After you create the GitHub repository (Step 1), you have two options:

## Option 1: Use the Script (Easiest) ⭐

**Open Terminal** and run:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
./PUSH-TO-GITHUB.sh YOUR-USERNAME
```

Replace `YOUR-USERNAME` with your actual GitHub username.

**Example:** If your username is `johnsmith`:
```bash
./PUSH-TO-GITHUB.sh johnsmith
```

## Option 2: Run Commands Manually

If you prefer to run commands yourself:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/llm-council.git
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

---

## ⚠️ Important: GitHub Authentication

When `git push` asks for password:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (NOT your GitHub password)
  - Get one at: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Check **"repo"** checkbox
  - Click "Generate token"
  - Copy and paste it as the password

