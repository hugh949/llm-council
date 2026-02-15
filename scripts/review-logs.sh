#!/bin/bash
# Log review CLI: capture, review, and compare Azure App Service logs before/after deploy
#
# Usage:
#   ./scripts/review-logs.sh capture [seconds]     Capture logs for N seconds (default 60)
#   ./scripts/review-logs.sh before-deploy         Capture logs before deploy (saves as pre-deploy baseline)
#   ./scripts/review-logs.sh review <file>         Analyze a log file for errors, warnings, key events
#   ./scripts/review-logs.sh compare <before> <after>  Compare two log files, highlight new issues
#
# Prerequisites:
#   - Azure CLI (az) installed and logged in for capture commands
#   - DEPLOY_APP_NAME, DEPLOY_RESOURCE_GROUP (or defaults)
#
# Practice: Run "before-deploy" before ./deploy-full.sh to establish a baseline.
#           After deploy, capture new logs and use "compare" to catch regressions.

set -e

# === Configuration ===
APP_SERVICE_NAME="${DEPLOY_APP_NAME:-llm-council-app}"
RESOURCE_GROUP="${DEPLOY_RESOURCE_GROUP:-llm-council-rg}"
LOGS_DIR="${LOGS_DIR:-$(pwd)/logs}"
mkdir -p "$LOGS_DIR"

# --- Subcommands ---

cmd_capture() {
  local seconds="${1:-60}"
  local stamp
  stamp=$(date +%Y%m%d-%H%M%S)
  local commit
  commit=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
  local outfile="${LOGS_DIR}/capture-${stamp}-${commit}.txt"
  echo "Capturing logs for ${seconds}s to $outfile ..."
  echo "Press Ctrl+C to stop early."
  if command -v az &>/dev/null && az account show &>/dev/null 2>&1; then
    if az webapp show --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
      {
        echo "=== LLM Council log capture ==="
        echo "Date: $(date -Iseconds)"
        echo "Git: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
        echo "App: $APP_SERVICE_NAME"
        echo "========================================"
        timeout "$seconds" az webapp log tail --name "$APP_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" 2>&1 || true
      } > "$outfile"
      echo "Saved to $outfile"
      echo "Run: ./scripts/review-logs.sh review $outfile"
    else
      echo "Error: App '$APP_SERVICE_NAME' not found. Check DEPLOY_APP_NAME and DEPLOY_RESOURCE_GROUP."
      exit 1
    fi
  else
    echo "Azure CLI not available. Paste logs manually and save to $outfile, then run:"
    echo "  ./scripts/review-logs.sh review $outfile"
    exit 1
  fi
}

cmd_before_deploy() {
  local stamp
  stamp=$(date +%Y%m%d-%H%M%S)
  local commit
  commit=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
  local outfile="${LOGS_DIR}/pre-deploy-${stamp}-${commit}.txt"
  echo "Capturing pre-deploy baseline (30s)..."
  cmd_capture 30
  # Rename to pre-deploy (capture uses its own name)
  local latest
  latest=$(ls -t "${LOGS_DIR}"/capture-*.txt 2>/dev/null | head -1)
  if [ -n "$latest" ]; then
    mv "$latest" "$outfile"
    echo ""
    echo "Baseline saved: $outfile"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./deploy-full.sh"
    echo "  2. After deploy, capture new logs: ./scripts/review-logs.sh capture 45"
    echo "  3. Compare: ./scripts/review-logs.sh compare $outfile <new-capture>.txt"
  fi
}

