# 🔍 Find Where Files Actually Are

## Run These Commands in Azure SSH

Since `/home/site/wwwroot/backend/static/` doesn't exist, let's find where the files actually are:

### Step 1: Check wwwroot

```bash
ls -la /home/site/wwwroot/
```

### Step 2: Check if backend exists

```bash
ls -la /home/site/wwwroot/backend/
```

### Step 3: Check the extracted location (where app runs)

```bash
ls -la /tmp/8de475922a03fff/backend/static/
```

### Step 4: Find all index.html files

```bash
find /home/site/wwwroot -name "index.html" -type f 2>/dev/null
find /tmp -name "index.html" -type f 2>/dev/null | head -5
```

### Step 5: Check current directory structure

```bash
pwd
ls -la
ls -la backend/
ls -la backend/static/ 2>/dev/null || echo "static directory doesn't exist"
```

---

## What to Share

After running these commands, share:
1. What's in `/home/site/wwwroot/`?
2. Does `backend/` exist in wwwroot?
3. Does `/tmp/8de475922a03fff/backend/static/` exist?
4. Where did `find` locate `index.html`?

This will tell us where the files actually are!

