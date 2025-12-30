# 🔧 Final Fix for Startup Script

## ❌ Current Issue

The regex-based find command isn't working in Oryx's wrapper script. `startup.sh` is still not executing.

## ✅ Solution: Use Variable Assignment

Use this simpler, more reliable startup command:

```bash
EXTRACTED_DIR=$(find /tmp -maxdepth 1 -type d ! -path /tmp | head -1); cd $EXTRACTED_DIR && bash startup.sh
```

OR even simpler (if we know the pattern):

```bash
cd /tmp/8de47830c0021ed && bash startup.sh
```

But that won't work because the directory name changes each time.

## 🔧 Best Solution: Use ls with pattern

```bash
cd $(ls -d /tmp/*/ | grep -E '/tmp/[a-f0-9]+/$' | head -1) && bash startup.sh
```

OR (most reliable - use find with exclusion):

```bash
EXTRACTED_DIR=$(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1); cd $EXTRACTED_DIR && bash startup.sh
```

---

## 📋 Steps to Fix

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings**
3. **Startup Command:** Change to:
   ```
   EXTRACTED_DIR=$(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1); cd $EXTRACTED_DIR && bash startup.sh
   ```
4. **Save** and **Restart**

---

## 🔍 Why This Should Work

- `-mindepth 1` ensures we don't match `/tmp` itself
- `-maxdepth 1` ensures we only look one level deep
- `-type d` ensures we only get directories
- `head -1` gets the first match (the extracted directory)
- Then we `cd` into it and run `startup.sh`

---

**This is the simplest and most reliable approach!** ✅