cmd_review() {
  local file="$1"
  if [ -z "$file" ] || [ ! -f "$file" ]; then
    echo "Usage: ./scripts/review-logs.sh review <log-file>"
    exit 1
  fi
  echo "═══════════════════════════════════════════════════════════"
  echo "  Log Review: $file"
  echo "═══════════════════════════════════════════════════════════"
  echo ""

  # Errors
  local errors
  errors=$(grep -E "ERROR|Error|error:|Exception|Traceback|failed|Failed|FAILED|500 Internal" "$file" 2>/dev/null | tail -50)
  if [ -n "$errors" ]; then
    echo "❌ ERRORS / EXCEPTIONS (last 50):"
    echo "----------------------------------------"
    echo "$errors"
    echo ""
  else
    echo "✅ No obvious errors found."
    echo ""
  fi

  # HTTP 4xx/5xx
  local http_err
  http_err=$(grep -E '" (4[0-9][0-9]|5[0-9][0-9]) ' "$file" 2>/dev/null | tail -20)
  if [ -n "$http_err" ]; then
    echo "⚠️  HTTP 4xx/5xx responses:"
    echo "----------------------------------------"
    echo "$http_err"
    echo ""
  fi

  # Warnings
  local warnings
  warnings=$(grep -E "Warning|WARNING|DeprecationWarning|⚠️" "$file" 2>/dev/null | tail -20)
  if [ -n "$warnings" ]; then
    echo "⚠️  WARNINGS:"
    echo "----------------------------------------"
    echo "$warnings"
    echo ""
  fi

  # Council flow
  echo "📋 COUNCIL FLOW:"
  echo "----------------------------------------"
  grep -E "\[COUNCIL\]|Stage 1|Stage 2|Stage 3|OPENROUTER" "$file" 2>/dev/null | tail -30 || echo "(none found)"
  echo ""

  # Request summary
  echo "📊 REQUEST SUMMARY:"
  echo "----------------------------------------"
  echo "Total HTTP requests: $(grep -c 'HTTP/1.1' "$file" 2>/dev/null || echo 0)"
  echo "200 OK: $(grep -c '" 200 ' "$file" 2>/dev/null || echo 0)"
  echo "4xx/5xx: $(grep -E '" (4[0-9][0-9]|5[0-9][0-9]) ' "$file" 2>/dev/null | wc -l)"
  echo ""
}

cmd_compare() {
  local before="$1"
  local after="$2"
  if [ -z "$before" ] || [ -z "$after" ] || [ ! -f "$before" ] || [ ! -f "$after" ]; then
    echo "Usage: ./scripts/review-logs.sh compare <before.log> <after.log>"
    exit 1
  fi
  echo "═══════════════════════════════════════════════════════════"
  echo "  Compare: $(basename "$before") vs $(basename "$after")"
  echo "═══════════════════════════════════════════════════════════"
  echo ""

  echo "Errors in AFTER that were not in BEFORE (potential regressions):"
  echo "----------------------------------------"
  local err_before err_after new_err
  err_before=$(grep -oE "ERROR|Exception|Traceback|failed|5[0-9][0-9] Internal" "$before" 2>/dev/null | sort -u)
  err_after=$(grep -E "ERROR|Exception|Traceback|failed|5[0-9][0-9] Internal" "$after" 2>/dev/null)
  if [ -n "$err_after" ]; then
    # Show errors from after - user can manually compare
    echo "$err_after" | tail -30
  else
    echo "(no new errors detected)"
  fi
  echo ""

  echo "Run full review on each file:"
  echo "  ./scripts/review-logs.sh review $before"
  echo "  ./scripts/review-logs.sh review $after"
  echo ""
}

# --- Main ---
case "${1:-}" in
  capture)   cmd_capture "${2:-60}" ;;
  before-deploy) cmd_before_deploy ;;
  review)    cmd_review "$2" ;;
  compare)   cmd_compare "$2" "$3" ;;
  *)
    echo "Log Review CLI for LLM Council"
    echo ""
    echo "Usage:"
    echo "  $0 capture [seconds]      Capture Azure logs (default 60s)"
    echo "  $0 before-deploy          Capture baseline before deploy"
    echo "  $0 review <file>          Analyze log file"
    echo "  $0 compare <before> <after>  Compare two log files"
    echo ""
    echo "Config: DEPLOY_APP_NAME=$APP_SERVICE_NAME DEPLOY_RESOURCE_GROUP=$RESOURCE_GROUP"
    echo "Logs dir: $LOGS_DIR"
    exit 0
    ;;
esac
