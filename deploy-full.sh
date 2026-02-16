#!/bin/bash
# Commit, push (triggers GitHub Actions deploy), wait for deploy, confirm ready for testing
#
# Usage: ./deploy-full.sh [commit-message]
#
# Prerequisites:
#   - GitHub Actions workflow deploys on push (see .github/workflows/)
#   - GitHub Actions' azure/webapps-deploy triggers restart after deployment
#   - Do NOT restart Azure manually before deploy completes (use old code)
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
MAX_WAIT_SECONDS=420  # 7 minutes (GitHub Actions build+deploy typically 3-5 min)
GITHUB_REMOTE="${GITHUB_REMOTE:-origin}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

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
echo "📦 Step 1/3: Commit changes..."
if ! git diff --quiet HEAD 2>/dev/null || ! git diff --staged --quiet HEAD 2>/dev/null; then
  git add -A
  git commit -m "$COMMIT_MSG" || true
else
  echo "   (no changes to commit)"
fi
echo ""

# --- Step 2: Push (triggers GitHub Actions deploy) ---
echo "📤 Step 2/3: Push to GitHub (triggers deploy)..."
if ! git push "$GITHUB_REMOTE" "$GITHUB_BRANCH"; then
  echo "❌ Push failed. Fix errors and try again."
  exit 1
fi
echo ""

# --- Step 3: Wait for GitHub Actions deploy + app to be ready ---
echo "⏳ Step 3/3: Waiting for GitHub Actions to build and deploy..."
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
    echo "  Verify version: check build timestamp (YYYY-MM-DD) next to v1.0 in sidebar"
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
