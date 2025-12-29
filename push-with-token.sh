#!/bin/bash
# Push script that uses token from command line or prompts for it

echo "🚀 Pushing to GitHub (hugh949/llm-council)..."
echo ""

# Check if token provided as argument
if [ -z "$1" ]; then
    echo "📝 Please provide your GitHub Personal Access Token"
    echo ""
    echo "Usage: ./push-with-token.sh YOUR_TOKEN"
    echo ""
    echo "Or get a token at: https://github.com/settings/tokens"
    echo ""
    read -sp "Enter your token: " TOKEN
    echo ""
else
    TOKEN=$1
fi

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

# Set remote URL with token embedded
git remote set-url origin https://${TOKEN}@github.com/hugh949/llm-council.git

echo "📤 Pushing to GitHub..."
git push -u origin main

# Remove token from remote URL for security
git remote set-url origin https://github.com/hugh949/llm-council.git

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔗 Repository: https://github.com/hugh949/llm-council"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Deploy backend to Railway: https://railway.app"
    echo "   2. Deploy frontend to Vercel: https://vercel.com"
    echo "   (See YOUR-DEPLOYMENT.md for details)"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   1. Token is valid and has 'repo' permissions"
    echo "   2. Repository exists at: https://github.com/hugh949/llm-council"
fi

