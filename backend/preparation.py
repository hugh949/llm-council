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
    links: List[Dict[str, Any]] = None,
    prior_synthesis: Optional[str] = None,
    prior_preparation_summary: Optional[str] = None,
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

    base_system = """You are an expert critical thinking prompt engineer helping the user prepare for a multi-LLM council deliberation. Your job is to ask the right questions—probing, clarifying, and sharpening—so their prompt is ready for deliberation.

## Your Approach
1. **Start by asking how you can help**: Invite the user to describe what they want to achieve.
2. **Ask the right questions**: As an expert prompt engineer, you know what makes a prompt effective. Ask targeted questions about goals, scope, constraints, desired output format, and edge cases. Don't assume—probe.
3. **Use attached documents in your guidance**: When the user has attached documents, files, or links, explicitly reference them. Incorporate what they provide into your questions and suggestions. If they attach a report, spec, or reference, use it to ask more focused questions and refine the prompt around that context.
4. **Suggest attachments when useful**: If the prompt could benefit from reference materials, suggest they add documents. Once attached, actively use them in your guidance.
5. **Suggest finalization when ready**: When the prompt is clear and well-supported (with or without attachments), suggest they use "Suggest Final Prompt" to get a draft they can review and submit for deliberation.

## Guidelines
- Be conversational and supportive. Ask one or two focused questions at a time.
- When documents are attached: reference specific content or themes when giving guidance.
- Keep responses concise but substantive.
- Consider: What would a council of expert LLMs need to give a great answer?"""

    prior_context = ""
    if prior_synthesis and prior_synthesis.strip():
        prior_context = f"""

## Prior Deliberation Context

The user is refining a prompt that was already deliberated on. Here is what the council previously concluded:

{prior_synthesis[:4000]}{'...' if len(prior_synthesis) > 4000 else ''}

Your job: Help the user identify what was missing, what needs deeper analysis, what assumptions should be challenged, and how to sharpen the prompt for a better second round. Do NOT repeat the prior synthesis. Push the user to go further with probing questions and critical thinking.
"""
    if prior_preparation_summary and prior_preparation_summary.strip():
        prior_context += f"""

## Prior Preparation Conversation

The user already discussed the following in the previous round. Do NOT re-ask questions that were resolved. Build on what was clarified and push on what is still unexplored:

{prior_preparation_summary[:3000]}{'...' if len(prior_preparation_summary) > 3000 else ''}
"""

    system_message = base_system + prior_context

    messages = [{"role": "system", "content": system_message}]
    
    for msg in conversation_history:
        if msg.get("role") != "system":
            messages.append(msg)
    
    # Add attachment summary and document content for the assistant to consume
    attachment_info = []
    doc_content_section = ""
    if documents:
        attachment_info.append(f"{len(documents)} text document(s)")
        # Include document content (truncated) so the assistant can use it in guidance
        for doc in documents:
            name = doc.get("name", "Untitled")
            content = doc.get("content", "")
            if content:
                excerpt = content[:2500] + ("..." if len(content) > 2500 else "")
                doc_content_section += f"\n\n--- Document: {name} ---\n{excerpt}"
    if files:
        names = [f.get("name", "file") for f in files[:5]]
        if len(files) > 5:
            names.append(f"...+{len(files)-5} more")
        attachment_info.append(f"Files: {', '.join(names)}")
        # Include extracted file content when available
        for f in files[:3]:  # Limit to first 3 files to avoid token overflow
            content = f.get("content") or f.get("extracted_text") or ""
            if content:
                name = f.get("name", "File")
                excerpt = content[:2500] + ("..." if len(content) > 2500 else "")
                doc_content_section += f"\n\n--- File: {name} ---\n{excerpt}"
    if links:
        attachment_info.append(f"{len(links)} link(s)")
        for link in links[:2]:  # Include first 2 link contents if available
            content = link.get("content", "")
            if content:
                name = link.get("original_url", "Link")[:60]
                excerpt = content[:2000] + ("..." if len(content) > 2000 else "")
                doc_content_section += f"\n\n--- Link: {name} ---\n{excerpt}"

    # Build user message: include attachment summary and document content for guidance
    if attachment_info:
        user_content = f"{user_message}\n\n[Attachments: {'; '.join(attachment_info)}]"
    else:
        user_content = user_message
    if doc_content_section:
        user_content += f"\n\n## Attached content (use this in your guidance):{doc_content_section}"
    messages.append({"role": "user", "content": user_content})
    
    response = await query_model(PROMPT_ENGINEERING_MODEL, messages, timeout=60.0)
    if response is None:
        return None
    
    return response.get("content", "")
