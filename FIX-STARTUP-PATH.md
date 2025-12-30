# 🔧 Fix: startup.sh Not Found After cd

## ❌ The Error

```
bash: startup.sh: No such file or directory
```

The `find` command is working, but `startup.sh` is not found after `cd`.

## 🔍 Root Cause

Either:
1. `startup.sh` is not in the extracted directory
2. The `cd` command isn't working as expected
3. The path resolution is wrong

## ✅ Solution: Use Full Path

Instead of `cd` then `bash startup.sh`, use the full path directly:

### Option 1: Full Path with find (Recommended)

```bash
bash $(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1)/startup.sh
```

### Option 2: Verify directory first, then use full path

```bash
EXTRACTED_DIR=$(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1); bash $EXTRACTED_DIR/startup.sh
```

### Option 3: Use bash -c with full path

```bash
bash -c 'EXTRACTED_DIR=$(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1); bash $EXTRACTED_DIR/startup.sh'
```

---

## 📋 Steps to Fix

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings**
3. **Startup Command:** Change to:
   ```
   bash $(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1)/startup.sh
   ```
4. **Save** and **Restart**

---

## 🔍 Why This Works

- No `cd` needed - we use the full path directly
- `find` returns the directory path
- We append `/startup.sh` to get the full path
- `bash` executes the script directly

---

**This should work because we're using the full path, not relying on cd!** ✅

