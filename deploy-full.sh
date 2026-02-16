#!/bin/bash
# Commit, push (triggers GitHub Actions deploy), wait, restart Azure app, confirm via log tail
#
# Usage: ./deploy-full.sh [commit-message]
#
# Prerequisites:
#   - GitHub Actions workflow deploys on push (see .github/workflows/)
#   - Azure CLI (az) installed and logged in for restart and log tail
#
# Configuration (edit below or set via environment):
#   DEPLOY_APP_NAME       App Service name (default: llm-council-app)
#   DEPLOY_RESOURCE_GROUP Resource group (default: llm-council-rg)
#   DEPLOY_APP_URL        App URL

set -e

# === Configuration (override via environment) ===
APP_SERVICE_NAME="${DEPLOY_APP_NAME:-llm-council-app}"
RESOURCE_GROUP="${DEPLOY_RESOURCE_GROUP:-llm-council-rg}"
APP_URL="${DEPLOY_APP_URL:-https://llm-council-app.azurewebsites.net}"
GITHUB_REMOTE="${GITHUB_REMOTE:-origin}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
WAIT_FOR_DEPLOY=240   # Seconds to wait for GitHub Actions before restart (4 min)
LOG_TAIL_SECONDS=45   # Seconds to tail logs to confirm startup

COMMIT_MSG="${1:-Deploy: updates $(date +%Y-%m-%d\ %H:%M)}"

echo "═══════════════════════════════════════════════════════════"
echo "  LLM Council - Commit, Push, Wait for Deploy"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  App:       $APP_SERVICE_NAME"
echo "  Resource:  $RESOURCE_GROUP"
echo "  URL:       $APP_URL"
echo "  Commit:    $COMMIT_MSG"
echo ""

# --- Step 0 (optional): Capture pre-deploy logs ---
if [ "$CAPTURE_LOGS_BEFORE_DEPLOY" = "1" ]; then
  echo "📋 Step 0: Capturing pre-deploy logs..."
  ./scripts/review-logs.sh before-deploy || true
  echo ""
fi

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

# --- Step 3: Wait for GitHub Actions, restart Azure, confirm via logs ---
echo "⏳ Step 3/4: Waiting ${WAIT_FOR_DEPLOY}s for GitHub Actions to deploy..."
sleep "$WAIT_FOR_DEPLOY"
echo ""

# --- Step 4: Restart Azure App and confirm via log tail ---
echo "🔄 Step 4/4: Restarting Azure App and tailing logs..."
if command -v az &>/dev/null && az account show &>/dev/null; then
  if az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    az webapp restart --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" --output none
    echo "   Restarted $APP_SERVICE_NAME. Tailing logs for ${LOG_TAIL_SECONDS}s..."
    echo ""
    timeout "$LOG_TAIL_SECONDS" az webapp log tail --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" 2>&1 || true
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  ✅ Restart complete. Check logs above for startup status."
    echo "═══════════════════════════════════════════════════════════"
  else
    echo "   ⚠️  App '$APP_SERVICE_NAME' not found in '$RESOURCE_GROUP'"
  fi
else
  echo "   ⚠️  Azure CLI not available - restart manually in Azure Portal"
fi
echo ""
echo "  🌐 $APP_URL"
echo ""
