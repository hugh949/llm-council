# 🚀 Easy Push - Two Options

## Option 1: Use the Script (Easiest) ⭐

**Step 1:** Get your GitHub Personal Access Token
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: `LLM-Council-Deploy`
- Check **"repo"** checkbox
- Click "Generate token"
- **Copy the token**

**Step 2:** Open Terminal and run:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
./push-with-token.sh YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with your actual token.

**Example:**
```bash
./push-with-token.sh ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Option 2: Interactive (No Token in Command)

**Step 1:** Get your token (same as above)

**Step 2:** Run the script without arguments:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
./push-with-token.sh
```

It will prompt you to enter the token (it won't show on screen for security).

---

## Option 3: Manual Push

If you prefer to do it manually:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
git push -u origin main
```

When asked:
- **Username:** `hugh949`
- **Password:** Paste your token

---

## ✅ After Successful Push

Check: https://github.com/hugh949/llm-council

Then proceed to deploy to Azure! See `DEPLOYMENT-GUIDE.md` 🎉

