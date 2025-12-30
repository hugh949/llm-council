# 🔧 Fix: startup.sh Script Not Running

## Problem

The logs show the backend starting, but you don't see:
- `Building frontend...`
- `npm install`
- `npm run build`

This means `startup.sh` is not executing.

## Root Cause

Azure's Oryx build system creates its own startup script and may not execute our custom `startup.sh` properly.

## Solution 1: Use POST_BUILD_COMMAND (Recommended)

Azure can build the frontend during deployment using a `.deployment` file.

I've created `.deployment` file that will:
1. Build the frontend during deployment
2. Copy files to `backend/static/`
3. This happens BEFORE the app starts

**This is the best approach!**

## Solution 2: Updated startup.sh

I've also updated `startup.sh` to:
- Check if frontend is already built
- Only build if needed
- Use absolute paths

## Next Steps

1. **Wait for deployment** (2-3 minutes)
   - Azure will use the `.deployment` file
   - Frontend will be built during deployment

2. **Restart App Service**
   - Overview → Restart
   - Wait 2-3 minutes

3. **Check Log Stream**
   - Should see frontend build messages
   - Or see "Frontend already built" if using startup.sh

4. **Test your app**
   - Should now show React app instead of JSON

---

## Alternative: Pre-build Frontend

If build keeps failing, we can pre-build locally and commit:

```bash
./build-single-app.sh
git add backend/static/
git commit -m "Pre-build frontend"
git push
```

But try the `.deployment` approach first!

---

**The `.deployment` file will build the frontend during deployment, so it's ready when the app starts!** 🚀

