"""Database-based storage for conversations using SQLAlchemy."""

from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from .database import Conversation, get_db, get_session, init_db


def _ensure_conversation_structure(conversation: Conversation) -> Dict[str, Any]:
    """Ensure conversation has the correct structure (backward compatibility)."""
    chain_id = getattr(conversation, "chain_id", None) or conversation.id
    parent_id = getattr(conversation, "parent_id", None)
    round_number = getattr(conversation, "round_number", None) or 1
    prior_synthesis = getattr(conversation, "prior_synthesis", None)
    data = {
        "id": conversation.id,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else datetime.utcnow().isoformat(),
        "title": conversation.title or "New Conversation",
        "chain_id": chain_id,
        "parent_id": parent_id,
        "round_number": round_number,
        "prior_synthesis": prior_synthesis,
    }
    
    # Get JSON fields with defaults - always ensure they exist
    prompt_eng = conversation.prompt_engineering if conversation.prompt_engineering is not None else {}
    context_eng = conversation.context_engineering if conversation.context_engineering is not None else {}
    council_delib = conversation.council_deliberation if conversation.council_deliberation is not None else {}
    
    # Ensure structure for prompt_engineering
    if not isinstance(prompt_eng, dict):
        prompt_eng = {}
    if "messages" not in prompt_eng:
        prompt_eng["messages"] = []
    if "finalized_prompt" not in prompt_eng:
        prompt_eng["finalized_prompt"] = None
    
    # Ensure structure for context_engineering - always initialize even if empty
    if not isinstance(context_eng, dict):
        context_eng = {}
    if "messages" not in context_eng:
        context_eng["messages"] = []
    if "documents" not in context_eng:
        context_eng["documents"] = []
    if "files" not in context_eng:
        context_eng["files"] = []
    if "links" not in context_eng:
        context_eng["links"] = []
    if "finalized_context" not in context_eng:
        context_eng["finalized_context"] = None
    
    # Ensure structure for council_deliberation
    if not isinstance(council_delib, dict):
        council_delib = {}
    if "messages" not in council_delib:
        # Try to migrate from old messages field
        old_messages = conversation.messages or []
        council_delib["messages"] = old_messages if isinstance(old_messages, list) else []
    
    data["prompt_engineering"] = prompt_eng
    data["context_engineering"] = context_eng
    data["council_deliberation"] = council_delib
    
    return data


def create_conversation(
    conversation_id: str,
    chain_id: Optional[str] = None,
    parent_id: Optional[str] = None,
    round_number: int = 1,
    prior_synthesis: Optional[str] = None,
    title: Optional[str] = None,
    prompt_engineering: Optional[Dict[str, Any]] = None,
    context_engineering: Optional[Dict[str, Any]] = None,
    council_deliberation: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create a new conversation."""
    init_db()

    if chain_id is None:
        chain_id = conversation_id

    prompt_eng = prompt_engineering or {"messages": [], "finalized_prompt": None}
    context_eng = context_engineering or {
        "messages": [],
        "documents": [],
        "files": [],
        "links": [],
        "finalized_context": None,
    }
    council_delib = council_deliberation or {"messages": []}

    db = get_session()
    try:
        conversation = Conversation(
            id=conversation_id,
            created_at=datetime.utcnow(),
            title=title or "New Conversation",
            chain_id=chain_id,
            parent_id=parent_id,
            round_number=round_number,
            prior_synthesis=prior_synthesis,
            prompt_engineering=prompt_eng,
            context_engineering=context_eng,
            council_deliberation=council_delib,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return _ensure_conversation_structure(conversation)
    finally:
        db.close()


def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get a conversation by ID."""
    init_db()
    
    db = get_session()
    try:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            # Log for debugging in Azure
            import os
            if os.path.exists("/home/site/wwwroot"):
                import sys
                print(f"⚠️ Conversation {conversation_id} not found in database", file=sys.stderr, flush=True)
            return None
        return _ensure_conversation_structure(conversation)
    finally:
        db.close()


def save_conversation(conversation: Dict[str, Any]):
    """Save/update a conversation."""
    init_db()
    
    db = get_session()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conversation["id"]).first()
        
        if conv:
            # Update existing
            conv.title = conversation.get("title", conv.title)
            if "chain_id" in conversation:
                conv.chain_id = conversation["chain_id"]
            if "parent_id" in conversation:
                conv.parent_id = conversation["parent_id"]
            if "round_number" in conversation:
                conv.round_number = conversation["round_number"]
            if "prior_synthesis" in conversation:
                conv.prior_synthesis = conversation["prior_synthesis"]
            conv.prompt_engineering = conversation.get("prompt_engineering", conv.prompt_engineering or {})
            conv.context_engineering = conversation.get("context_engineering", conv.context_engineering or {})
            conv.council_deliberation = conversation.get("council_deliberation", conv.council_deliberation or {})
        else:
            # Create new
            conv = Conversation(
                id=conversation["id"],
                created_at=datetime.fromisoformat(conversation.get("created_at", datetime.utcnow().isoformat())),
                title=conversation.get("title", "New Conversation"),
                chain_id=conversation.get("chain_id", conversation["id"]),
                parent_id=conversation.get("parent_id"),
                round_number=conversation.get("round_number", 1),
                prior_synthesis=conversation.get("prior_synthesis"),
                prompt_engineering=conversation.get("prompt_engineering", {}),
                context_engineering=conversation.get("context_engineering", {}),
                council_deliberation=conversation.get("council_deliberation", {}),
            )
            db.add(conv)
        
        db.commit()
    finally:
        db.close()


