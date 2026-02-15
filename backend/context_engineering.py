"""Context Engineering stage - helps user attach documents and build context."""

from typing import List, Dict, Any, Optional
from .openrouter import query_model
from .config import CONTEXT_ENGINEERING_MODEL
from .rag_system import retrieve_relevant_chunks, format_retrieved_chunks


async def get_context_engineering_response(
    conversation_history: List[Dict[str, str]],
    user_message: str,
    documents: List[Dict[str, Any]],
    files: List[Dict[str, Any]] = None,
    links: List[Dict[str, Any]] = None
) -> Optional[str]:
    """
    Get a response from the context engineering assistant.
    
    Args:
        conversation_history: Previous messages in the context engineering conversation
        user_message: The user's current message
        documents: List of documents with 'name' and 'content' keys
        
    Returns:
        Assistant's response text, or None if failed
    """
    # Build system message for context engineering
    system_message = """You are a context engineering assistant. Your role is to help the user attach relevant documents and build comprehensive context for their LLM prompt.

Your approach should be:
1. Understand what context and background information would be useful
2. Guide the user on what types of documents to attach (e.g., reference materials, guidelines, examples, constraints)
3. Help them organize and structure the context information
4. Identify any limitations, guardrails, or constraints that should be included
5. Package the context so it's ready to be used with the prompt

Be conversational and helpful. Ask about relevant documents, guidelines, constraints, or background information that would help the LLMs provide better responses. Once the context is comprehensive, suggest finalizing it."""

    # Build message history
    messages = [{"role": "system", "content": system_message}]
    
    # Add conversation history (skip system message if present)
    for msg in conversation_history:
        if msg.get("role") != "system":
            messages.append(msg)
    
    # Handle None defaults
    if files is None:
        files = []
    if links is None:
        links = []
    
    # Add document/file/link information if available
    attachment_info = []
    if documents:
        attachment_info.append(f"Text Documents: {len(documents)}")
    if files:
        attachment_info.append(f"Uploaded Files: {len(files)}")
    if links:
        attachment_info.append(f"External Links: {len(links)}")
    
    if attachment_info:
        info_text = f"\n\nCurrently attached: {', '.join(attachment_info)}"
        messages.append({"role": "assistant", "content": info_text})
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    # Query the context engineering model
    response = await query_model(CONTEXT_ENGINEERING_MODEL, messages, timeout=60.0)
    
    if response is None:
        return None
    
    return response.get('content', '')


def get_refinement_opening(prior_context_summary: str = "") -> str:
    """
    Return the assistant's opening message for a refinement round.
    Acknowledges prior context and asks for additional information.
    """
    base = (
        "This is a refinement round. Your prior context and attachments are already loaded. "
        "What additional documents, links, or information would you like to add?"
    )
    if prior_context_summary:
        return f"{base}\n\n*Prior context summary:* {prior_context_summary[:300]}{'...' if len(prior_context_summary) > 300 else ''}"
    return base


