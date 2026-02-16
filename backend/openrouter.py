"""OpenRouter API client for making LLM requests."""

import httpx
import sys
from typing import List, Dict, Any, Optional
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 120.0  # Longer timeout for best models (they may take more time for quality)
) -> Optional[Dict[str, Any]]:
    """
    Query a single model via OpenRouter API.

    Args:
        model: OpenRouter model identifier (e.g., "openai/gpt-4o")
        messages: List of message dicts with 'role' and 'content'
        timeout: Request timeout in seconds

    Returns:
        Response dict with 'content' and optional 'reasoning_details', or None if failed
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": model,
        "messages": messages,
    }

    # Check if API key is set
    if not OPENROUTER_API_KEY:
        print(f"Error: OPENROUTER_API_KEY is not set", file=sys.stderr, flush=True)
        return None
    
    try:
        print(f"[OPENROUTER] Querying {model} with timeout={timeout}s", file=sys.stderr, flush=True)
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload
            )
            
            # Log response status for debugging
            if response.status_code != 200:
                error_text = response.text[:500] if hasattr(response, 'text') else str(response.status_code)
                print(f"[OPENROUTER] Error querying model {model}: HTTP {response.status_code} - {error_text}", file=sys.stderr, flush=True)
                return None
            
            response.raise_for_status()

            data = response.json()
            
            # Validate response structure
            if 'choices' not in data or not data['choices']:
                print(f"[OPENROUTER] Error: Invalid response structure from {model} - no choices", file=sys.stderr, flush=True)
                return None
            
            message = data['choices'][0]['message']
            content = message.get('content', '')
            
            if not content:
                print(f"[OPENROUTER] Warning: {model} returned empty content", file=sys.stderr, flush=True)
            else:
                print(f"[OPENROUTER] SUCCESS: {model} returned {len(content)} characters", file=sys.stderr, flush=True)

            return {
                'content': content,
                'reasoning_details': message.get('reasoning_details')
            }

    except httpx.TimeoutException as e:
        print(f"[OPENROUTER] TIMEOUT querying model {model} after {timeout}s", file=sys.stderr, flush=True)
        return None
    except httpx.HTTPStatusError as e:
        error_text = str(e.response.text)[:500] if hasattr(e, 'response') and hasattr(e.response, 'text') else str(e)
        print(f"[OPENROUTER] HTTP error querying model {model}: {error_text}", file=sys.stderr, flush=True)
        return None
    except Exception as e:
        print(f"[OPENROUTER] Error querying model {model}: {type(e).__name__}: {str(e)}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]],
    timeout: Optional[float] = None,
    stage_timeout: Optional[float] = None
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel.

    Args:
        models: List of OpenRouter model identifiers
        messages: List of message dicts to send to each model
        timeout: Per-model timeout in seconds (default 120)
        stage_timeout: Max seconds for whole stage - proceed with partial results (avoids long stalls)

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    import asyncio

    per_model = timeout if timeout is not None else 120.0

    async def query_one(model: str):
        return model, await query_model(model, messages, timeout=per_model)

    tasks = [asyncio.create_task(query_one(m)) for m in models]

    if stage_timeout is not None and stage_timeout > 0:
        done, pending = await asyncio.wait(tasks, timeout=stage_timeout, return_when=asyncio.ALL_COMPLETED)
        if pending:
            print(f"[OPENROUTER] Stage timeout ({stage_timeout}s) - proceeding with {len(done)}/{len(models)} responses", file=sys.stderr, flush=True)
            for t in pending:
                t.cancel()
                try:
                    await t
                except asyncio.CancelledError:
                    pass
        completed = done
    else:
        await asyncio.gather(*tasks)
        completed = set(tasks)

    results = {}
    for t in completed:
        if t.done() and not t.cancelled():
            try:
                model, resp = t.result()
                results[model] = resp
            except Exception:
                pass
    for m in models:
        if m not in results:
            results[m] = None
    return results