def list_conversations() -> List[Dict[str, Any]]:
    """List all conversations (metadata only)."""
    init_db()
    
    db = get_session()
    try:
        conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).all()
        
        result = []
        for conv in conversations:
            # Count messages
            council_delib = conv.council_deliberation or {}
            message_count = len(council_delib.get("messages", []))
            
            chain_id = conv.chain_id if conv.chain_id else conv.id
            result.append({
                "id": conv.id,
                "created_at": conv.created_at.isoformat() if conv.created_at else datetime.utcnow().isoformat(),
                "title": conv.title or "New Conversation",
                "message_count": message_count,
                "chain_id": chain_id,
                "parent_id": conv.parent_id,
                "round_number": conv.round_number or 1,
            })
        
        return result
    finally:
        db.close()


def delete_conversation(conversation_id: str) -> bool:
    """Delete a conversation."""
    init_db()
    
    db = get_session()
    try:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conversation:
            db.delete(conversation)
            db.commit()
            return True
        return False
    finally:
        db.close()


# All the message and data manipulation functions
def add_prompt_engineering_message(conversation_id: str, role: str, content: str):
    """Add a message to prompt engineering."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    prompt_eng = conv.get("prompt_engineering", {})
    messages = prompt_eng.get("messages", [])
    messages.append({"role": role, "content": content})
    prompt_eng["messages"] = messages
    conv["prompt_engineering"] = prompt_eng
    save_conversation(conv)


def finalize_prompt(conversation_id: str, finalized_prompt: str):
    """Finalize the prompt."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    prompt_eng = conv.get("prompt_engineering", {})
    prompt_eng["finalized_prompt"] = finalized_prompt
    conv["prompt_engineering"] = prompt_eng
    save_conversation(conv)


def add_context_engineering_message(conversation_id: str, role: str, content: str):
    """Add a message to context engineering."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    context_eng = conv.get("context_engineering", {})
    messages = context_eng.get("messages", [])
    messages.append({"role": role, "content": content})
    context_eng["messages"] = messages
    conv["context_engineering"] = context_eng
    save_conversation(conv)


def add_document(conversation_id: str, document_name: str, document_content: str):
    """Add a document to context engineering."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    context_eng = conv.get("context_engineering", {})
    documents = context_eng.get("documents", [])
    documents.append({
        "type": "text",
        "name": document_name,
        "content": document_content
    })
    context_eng["documents"] = documents
    conv["context_engineering"] = context_eng
    save_conversation(conv)


def add_file(conversation_id: str, file_data: Dict[str, Any]):
    """Add a file to context engineering."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    context_eng = conv.get("context_engineering", {})
    files = context_eng.get("files", [])
    files.append(file_data)
    context_eng["files"] = files
    conv["context_engineering"] = context_eng
    save_conversation(conv)


def add_link(conversation_id: str, link_data: Dict[str, Any]):
    """Add a link to context engineering."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    context_eng = conv.get("context_engineering", {})
    links = context_eng.get("links", [])
    links.append(link_data)
    context_eng["links"] = links
    conv["context_engineering"] = context_eng
    save_conversation(conv)


def finalize_context(conversation_id: str, finalized_context: str):
    """Finalize the context."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    context_eng = conv.get("context_engineering", {})
    context_eng["finalized_context"] = finalized_context
    conv["context_engineering"] = context_eng
    save_conversation(conv)


def update_conversation_title(conversation_id: str, title: str):
    """Update conversation title."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    conv["title"] = title
    save_conversation(conv)


def add_council_deliberation_message(
    conversation_id: str,
    role: str,
    content: str = None,
    stage1: List[Dict[str, Any]] = None,
    stage2: List[Dict[str, Any]] = None,
    stage3: Dict[str, Any] = None,
    metadata: Dict[str, Any] = None
):
    """Add a message to council deliberation."""
    conv = get_conversation(conversation_id)
    if not conv:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    council_delib = conv.get("council_deliberation", {})
    messages = council_delib.get("messages", [])
    
    message = {"role": role}
    if content:
        message["content"] = content
    if stage1 is not None:
        message["stage1"] = stage1
    if stage2 is not None:
        message["stage2"] = stage2
    if stage3 is not None:
        message["stage3"] = stage3
    if metadata is not None:
        message["metadata"] = metadata
    
    messages.append(message)
    council_delib["messages"] = messages
    conv["council_deliberation"] = council_delib
    save_conversation(conv)