async def package_context(
    conversation_history: List[Dict[str, str]],
    documents: List[Dict[str, Any]],
    files: List[Dict[str, Any]],
    links: List[Dict[str, Any]],
    finalized_prompt: str,
    use_rag: bool = True
) -> Optional[str]:
    """
    Package the context information for use with the council deliberation.
    
    Uses RAG (Retrieval-Augmented Generation) to intelligently retrieve only the most
    relevant chunks from attachments, rather than including everything.
    
    Order of priority (from highest to lowest):
    1. Prompt (primary question)
    2. Manually typed context from preparation chat (user messages)
    3. Retrieved relevant chunks from attachments (via RAG) - if use_rag=True
    4. All attachments (documents and files) - if use_rag=False
    5. External links
    
    Args:
        conversation_history: The full context engineering conversation
        documents: List of text documents
        files: List of parsed files (PDF, Word, Excel, PowerPoint)
        links: List of URL content
        finalized_prompt: The finalized prompt from preparation
        use_rag: Whether to use RAG for intelligent chunk retrieval (default: True)
        
    Returns:
        Packaged context text ready for council deliberation, or None if failed
    """
    # Extract manually typed context from user messages in conversation history
    # This is the highest priority context after the prompt
    manual_context_section = ""
    if conversation_history:
        user_messages = [
            msg['content'] 
            for msg in conversation_history 
            if msg.get("role") == "user" and msg.get("content", "").strip()
        ]
        
        if user_messages:
            manual_context_text = "\n\n".join(user_messages)
            manual_context_section = f"""
---

## MANUALLY PROVIDED CONTEXT (Preparation Chat)

The following context was manually provided during the preparation conversation:

{manual_context_text}
"""
    
    # Build text documents section
    documents_section = ""
    if documents:
        documents_section = "\n\n---\n\n## ATTACHED DOCUMENTS\n\n"
        for doc in documents:
            documents_section += f"### {doc.get('name', 'Untitled')}\n\n"
            documents_section += f"{doc.get('content', '')}\n\n"
    
    # Build files section
    files_section = ""
    if files:
        if documents_section:
            files_section = "\n\n"
        else:
            files_section = "\n\n---\n\n"
        files_section += "## UPLOADED FILES\n\n"
        for file_data in files:
            file_type = file_data.get('type', 'unknown')
            file_name = file_data.get('name', 'Untitled')
            file_content = file_data.get('content', '')
            
            files_section += f"### {file_name} ({file_type.upper()})\n\n"
            
            # Add metadata if available
            if 'page_count' in file_data:
                files_section += f"*Pages: {file_data['page_count']}*\n\n"
            elif 'slide_count' in file_data:
                files_section += f"*Slides: {file_data['slide_count']}*\n\n"
            
            files_section += f"{file_content}\n\n"
            
            # Add error notice if there was a parsing error
            if 'error' in file_data:
                files_section += f"*Note: There was an error parsing this file: {file_data['error']}*\n\n"
    
    # Build links section
    links_section = ""
    if links:
        if documents_section or files_section:
            links_section = "\n\n---\n\n"
        else:
            links_section = "\n\n---\n\n"
        links_section += "## EXTERNAL LINKS\n\n"
        for link_data in links:
            url = link_data.get('original_url', link_data.get('name', 'Unknown URL'))
            link_content = link_data.get('content', '')
            
            links_section += f"### {url}\n\n"
            links_section += f"{link_content}\n\n"
            
            # Add error notice if there was a fetching error
            if 'error' in link_data:
                links_section += f"*Note: There was an error fetching this URL: {link_data['error']}*\n\n"
    
    # Combine everything in priority order:
    # 1. Prompt (highest priority)
    # 2. Manual context from preparation chat
    # 3. Attachments (documents + files)
    # 4. External links (lowest priority)
    
    # Use RAG to retrieve relevant chunks if enabled and we have attachments
    rag_section = ""
    has_rag_chunks = False
    
    if use_rag and (documents or files or links):
        try:
            # Extract the core query from the finalized prompt (first few sentences)
            query = finalized_prompt.split('\n')[0][:500]  # Use first sentence/line as query
            
            # Retrieve relevant chunks (using fast keyword-based scoring by default)
            # Set use_llm_scoring=True for more accurate but slower retrieval
            relevant_chunks = await retrieve_relevant_chunks(
                query=query,
                documents=documents,
                files=files,
                links=links,
                top_k=15,  # Get top 15 most relevant chunks
                relevance_threshold=0.3,  # Only include chunks with >30% relevance
                use_llm_scoring=False  # Use fast keyword matching (set to True for LLM-based scoring)
            )
            
            if relevant_chunks:
                rag_section = format_retrieved_chunks(relevant_chunks)
                has_rag_chunks = True
                
                # Note: We'll use RAG chunks instead of full documents/files sections
                # But still include links section as-is since they're typically smaller
        except Exception as e:
            print(f"RAG retrieval failed, falling back to full content: {e}")
            # Fall back to including full content if RAG fails
    
    # Build instructions based on what's available
    has_manual_context = bool(manual_context_section)
    has_attachments = bool(documents_section or files_section) or has_rag_chunks
    has_links = bool(links_section)
    
    instructions_list = ["1. **Prompt** (above) - This is the primary question or task to address"]
    priority_num = 2
    
    if has_manual_context:
        instructions_list.append(f"{priority_num}. **Manually provided context** - Direct instructions and context from the user")
        priority_num += 1
    
    if has_rag_chunks:
        instructions_list.append(f"{priority_num}. **Retrieved relevant chunks (RAG)** - Most relevant portions extracted from attachments using intelligent retrieval")
        priority_num += 1
    elif has_attachments:
        instructions_list.append(f"{priority_num}. **Attached documents and files** - Reference materials and supporting documents")
        priority_num += 1
    
    if has_links:
        instructions_list.append(f"{priority_num}. **External links** - Additional context from web sources")
    
    instructions_text = "\n".join(instructions_list)
    
    # If no additional context, add a note
    if not has_manual_context and not has_attachments and not has_links:
        instructions_text += "\n\n*Note: No additional context was provided beyond the prompt. Please address the prompt directly.*"
    
    # Choose which sections to include based on RAG
    if has_rag_chunks:
        # Use RAG chunks instead of full documents/files
        attachments_section = rag_section
    else:
        # Use full documents and files sections
        attachments_section = documents_section + files_section
    
    packaged_context = f"""# COUNCIL DELIBERATION REQUEST

## PROMPT TO ADDRESS

{finalized_prompt}{manual_context_section}{attachments_section}{links_section}

---

## INSTRUCTIONS FOR COUNCIL DELIBERATION

Please address the prompt above using the context provided. Consider the information in the following priority order:

{instructions_text}

Use all available context to provide a comprehensive and well-informed response."""

    return packaged_context

