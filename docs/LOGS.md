# Log Review Practice for LLM Council

This document describes the log review workflow to ensure app behavior is working as designed and to catch regressions early.

## Principle

**Log review is standard practice when bugs or issues are reported.** Review logs before proposing code changes—they show what actually happened at runtime. Also review logs before deploying a new version so you can incorporate issues early.

## Trigger: When to Do Log Review

- **User reports a bug or unexpected behavior** – Log review is part of the investigation. Ask for logs or capture them, review first, then propose fixes.
- **User requests a feature change** – If the change touches backend/council/preparation, capture a baseline and review to avoid regressions.
- **Before releasing a fix** – Capture logs so the next deploy has a baseline to compare against.

## CLI Script: `scripts/review-logs.sh`

### Commands

| Command | Description |
|---------|-------------|
| `./scripts/review-logs.sh capture [seconds]` | Capture Azure App Service logs for N seconds (default 60). Saves to `logs/capture-YYYYMMDD-HHMMSS-<commit>.txt` |
| `./scripts/review-logs.sh before-deploy` | Capture a 30s baseline before deploy. Saves to `logs/pre-deploy-*.txt` |
| `./scripts/review-logs.sh review <file>` | Analyze a log file: errors, warnings, HTTP 4xx/5xx, council flow, request summary |
| `./scripts/review-logs.sh compare <before> <after>` | Compare two log files to spot new issues after deploy |

### Prerequisites

- Azure CLI (`az`) installed and logged in (`az login`) for capture commands
- Config: `DEPLOY_APP_NAME`, `DEPLOY_RESOURCE_GROUP` (or use defaults)

### Recommended Workflow

1. **Before deploy:**
   ```bash
   ./scripts/review-logs.sh before-deploy
   ```
   This captures a baseline and reminds you of the next steps.

2. **Deploy:**
   ```bash
   ./deploy-full.sh
   ```

3. **After deploy (once app is ready):**
   ```bash
   ./scripts/review-logs.sh capture 45
   ```

4. **Review and compare:**
   ```bash
   ./scripts/review-logs.sh review logs/pre-deploy-<timestamp>.txt
   ./scripts/review-logs.sh review logs/capture-<timestamp>.txt
   ./scripts/review-logs.sh compare logs/pre-deploy-*.txt logs/capture-*.txt
   ```

### Optional: Auto-capture before deploy

Set `CAPTURE_LOGS_BEFORE_DEPLOY=1` to automatically capture logs before each deploy:

```bash
CAPTURE_LOGS_BEFORE_DEPLOY=1 ./deploy-full.sh
```

## Log Output in Azure

Logs go to stderr and appear in Azure App Service **Log stream**:

- `[llm_council.api]` – API operations (create_conversation, preparation_message, suggest_final, finalize_prompt, council_stream_start)
- `[llm_council.db]` – Database init (once at startup)
- `[COUNCIL]` – Council stages (Stage 1, 2, 3)
- `[OPENROUTER]` – Model API calls

## What to Look For

When reviewing logs:

1. **Errors** – `ERROR`, `Exception`, `Traceback`, `failed`, HTTP 500
2. **Warnings** – `DeprecationWarning`, `⚠️`
3. **Council flow** – Stage 1/2/3 completion, model response counts
4. **Request patterns** – Many 4xx/5xx, slow responses
5. **New in after-deploy** – Errors that didn’t appear in the pre-deploy baseline

## Integration with Development

- Use `review` on any saved log file (e.g. pasted from Azure Portal)
- Add more `log_api()` calls in `backend/main.py` for new endpoints
- Keep log volume reasonable: log key operations, not every DB access
