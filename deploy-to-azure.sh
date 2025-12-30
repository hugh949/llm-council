#!/bin/bash
# Azure CLI deployment script for single URL deployment

set -e  # Exit on error

echo "🚀 Starting Azure Deployment..."
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed."
    echo "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
echo "📋 Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "⚠️  Not logged in to Azure. Please login first:"
    echo "   Run: az login"
    exit 1
fi

# Get current account info
echo "✅ Logged in to Azure"
ACCOUNT=$(az account show --query "user.name" -o tsv)
echo "   Account: $ACCOUNT"
echo ""

# Prompt for resource group and app service name
echo "📝 Please provide Azure App Service details:"
read -p "Resource Group name: " RESOURCE_GROUP
read -p "App Service name: " APP_SERVICE_NAME

# Verify resource group exists
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Resource group '$RESOURCE_GROUP' not found."
    exit 1
fi

# Verify app service exists
if ! az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ App Service '$APP_SERVICE_NAME' not found in resource group '$RESOURCE_GROUP'."
    exit 1
fi

echo ""
echo "✅ Found App Service: $APP_SERVICE_NAME"
echo ""

# Build the app locally first
echo "🔨 Building frontend..."
./build-single-app.sh

# Deploy using Azure CLI (local git deployment)
echo ""
echo "📦 Deploying to Azure..."

# Option 1: Deploy via ZIP (recommended)
echo "   Creating deployment package..."
zip -r deploy.zip . -x "*.git*" "node_modules/*" "frontend/node_modules/*" ".env*" "data/*" "*.db" "*.sqlite*" "backend/static/*" 2>/dev/null || true

# Build and include static files in zip
./build-single-app.sh

# Re-create zip with static files
zip -r deploy.zip . -x "*.git*" "node_modules/*" "frontend/node_modules/*" ".env*" "data/*" "*.db" "*.sqlite*" 2>/dev/null || true

echo "   Uploading to Azure..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE_NAME" \
    --src deploy.zip

# Clean up
rm -f deploy.zip

# Configure startup command
echo ""
echo "⚙️  Configuring startup command..."
az webapp config set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE_NAME" \
    --startup-file "startup.sh" \
    --output none

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be available at:"
APP_URL=$(az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" --query "defaultHostName" -o tsv)
echo "   https://$APP_URL"
echo ""
echo "📋 Next steps:"
echo "   1. Verify Node.js extension is installed in Azure Portal"
echo "   2. Check Application settings for OPENROUTER_API_KEY"
echo "   3. Restart the App Service if needed"
echo "   4. Test the URL above"
echo ""

