# Stage 3 Diagnostics & Troubleshooting

## Overview

Stage 3 (Final Synthesis) is where the Chairman model synthesizes all Stage 1 responses and Stage 2 rankings into a final answer. This document explains how to diagnose and fix issues when Stage 3 doesn't complete.

## Common Causes of Stage 3 Failures

### 1. **API Timeout (Most Common)**
- **Symptom**: Stage 3 starts but never completes
- **Cause**: Chairman model (Gemini 3 Flash Preview) takes longer than 150 seconds
- **Log Pattern**: `[STAGE3] TIMEOUT querying model` or `OPENROUTER TIMEOUT`
- **Fix**: 
  - Check Azure Log Stream for timeout messages
  - Consider increasing timeout in `council.py` line 169
  - Switch to a faster chairman model in `config.py`

### 2. **API Credit Exhaustion**
- **Symptom**: Stage 1 or 2 completes, but Stage 3 fails with error
- **Cause**: OpenRouter account ran out of credits
- **Log Pattern**: `HTTP error querying model` with 402 status code
- **Fix**: Add credits to your OpenRouter account

### 3. **Invalid API Key**
- **Symptom**: All stages fail immediately
- **Cause**: OPENROUTER_API_KEY is invalid or not set
- **Log Pattern**: `Error: OPENROUTER_API_KEY is not set` or 401 HTTP error
- **Fix**: Update the API key in Azure App Service configuration

### 4. **Empty Response from Chairman**
- **Symptom**: Stage 3 completes but shows error message
- **Cause**: Chairman model returned empty content
- **Log Pattern**: `[STAGE3] ERROR: Chairman model returned empty content`
- **Fix**: Retry the query or check OpenRouter status

### 5. **Model Unavailable**
- **Symptom**: Stage 3 fails with specific model error
- **Cause**: The chairman model is temporarily unavailable on OpenRouter
- **Log Pattern**: Model-specific HTTP error (503, 504)
- **Fix**: Wait and retry, or temporarily switch chairman model

## How to Monitor Logs

### Azure Portal (Recommended)
1. Go to your Azure App Service
2. Click **Log stream** in the left menu
3. Watch for `[COUNCIL]`, `[STAGE3]`, and `[OPENROUTER]` log prefixes
4. Look for ERROR or TIMEOUT messages

### Log Patterns to Watch For

**Successful Stage 3:**
```
[COUNCIL] Starting Stage 3 synthesis with chairman model
[STAGE3] Starting synthesis with 5 Stage 1 results and 5 Stage 2 rankings
[STAGE3] Querying chairman model: google/gemini-3-flash-preview with timeout=150s
[OPENROUTER] Querying google/gemini-3-flash-preview with timeout=150.0s
[OPENROUTER] SUCCESS: google/gemini-3-flash-preview returned 2847 characters
[STAGE3] SUCCESS: Chairman model returned 2847 characters
[COUNCIL] Stage 3 completed successfully. Response length: 2847
```

**Failed Stage 3 (Timeout):**
```
[COUNCIL] Starting Stage 3 synthesis with chairman model
[STAGE3] Starting synthesis with 5 Stage 1 results and 5 Stage 2 rankings
[STAGE3] Querying chairman model: google/gemini-3-flash-preview with timeout=150s
[OPENROUTER] Querying google/gemini-3-flash-preview with timeout=150.0s
[OPENROUTER] TIMEOUT querying model google/gemini-3-flash-preview after 150s
[STAGE3] ERROR: Chairman model returned None
```

**Failed Stage 3 (API Error):**
```
[OPENROUTER] Error querying model google/gemini-3-flash-preview: HTTP 402 - {"error": "Insufficient credits"}
[STAGE3] ERROR: Chairman model returned None
```

## Error Handling Improvements (Latest Commit)

The system now includes comprehensive error handling:

1. **Try-catch blocks**: All Stage 3 operations are wrapped in try-catch
2. **Null checks**: Validates chairman model response is not null or empty
3. **Timeout handling**: Specific handling for timeout exceptions
4. **Fallback responses**: Returns user-friendly error messages instead of failing silently
5. **Detailed logging**: Every step logs success/failure with details

## Frontend Error Display

The frontend now shows clear error messages when Stage 3 fails:

- Red border and background on Stage 3 section
- Error banner with explanation
- Full error message from backend
- Clear indication that synthesis failed vs. succeeded

## Configuration Files

### Chairman Model Settings
File: `backend/config.py`
```python
CHAIRMAN_MODEL = "google/gemini-3-flash-preview"
```

### Timeout Settings
File: `backend/council.py` (line 169)
```python
response = await query_model(CHAIRMAN_MODEL, messages, timeout=150.0)
```

### API Configuration
File: `backend/config.py`
```python
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
```

## Recommended Actions

### For Frequent Timeouts
1. **Increase timeout**: Edit `council.py` line 169 to use 180 or 200 seconds
2. **Switch model**: Use a faster chairman model:
   ```python
   CHAIRMAN_MODEL = "google/gemini-2.0-flash-exp"  # Faster alternative
   ```
3. **Monitor OpenRouter**: Check https://openrouter.ai/status for model availability

### For API Credit Issues
1. **Add credits**: Go to OpenRouter dashboard and add credits
2. **Set up alerts**: Configure low-credit notifications
3. **Monitor usage**: Track API usage in OpenRouter dashboard

### For Persistent Failures
1. **Check logs**: Review Azure Log Stream for specific error patterns
2. **Test API key**: Use test_openrouter.py to verify key works
3. **Verify model**: Check OpenRouter.ai that chairman model is available
4. **Try different model**: Temporarily switch to a different chairman model

## Testing Stage 3

To test Stage 3 completion:

1. Create a new conversation
2. Complete Steps 1 and 2
3. Start council deliberation
4. Watch Azure logs in real-time
5. Verify Stage 3 completes with green success background (not red error)

## Original Implementation Reference

This implementation follows the 3-stage deliberation pattern:
- **Stage 1**: Independent responses from all council models
- **Stage 2**: Anonymous peer ranking by all models
- **Stage 3**: Chairman synthesis of all information

The key is ensuring Stage 3 **always completes** - either with a successful synthesis or a clear error message. Never leave the user wondering if something is still processing.

## Future Improvements

Consider these enhancements:
1. **Retry logic**: Auto-retry Stage 3 if it fails due to timeout
2. **Progress indicators**: Show countdown for long-running Stage 3
3. **Fallback chairman**: Auto-switch to backup model if primary fails
4. **Health checks**: Periodic checks of OpenRouter model availability
5. **Rate limiting**: Prevent hitting OpenRouter rate limits
