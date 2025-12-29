#!/bin/bash
# Quick push script for hugh949

echo "🚀 Pushing to GitHub (hugh949/llm-council)..."
echo ""

# Ensure remote is set correctly
git remote remove origin 2>/dev/null
git remote add origin https://github.com/hugh949/llm-council.git

echo "📤 Attempting to push..."
echo ""
echo "⚠️  You'll be asked for credentials:"
echo "   Username: hugh949"
echo "   Password: Use a Personal Access Token (NOT your GitHub password)"
echo ""
echo "   Get token at: https://github.com/settings/tokens"
echo "   Click 'Generate new token (classic)' → Check 'repo' → Generate"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔗 Repository: https://github.com/hugh949/llm-council"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Deploy backend to Azure App Service (see DEPLOY-AZURE.md)"
    echo "   2. Deploy frontend to Azure Static Web Apps (see DEPLOY-FRONTEND-AZURE.md)"
    echo "   (See DEPLOYMENT-GUIDE.md for complete instructions)"
else
    echo ""
    echo "❌ Push failed. Make sure you:"
    echo "   1. Have a Personal Access Token ready"
    echo "   2. Repository exists at: https://github.com/hugh949/llm-council"
fi

