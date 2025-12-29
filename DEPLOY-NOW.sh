#!/bin/bash
# Deployment script - Run this after creating GitHub repository

echo "🚀 LLM Council Deployment Script"
echo "================================"
echo ""

# Check if GitHub username is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub username"
    echo ""
    echo "Usage: ./DEPLOY-NOW.sh YOUR-GITHUB-USERNAME"
    echo ""
    echo "Example: ./DEPLOY-NOW.sh johnsmith"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="llm-council"

echo "📦 Preparing code for deployment..."
git add .
git commit -m "Add database support, Xavor branding, and deployment configs" || echo "No changes to commit"

echo ""
echo "🔗 Setting up GitHub remote..."
git branch -M main
git remote remove origin 2>/dev/null
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

echo ""
echo "📤 Pushing to GitHub..."
echo "⚠️  You'll be asked for your GitHub credentials:"
echo "   - Username: ${GITHUB_USERNAME}"
echo "   - Password: Use a Personal Access Token (not your password)"
echo "   - Get token at: https://github.com/settings/tokens"
echo ""
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to: https://railway.app"
    echo "2. Deploy from GitHub repo: ${REPO_NAME}"
    echo "3. Add environment variable: OPENROUTER_API_KEY"
    echo "4. Copy the Railway URL"
    echo "5. Go to: https://vercel.com"
    echo "6. Deploy from GitHub repo: ${REPO_NAME}"
    echo "7. Set Root Directory to: frontend"
    echo "8. Add environment variable: VITE_API_BASE_URL = (Railway URL)"
    echo ""
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "Make sure you:"
    echo "1. Created the repository at: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo "2. Have a Personal Access Token ready"
fi

