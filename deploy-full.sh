#!/bin/bash
# Commit, push (triggers GitHub Actions deploy), restart Azure app, confirm ready for testing
#
# Usage: ./deploy-full.sh [commit-message]
#
# Prerequisites:
#   - GitHub Actions workflow deploys on push (see .github/workflows/)
#   - Azure CLI installed and logged in (az login) for restart step
#
# Configuration (edit below or set via environment):
#   DEPLOY_APP_NAME       App Service name (default: llm-council-app)
#   DEPLOY_RESOURCE_GROUP Resource group (default: llm-council-rg)
#   DEPLOY_APP_URL        App URL for health check

set -e

# === Configuration (override via environment) ===
APP_SERVICE_NAME="${DEPLOY_APP_NAME:-llm-council-app}"
RESOURCE_GROUP="${DEPLOY_RESOURCE_GROUP:-llm-council-rg}"
APP_URL="${DEPLOY_APP_URL:-https://llm-council-app.azurewebsites.net}"
HEALTH_ENDPOINT="${APP_URL}/api/"
POLL_INTERVAL=15
MAX_WAIT_SECONDS=300  # 5 minutes
GITHUB_REMOTE="${GITHUB_REMOTE:-origin}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

COMMIT_MSG="${1:-Deploy: updates $(date +%Y-%m-%d\ %H:%M)}"

echo "═══════════════════════════════════════════════════════════"
echo "  LLM Council - Commit, Push, Restart, Confirm"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  App:       $APP_SERVICE_NAME"
echo "  Resource:  $RESOURCE_GROUP"
echo "  URL:       $APP_URL"
echo "  Commit:    $COMMIT_MSG"
echo ""

# --- Step 1: Commit ---
echo "📦 Step 1/4: Commit changes..."
if ! git diff --quiet HEAD 2>/dev/null || ! git diff --staged --quiet HEAD 2>/dev/null; then
  git add -A
  git commit -m "$COMMIT_MSG" || true
else
  echo "   (no changes to commit)"
fi
echo ""

# --- Step 2: Push (triggers GitHub Actions deploy) ---
echo "📤 Step 2/4: Push to GitHub (triggers deploy)..."
if ! git push "$GITHUB_REMOTE" "$GITHUB_BRANCH"; then
  echo "❌ Push failed. Fix errors and try again."
  exit 1
fi
echo ""

# --- Step 3: Restart Azure App ---
echo "🔄 Step 3/4: Restart Azure App Service..."
if command -v az &>/dev/null && az account show &>/dev/null; then
  if az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    az webapp restart --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" --output none
    echo "   Restarted $APP_SERVICE_NAME"
  else
    echo "   ⚠️  App '$APP_SERVICE_NAME' not found in '$RESOURCE_GROUP'"
  fi
else
  echo "   ⚠️  Azure CLI not available - restart manually in Azure Portal"
fi
echo ""

# --- Step 4: Wait for app to be ready ---
echo "⏳ Step 4/4: Waiting for app to be ready for testing..."
echo "   (GitHub Actions may take 3-5 min to build and deploy)"
sleep 10
elapsed=0
while [ $elapsed -lt $MAX_WAIT_SECONDS ]; do
  if curl -sf -o /dev/null --connect-timeout 10 "$HEALTH_ENDPOINT" 2>/dev/null; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  ✅ Ready for testing"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "  🌐 $APP_URL"
    echo ""
    exit 0
  fi
  printf "   Waiting... %ds\r" $elapsed
  sleep $POLL_INTERVAL
  elapsed=$((elapsed + POLL_INTERVAL))
done

echo ""
echo "⚠️  Timeout: App did not respond within ${MAX_WAIT_SECONDS}s"
echo "   GitHub Actions may still be deploying - check: https://github.com/hugh949/llm-council/actions"
echo "   URL: $APP_URL"
exit 1
