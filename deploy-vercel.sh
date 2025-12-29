#!/bin/bash
# Quick deployment script for Vercel

echo "🚀 Deploying LLM Council to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
echo "📤 Deploying frontend..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set VITE_API_BASE_URL environment variable in Vercel dashboard"
echo "   2. Deploy your backend separately (Railway, Render, etc.)"
echo "   3. Update VITE_API_BASE_URL to point to your backend URL"
