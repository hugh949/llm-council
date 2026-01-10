# 🚀 Quick Start: Single URL Deployment

## What Changed?

**Before:** Frontend and backend were separate (2 URLs, 2 deployments)  
**Now:** Frontend and backend are together (1 URL, 1 deployment)

---

## For New Deployments

1. **Follow: DEPLOY-SINGLE-URL.md** (detailed guide)

2. **Key points:**
   - Deploy only to Azure App Service
   - Use `startup.sh` as startup command
   - Frontend will be built automatically
   - One URL for everything!

---

## For Existing Deployments

### Option 1: Migrate to Single URL (Recommended)

1. **Update your Azure App Service:**
   - Set startup command to: `startup.sh`
   - Add Node.js extension (if needed)
   - Redeploy

2. **Test the new single URL:**
   - Your app URL now serves both frontend and backend
   - No separate frontend deployment needed

### Option 2: Keep Separate (Current Setup)

- Keep your current setup if it's working
- No changes needed

---

## Local Development

**Build and run:**

```bash
# Build frontend and copy to backend
./build-single-app.sh

# Run backend (serves both frontend and API)
cd backend
python -m backend.main

# Open: http://localhost:8001
```

---

## Benefits

✅ **Simpler:** One deployment instead of two  
✅ **No CORS issues:** Frontend and backend same origin  
✅ **No environment variables:** Frontend uses same origin automatically  
✅ **Easier to manage:** One URL, one service  

---

**Questions? See DEPLOY-SINGLE-URL.md for detailed instructions.**


