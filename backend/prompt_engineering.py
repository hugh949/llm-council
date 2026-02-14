"""Prompt Engineering stage - helps user refine their prompt through conversation."""

from typing import List, Dict, Any, Optional
from .openrouter import query_model
from .config import PROMPT_ENGINEERING_MODEL


async def get_prompt_engineering_response(
    conversation_history: List[Dict[str, str]],
    user_message: str
) -> Optional[str]:
    """
    Get a response from the prompt engineering assistant.
    
    Args:
        conversation_history: Previous messages in the prompt engineering conversation
        user_message: The user's current message
        
    Returns:
        Assistant's response text, or None if failed
    """
    # Build system message for prompt engineering
    system_message = """You are a prompt engineering assistant. Your role is to help the user refine their initial idea into a clear, logical, and effective prompt for LLMs.

Your approach should be:
1. First, understand what the user is trying to achieve
2. Ask relevant follow-up questions to clarify their goals
3. Help them structure their request into a clear prompt
4. Verify the prompt with the user and ask additional questions if needed
5. Ensure the prompt captures what they want in terms of results and output

Be conversational and helpful. Ask one or two questions at a time rather than overwhelming the user. Once you believe the prompt is clear and ready, you can suggest finalizing it, but always let the user confirm.

Keep your responses concise and focused on prompt refinement."""

    # Build message history
    messages = [{"role": "system", "content": system_message}]
    
    # Add conversation history (skip system message if present)
    for msg in conversation_history:
        if msg.get("role") != "system":
            messages.append(msg)
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    # Query the prompt engineering model
    response = await query_model(PROMPT_ENGINEERING_MODEL, messages, timeout=60.0)
    
    if response is None:
        return None
    
    return response.get('content', '')


async def suggest_finalized_prompt(
    conversation_history: List[Dict[str, str]]
) -> Optional[str]:
    """
    Generate a suggested finalized prompt based on the conversation history.
    
    Args:
        conversation_history: The full conversation history
        
    Returns:
        Suggested finalized prompt text, or None if failed
    """
    # Build a prompt to extract the final prompt
    system_message = """You are a prompt engineering assistant. Based on the conversation history, extract and formulate the final, refined prompt that captures what the user wants to achieve. 

Return ONLY the finalized prompt text, without any additional commentary or explanation. The prompt should be clear, complete, and ready to be used with LLMs."""

    messages = [{"role": "system", "content": system_message}]
    
    # Add conversation history (skip system message if present)
    for msg in conversation_history:
        if msg.get("role") != "system":
            messages.append(msg)
    
    # Add instruction to generate final prompt
    messages.append({
        "role": "user",
        "content": "Based on our conversation, please generate the final, refined prompt that captures what I want to achieve. Return only the prompt text."
    })
    
    # Query the prompt engineering model
    response = await query_model(PROMPT_ENGINEERING_MODEL, messages, timeout=60.0)
    
    if response is None:
        return None
    
    return response.get('content', '').strip()


def get_refinement_opening(prior_synthesis: str = "") -> str:
    """
    Return the assistant's opening message for a refinement round.
    Asks the user what additional topics they want to discuss or refine.
    """
    base = (
        "You've completed a council deliberation. The previous synthesis has been considered. "
        "What additional topics would you like to discuss or refine in your prompt? "
        "Share what you'd like to add, clarify, or change."
    )
    if prior_synthesis:
        return f"{base}\n\n*Prior council synthesis (for reference):*\n{prior_synthesis[:500]}{'...' if len(prior_synthesis) > 500 else ''}"
    return base

