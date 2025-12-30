# 🔧 Fix Command Splitting Issue

## ❌ The Problem

The startup command is being split across multiple lines:
```
Site's appCommandLine: bash
EXTRACTED_DIR=$(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1); cd $EXTRACTED_DIR && bash startup.sh
```

Azure/Oryx is not executing it correctly because of the line break.

## ✅ Solution: Use Single-Line Command

Put everything on one line without variable assignment:

### Option 1: Direct find and execute (Recommended)

```bash
cd $(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1) && bash startup.sh
```

### Option 2: Use ls instead of find

```bash
cd $(ls -d /tmp/*/ | head -1) && bash startup.sh
```

### Option 3: Use the known pattern

Since we know the pattern is `/tmp/[hex]`, we can use:

```bash
cd /tmp && cd $(ls -d */ | head -1) && bash startup.sh
```

---

## 📋 Steps to Fix

1. **Azure Portal** → Your App Service
2. **Configuration** → **General settings**
3. **Startup Command:** Change to (all on ONE line):
   ```
   cd $(find /tmp -mindepth 1 -maxdepth 1 -type d | head -1) && bash startup.sh
   ```
4. **Save** and **Restart**

**Important:** Make sure it's all on ONE line with no line breaks!

---

## 🔍 Why This Works

- No variable assignment (avoids line break issues)
- Command substitution `$()` works inline
- Single line ensures Azure doesn't split it
- `-mindepth 1` excludes `/tmp` itself

---

**Use the single-line command above - it should work!** ✅

