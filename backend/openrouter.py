"""OpenRouter API client for making LLM requests."""

import httpx
import sys
from typing import List, Dict, Any, Optional
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    timeout: float = 60.0  # Reduced from 120s for faster failure detection
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
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload
            )
            
            # Log response status for debugging
            if response.status_code != 200:
                error_text = response.text[:500] if hasattr(response, 'text') else str(response.status_code)
                print(f"Error querying model {model}: HTTP {response.status_code} - {error_text}", file=sys.stderr, flush=True)
                return None
            
            response.raise_for_status()

            data = response.json()
            message = data['choices'][0]['message']

            return {
                'content': message.get('content'),
                'reasoning_details': message.get('reasoning_details')
            }

    except httpx.HTTPStatusError as e:
        error_text = str(e.response.text)[:500] if hasattr(e, 'response') and hasattr(e.response, 'text') else str(e)
        print(f"HTTP error querying model {model}: {error_text}", file=sys.stderr, flush=True)
        return None
    except Exception as e:
        print(f"Error querying model {model}: {type(e).__name__}: {str(e)}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None


async def query_models_parallel(
    models: List[str],
    messages: List[Dict[str, str]]
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel.

    Args:
        models: List of OpenRouter model identifiers
        messages: List of message dicts to send to each model

    Returns:
        Dict mapping model identifier to response dict (or None if failed)
    """
    import asyncio

    # Create tasks for all models
    tasks = [query_model(model, messages) for model in models]

    # Wait for all to complete
    responses = await asyncio.gather(*tasks)

    # Map models to their responses
    return {model: response for model, response in zip(models, responses)}
