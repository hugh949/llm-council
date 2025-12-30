# 🔧 Fix Find Command - Wrong Directory

## ❌ The Error

```
bash: /tmp/startup.sh: No such file or directory
```

The `find` command is matching `/tmp` instead of the extracted directory `/tmp/8de47830c0021ed/`.

## ✅ Solution: Use More Specific Pattern

The extracted directory has a pattern: `/tmp/[hexadecimal characters]`

### Updated Startup Command

Change the startup command to:

```bash
bash $(find /tmp -maxdepth 1 -type d -regex '^/tmp/[a-f0-9]+$' | head -1)/startup.sh
```

OR (if regex doesn't work):

```bash
EXTRACTED_DIR=$(find /tmp -maxdepth 1 -type d ! -path /tmp | head -1) && bash $EXTRACTED_DIR/startup.sh
```

OR (simplest - use the pattern we know):

```bash
bash $(ls -d /tmp/*/ | grep -E '^/tmp/[a-f0-9]+/$' | head -1)startup.sh
```

---

## 🔧 Steps to Fix

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings**
3. **Startup Command:** Change to one of the commands above
4. **Save** and **Restart**

---

## ✅ Recommended Command

Use this (most reliable):

```bash
EXTRACTED_DIR=$(find /tmp -maxdepth 1 -type d ! -path /tmp | head -1) && bash $EXTRACTED_DIR/startup.sh
```

This finds any directory in `/tmp` that is NOT `/tmp` itself (i.e., the extracted directory).

---

**After updating, restart and check Log Stream for the build messages!** ✅

