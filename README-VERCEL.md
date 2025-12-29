# Deploying LLM Council to Vercel

This guide will help you deploy the LLM Council application to Vercel so others can access and test it.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub account (to connect your repository)
3. OpenRouter API key

## Deployment Steps

### Option 1: Deploy Frontend Only (Recommended for Quick Testing)

The frontend can be deployed to Vercel easily. However, you'll need to deploy the backend separately or use a service like Railway, Render, or Fly.io.

#### Step 1: Update API Base URL

Before deploying, update the API base URL in `frontend/src/api.js`:

```javascript
// For production, use your backend URL
const API_BASE = process.env.VITE_API_BASE_URL || 'https://your-backend-url.vercel.app';
```

Or set it as an environment variable in Vercel.

#### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional, but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Or use the Vercel dashboard:
   - Go to https://vercel.com/new
   - Import your Git repository
   - Set root directory to `frontend`
   - Add environment variable: `VITE_API_BASE_URL` = your backend URL
   - Deploy

### Option 2: Deploy Both Frontend and Backend

#### Backend Deployment Options:

**A. Deploy Backend to Vercel (Serverless Functions)**

Create `api/index.py` in the root:

```python
from backend.main import app

# Vercel serverless function handler
handler = app
```

Then update `vercel.json` to handle both frontend and API routes.

**B. Deploy Backend Separately (Recommended)**

Use services like:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

Then point your frontend API_BASE to the deployed backend URL.

### Environment Variables

**Frontend (Vercel):**
- `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)

**Backend (Railway/Render/etc.):**
- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
- `DATABASE_URL`: (Optional) PostgreSQL connection string. If not set, uses SQLite (perfect for small scale)

### Quick Deploy Script

Run this from the project root:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

## Post-Deployment

1. Update the API base URL in your deployed frontend to point to your backend
2. Test the application
3. Share the Vercel URL with others

## Troubleshooting

- **CORS Issues**: Make sure your backend allows requests from your Vercel domain
- **API Not Found**: Verify the `VITE_API_BASE_URL` environment variable is set correctly
- **Build Errors**: Check that all dependencies are in `package.json`

