#!/bin/bash
# Commit, push (triggers GitHub Actions deploy), wait for workflow, restart Azure, health check
#
# Usage: ./deploy-full.sh [commit-message]
#
# Prerequisites:
#   - GitHub Actions workflow deploys on push (see .github/workflows/)
#   - Azure CLI (az) for restart and log tail
#   - gh CLI (optional) for smart workflow polling instead of fixed sleep
#
# Configuration (environment):
#   DEPLOY_APP_NAME       App Service name (default: llm-council-app)
#   DEPLOY_RESOURCE_GROUP Resource group (default: llm-council-rg)
#   DEPLOY_APP_URL        App URL for health check
#   SKIP_PREBUILD=1       Skip pre-push frontend build (faster, less safe)
#   MAX_WAIT_DEPLOY=300   Max seconds to wait for GH Actions (default 300)

set -e

# === Configuration ===
APP_SERVICE_NAME="${DEPLOY_APP_NAME:-llm-council-app}"
RESOURCE_GROUP="${DEPLOY_RESOURCE_GROUP:-llm-council-rg}"
APP_URL="${DEPLOY_APP_URL:-https://llm-council-app.azurewebsites.net}"
GITHUB_REMOTE="${GITHUB_REMOTE:-origin}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
MAX_WAIT_DEPLOY="${MAX_WAIT_DEPLOY:-300}"
LOG_TAIL_SECONDS="${LOG_TAIL_SECONDS:-45}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-6}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-10}"
WORKFLOW_FILE="main_llm-council-app.yml"

COMMIT_MSG="${1:-Deploy: updates $(date +%Y-%m-%d\ %H:%M)}"

# --- Helpers ---
print_header() {
  echo "═══════════════════════════════════════════════════════════"
  echo "  LLM Council - Full Deploy"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  echo "  App:       $APP_SERVICE_NAME"
  echo "  Resource:  $RESOURCE_GROUP"
  echo "  URL:       $APP_URL"
  echo "  Commit:    $COMMIT_MSG"
  echo ""
}

wait_for_gh_actions() {
  if command -v gh &>/dev/null && gh auth status &>/dev/null; then
    echo "   Using gh CLI to watch workflow (smarter than fixed sleep)"
    sleep 12
    RUN_ID=$(gh run list --workflow "$WORKFLOW_FILE" --branch "$GITHUB_BRANCH" --limit 1 --json databaseId,status -q '.[0].databaseId' 2>/dev/null || true)
    if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ]; then
      echo "   Watching run $RUN_ID..."
      if gh run watch "$RUN_ID" 2>&1; then
        echo ""
        echo "   ✅ Workflow completed successfully."
        return 0
      else
        echo ""
        echo "   ❌ Workflow failed or was cancelled."
        return 1
      fi
    fi
  fi
  echo "   (gh CLI not available or run not found - using timed wait)"
  local elapsed=0
  while [ $elapsed -lt "$MAX_WAIT_DEPLOY" ]; do
    printf "\r   Waiting... %ds / %ds  " "$elapsed" "$MAX_WAIT_DEPLOY"
    sleep 15
    elapsed=$((elapsed + 15))
  done
  echo ""
  return 0
}

health_check() {
  local url="$1"
  local retries="${2:-$HEALTH_CHECK_RETRIES}"
  local interval="${3:-$HEALTH_CHECK_INTERVAL}"
  local attempt=1
  while [ $attempt -le "$retries" ]; do
    if code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" 2>/dev/null); then
      if [ "$code" = "200" ] || [ "$code" = "301" ] || [ "$code" = "302" ]; then
        echo "   ✅ Health check OK (HTTP $code)"
        return 0
      fi
    fi
    printf "   Attempt %d/%d: not ready yet, retrying in %ds...\n" "$attempt" "$retries" "$interval"
    sleep "$interval"
    attempt=$((attempt + 1))
  done
  echo "   ⚠️  Health check did not succeed after $retries attempts"
  return 1
}

# --- Main ---
print_header

# Step 0: Optional pre-build (catch frontend errors before push)
if [ "$SKIP_PREBUILD" != "1" ]; then
  echo "🔨 Step 0: Pre-build (frontend)..."
  if [ -d "frontend" ]; then
    (cd frontend && npm run build) || {
      echo "❌ Pre-build failed. Fix errors before deploying. (SKIP_PREBUILD=1 to skip)"
      exit 1
    }
    echo ""
  fi
else
  echo "⏭️  Skipping pre-build (SKIP_PREBUILD=1)"
  echo ""
fi

# Step 1: Commit
echo "📦 Step 1: Commit changes..."
if ! git diff --quiet HEAD 2>/dev/null || ! git diff --staged --quiet HEAD 2>/dev/null; then
  git add -A
  git commit -m "$COMMIT_MSG" || true
else
  echo "   (no changes to commit)"
fi
echo ""

# Step 2: Push (triggers deploy)
echo "📤 Step 2: Push to GitHub..."
if ! git push "$GITHUB_REMOTE" "$GITHUB_BRANCH"; then
  echo "❌ Push failed. Fix errors and try again."
  exit 1
fi
echo ""

# Step 3: Wait for GitHub Actions
echo "⏳ Step 3: Waiting for GitHub Actions deploy..."
if ! wait_for_gh_actions; then
  echo "❌ Deploy failed. Check GitHub Actions for details."
  exit 1
fi
echo ""

# Step 4: Restart Azure, tail logs, health check
echo "🔄 Step 4: Restart Azure App & verify..."
if command -v az &>/dev/null && az account show &>/dev/null; then
  if az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
    az webapp restart --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" --output none
    echo "   Restarted. Tailing logs for ${LOG_TAIL_SECONDS}s..."
    echo ""
    timeout "$LOG_TAIL_SECONDS" az webapp log tail --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" 2>&1 || true
    echo ""
    echo "   Running health check..."
    health_check "$APP_URL" || true
  else
    echo "   ⚠️  App '$APP_SERVICE_NAME' not found in '$RESOURCE_GROUP'"
  fi
else
  echo "   ⚠️  Azure CLI not available - restart manually in Azure Portal"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Deploy complete"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  🌐 $APP_URL"
echo ""
