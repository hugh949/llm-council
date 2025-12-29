# GitHub Setup - Copy These Commands

After you create the GitHub repository (Step 1 in DEPLOYMENT-GUIDE.md), run these commands in your terminal:

```bash
cd /Users/hughrashid/Cursor/LLM-Council
git add .
git commit -m "Initial commit - LLM Council with database support"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/llm-council.git
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

For example, if your GitHub username is `johnsmith`, the command would be:
```bash
git remote add origin https://github.com/johnsmith/llm-council.git
```

