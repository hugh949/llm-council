#!/bin/bash
# Script to push code to GitHub
# Usage: ./PUSH-TO-GITHUB.sh YOUR-GITHUB-USERNAME

if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub username"
    echo ""
    echo "Usage: ./PUSH-TO-GITHUB.sh YOUR-USERNAME"
    echo ""
    echo "Example: ./PUSH-TO-GITHUB.sh johnsmith"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="llm-council"

echo "🚀 Pushing code to GitHub..."
echo "Repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo ""

# Remove old remote if exists
git remote remove origin 2>/dev/null

# Add new remote
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

echo "📤 Pushing to GitHub..."
echo "⚠️  You'll be asked for credentials:"
echo "   Username: ${GITHUB_USERNAME}"
echo "   Password: Use a Personal Access Token (get from https://github.com/settings/tokens)"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔗 Your repository: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo "📋 Next: Deploy to Azure (see DEPLOYMENT-GUIDE.md)"
else
    echo ""
    echo "❌ Failed to push. Make sure:"
    echo "   1. Repository exists at: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo "   2. You have a Personal Access Token ready"
    echo "   3. Repository is set to Public"
fi

