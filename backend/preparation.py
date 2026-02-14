"""Unified preparation step - prompt refinement + context (RAG) in one conversation.

The LLM uses critical thinking to ask probing questions, refine the prompt,
and suggest when documents/attachments would help for RAG purposes.
"""

from typing import List, Dict, Any, Optional
from .openrouter import query_model
from .config import PROMPT_ENGINEERING_MODEL


async def get_preparation_response(
    conversation_history: List[Dict[str, str]],
    user_message: str,
    documents: List[Dict[str, Any]] = None,
    files: List[Dict[str, Any]] = None,
    links: List[Dict[str, Any]] = None
) -> Optional[str]:
    """
    Get a response from the unified preparation assistant.
    
    Combines prompt refinement with context/RAG awareness. The assistant:
    - Asks probing questions to clarify goals
    - Suggests when to attach documents for RAG
    - Helps structure both the prompt and supporting context
    
    Args:
        conversation_history: Previous messages
        user_message: The user's current message
        documents: Text documents attached
        files: Uploaded files (PDF, Word, etc.)
        links: External links
        
    Returns:
        Assistant's response text, or None if failed
    """
    if documents is None:
        documents = []
    if files is None:
        files = []
    if links is None:
        links = []

    system_message = """You are an expert preparation assistant helping the user get ready for a multi-LLM council deliberation. Your role combines prompt engineering and context engineering.

## Your Capabilities
1. **Critical Thinking & Probing Questions**: Ask thoughtful, targeted questions to help the user clarify their goals, scope, and desired output. Don't assume—probe to uncover hidden requirements, edge cases, and constraints.
2. **Prompt Refinement**: Help structure their idea into a clear, logical, and effective prompt that will work well with multiple LLMs.
3. **RAG & Context Suggestions**: When appropriate, suggest that the user attach documents, files, or links that would improve the council's responses. For example:
   - "Have you considered attaching [type of document]? It could help the council understand [specific aspect]."
   - "If you have reference materials, guidelines, or examples relevant to this topic, adding them would strengthen the deliberation."
   - "Documents like technical specs, prior analyses, or policy documents could provide valuable context here."

## Guidelines
- Be conversational and supportive. Ask one or two focused questions at a time.
- When the prompt seems vague or could benefit from domain-specific context, suggest RAG attachments.
- Once the prompt is clear and well-supported (with or without attachments), suggest they finalize and run the council.
- Keep responses concise but substantive.
- Consider: What would a council of expert LLMs need to give a great answer?"""

    messages = [{"role": "system", "content": system_message}]
    
    for msg in conversation_history:
        if msg.get("role") != "system":
            messages.append(msg)
    
    # Add attachment summary if any
    attachment_info = []
    if documents:
        attachment_info.append(f"{len(documents)} text document(s)")
    if files:
        names = [f.get("name", "file") for f in files[:5]]
        if len(files) > 5:
            names.append(f"...+{len(files)-5} more")
        attachment_info.append(f"Files: {', '.join(names)}")
    if links:
        attachment_info.append(f"{len(links)} link(s)")
    
    # Add user message with optional attachment context
    if attachment_info:
        user_content = f"{user_message}\n\n[Attachments: {'; '.join(attachment_info)}]"
    else:
        user_content = user_message
    messages.append({"role": "user", "content": user_content})
    
    response = await query_model(PROMPT_ENGINEERING_MODEL, messages, timeout=60.0)
    if response is None:
        return None
    
    return response.get("content", "")
