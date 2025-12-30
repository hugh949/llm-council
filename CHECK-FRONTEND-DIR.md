# 🔍 Check Frontend Directory Structure

## Run These Commands in Azure SSH

Since we found `/tmp/8de475922a03fff/frontend/index.html`, let's check the structure:

```bash
# Check frontend directory
ls -la /tmp/8de475922a03fff/frontend/

# Check if dist exists
ls -la /tmp/8de475922a03fff/frontend/dist/ 2>/dev/null || echo "dist doesn't exist"

# Check if assets exist
ls -la /tmp/8de475922a03fff/frontend/assets/ 2>/dev/null || echo "assets doesn't exist in frontend"

# See what's in frontend
find /tmp/8de475922a03fff/frontend -type f | head -10
```

This will tell us if:
- Frontend is built in `frontend/dist/`
- Frontend files are directly in `frontend/`
- We need to copy them to `backend/static/`

