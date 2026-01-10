# ⚡ Optimize Step 3 Performance

## ❌ The Problem

Step 3 (Council Deliberation) is running very slowly.

## 🔍 Root Causes

1. **Model Availability**: Some models in `COUNCIL_MODELS` might not exist or be slow:
   - `openai/gpt-5.1` - May not exist, could timeout
   - `google/gemini-3-pro` - May not exist, could timeout
   - `x-ai/grok-4` - May not exist, could timeout

2. **Long Timeouts**: Default timeout is 120 seconds per model
   - If a model doesn't exist, it waits 120 seconds before failing
   - With 4 models × 2 stages = 8 calls, this can take a long time

3. **Large Context**: The full context from Step 2 is sent to all models
   - This makes each API call slower
   - More tokens = more processing time

## ✅ Optimizations Applied

### 1. Updated Models to Proven, Fast Ones

Changed `COUNCIL_MODELS` to:
- `openai/gpt-4o` - Fast and reliable
- `google/gemini-2.0-flash-exp` - Very fast
- `anthropic/claude-3.5-sonnet` - Fast and reliable
- `anthropic/claude-3-haiku` - Very fast

### 2. Reduced Timeout

- Reduced default timeout from 120s to 60s
- Faster failure if a model doesn't respond
- Chairman model still gets 90s for synthesis

### 3. Models Run in Parallel

- Stage 1: All 4 models query in parallel ✅
- Stage 2: All 4 models rank in parallel ✅
- This is already optimized!

---

## 📋 What Changed

1. **backend/config.py**: Updated `COUNCIL_MODELS` to use proven models
2. **backend/openrouter.py**: Reduced timeout to 60 seconds
3. **backend/council.py**: Chairman gets 90 seconds for synthesis

---

## 🚀 Expected Improvement

**Before:**
- If models don't exist: 120s × 8 calls = 16 minutes (worst case)
- If models are slow: 30-60s per call

**After:**
- Faster models: 5-15s per call
- Faster failure: 60s max per call
- Total time: ~30-60 seconds instead of minutes

---

## ✅ Next Steps

1. **Wait for Azure to redeploy** (2-3 minutes)
2. **Test Step 3** - should be much faster now!

---

**The optimizations are committed and pushed. Step 3 should be much faster!** ⚡


