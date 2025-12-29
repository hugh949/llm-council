"""JSON-based storage for conversations."""

import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
from .config import DATA_DIR


def ensure_data_dir():
    """Ensure the data directory exists."""
    Path(DATA_DIR).mkdir(parents=True, exist_ok=True)


def get_conversation_path(conversation_id: str) -> str:
    """Get the file path for a conversation."""
    return os.path.join(DATA_DIR, f"{conversation_id}.json")


def delete_conversation(conversation_id: str) -> bool:
    """
    Delete a conversation by ID.
    
    Args:
        conversation_id: Unique identifier for the conversation
        
    Returns:
        True if deleted successfully, False if not found
    """
    file_path = get_conversation_path(conversation_id)
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False


def create_conversation(conversation_id: str) -> Dict[str, Any]:
    """
    Create a new conversation.

    Args:
        conversation_id: Unique identifier for the conversation

    Returns:
        New conversation dict
    """
    ensure_data_dir()

    conversation = {
        "id": conversation_id,
        "created_at": datetime.utcnow().isoformat(),
        "title": "New Conversation",
        "prompt_engineering": {
            "messages": [],
            "finalized_prompt": None
        },
        "context_engineering": {
            "messages": [],
            "documents": [],
            "files": [],
            "links": [],
            "finalized_context": None
        },
        "council_deliberation": {
            "messages": []
        }
    }

    # Save to file
    path = get_conversation_path(conversation_id)
    with open(path, 'w') as f:
        json.dump(conversation, f, indent=2)

    return conversation


def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """
    Load a conversation from storage.

    Args:
        conversation_id: Unique identifier for the conversation

    Returns:
        Conversation dict or None if not found
    """
    path = get_conversation_path(conversation_id)

    if not os.path.exists(path):
        return None

    with open(path, 'r') as f:
        conversation = json.load(f)
    
    # Ensure conversation has new structure (backward compatibility)
    if "prompt_engineering" not in conversation:
        conversation["prompt_engineering"] = {
            "messages": [],
            "finalized_prompt": None
        }
    if "context_engineering" not in conversation:
        conversation["context_engineering"] = {
            "messages": [],
            "documents": [],
            "files": [],
            "links": [],
            "finalized_context": None
        }
    else:
        # Ensure files and links arrays exist in existing context_engineering
        if "files" not in conversation["context_engineering"]:
            conversation["context_engineering"]["files"] = []
        if "links" not in conversation["context_engineering"]:
            conversation["context_engineering"]["links"] = []
    if "council_deliberation" not in conversation:
        # Migrate old messages to council_deliberation
        old_messages = conversation.get("messages", [])
        conversation["council_deliberation"] = {
            "messages": old_messages
        }
        # Keep messages for backward compatibility but prefer council_deliberation
    
    return conversation


def save_conversation(conversation: Dict[str, Any]):
    """
    Save a conversation to storage.

    Args:
        conversation: Conversation dict to save
    """
    ensure_data_dir()

    path = get_conversation_path(conversation['id'])
    with open(path, 'w') as f:
        json.dump(conversation, f, indent=2)


def list_conversations() -> List[Dict[str, Any]]:
    """
    List all conversations (metadata only).

    Returns:
        List of conversation metadata dicts
    """
    ensure_data_dir()

    conversations = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            path = os.path.join(DATA_DIR, filename)
            with open(path, 'r') as f:
                data = json.load(f)
                
                # Handle both old and new format
                if "council_deliberation" in data:
                    message_count = len(data.get("council_deliberation", {}).get("messages", []))
                else:
                    message_count = len(data.get("messages", []))
                
                # Return metadata only
                conversations.append({
                    "id": data["id"],
                    "created_at": data["created_at"],
                    "title": data.get("title", "New Conversation"),
                    "message_count": message_count
                })

    # Sort by creation time, newest first
    conversations.sort(key=lambda x: x["created_at"], reverse=True)

    return conversations


def add_prompt_engineering_message(conversation_id: str, role: str, content: str):
    """
    Add a message to the prompt engineering stage.

    Args:
        conversation_id: Conversation identifier
        role: 'user' or 'assistant'
        content: Message content
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    # Ensure prompt_engineering structure exists (for backward compatibility)
    if "prompt_engineering" not in conversation:
        conversation["prompt_engineering"] = {"messages": [], "finalized_prompt": None}

    conversation["prompt_engineering"]["messages"].append({
        "role": role,
        "content": content
    })

    save_conversation(conversation)


def finalize_prompt(conversation_id: str, finalized_prompt: str):
    """
    Finalize the prompt in the prompt engineering stage.

    Args:
        conversation_id: Conversation identifier
        finalized_prompt: The finalized prompt text
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    if "prompt_engineering" not in conversation:
        conversation["prompt_engineering"] = {"messages": [], "finalized_prompt": None}

    conversation["prompt_engineering"]["finalized_prompt"] = finalized_prompt
    save_conversation(conversation)


def add_context_engineering_message(conversation_id: str, role: str, content: str):
    """
    Add a message to the context engineering stage.

    Args:
        conversation_id: Conversation identifier
        role: 'user' or 'assistant'
        content: Message content
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    # Ensure context_engineering structure exists (for backward compatibility)
    if "context_engineering" not in conversation:
        conversation["context_engineering"] = {"messages": [], "documents": [], "files": [], "links": [], "finalized_context": None}

    conversation["context_engineering"]["messages"].append({
        "role": role,
        "content": content
    })

    save_conversation(conversation)


def add_document(conversation_id: str, document_name: str, document_content: str):
    """
    Add a text document to the context engineering stage.

    Args:
        conversation_id: Conversation identifier
        document_name: Name of the document
        document_content: Content of the document
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    if "context_engineering" not in conversation:
        conversation["context_engineering"] = {"messages": [], "documents": [], "files": [], "links": [], "finalized_context": None}

    conversation["context_engineering"]["documents"].append({
        "type": "text",
        "name": document_name,
        "content": document_content
    })

    save_conversation(conversation)


def add_file(conversation_id: str, file_data: Dict[str, Any]):
    """
    Add a file (PDF, Word, Excel, PowerPoint) to the context engineering stage.

    Args:
        conversation_id: Conversation identifier
        file_data: Dict with type, name, content, and optional metadata
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    if "context_engineering" not in conversation:
        conversation["context_engineering"] = {"messages": [], "documents": [], "files": [], "links": [], "finalized_context": None}

    conversation["context_engineering"]["files"].append(file_data)
    save_conversation(conversation)


def add_link(conversation_id: str, link_data: Dict[str, Any]):
    """
    Add a URL link to the context engineering stage.

    Args:
        conversation_id: Conversation identifier
        link_data: Dict with type, name (url), content, original_url
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    if "context_engineering" not in conversation:
        conversation["context_engineering"] = {"messages": [], "documents": [], "files": [], "links": [], "finalized_context": None}

    conversation["context_engineering"]["links"].append(link_data)
    save_conversation(conversation)


def finalize_context(conversation_id: str, finalized_context: str):
    """
    Finalize the context in the context engineering stage.

    Args:
        conversation_id: Conversation identifier
        finalized_context: The finalized context text
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    if "context_engineering" not in conversation:
        conversation["context_engineering"] = {"messages": [], "documents": [], "files": [], "links": [], "finalized_context": None}

    conversation["context_engineering"]["finalized_context"] = finalized_context
    save_conversation(conversation)


def add_council_deliberation_message(
    conversation_id: str,
    role: str,
    content: str = None,
    stage1: List[Dict[str, Any]] = None,
    stage2: List[Dict[str, Any]] = None,
    stage3: Dict[str, Any] = None
):
    """
    Add a message to the council deliberation stage.

    Args:
        conversation_id: Conversation identifier
        role: 'user' or 'assistant'
        content: Message content (for user messages)
        stage1: List of individual model responses (for assistant messages)
        stage2: List of model rankings (for assistant messages)
        stage3: Final synthesized response (for assistant messages)
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")
    
    # Ensure council_deliberation structure exists (for backward compatibility)
    if "council_deliberation" not in conversation:
        conversation["council_deliberation"] = {"messages": []}

    if role == "user":
        conversation["council_deliberation"]["messages"].append({
            "role": "user",
            "content": content
        })
    else:  # assistant
        message = {
            "role": "assistant",
            "stage1": stage1,
            "stage2": stage2,
            "stage3": stage3
        }
        conversation["council_deliberation"]["messages"].append(message)

    save_conversation(conversation)


# Legacy functions for backward compatibility
def add_user_message(conversation_id: str, content: str):
    """
    Legacy function - redirects to council_deliberation for backward compatibility.
    """
    add_council_deliberation_message(conversation_id, "user", content=content)


def add_assistant_message(
    conversation_id: str,
    stage1: List[Dict[str, Any]],
    stage2: List[Dict[str, Any]],
    stage3: Dict[str, Any]
):
    """
    Legacy function - redirects to council_deliberation for backward compatibility.
    """
    add_council_deliberation_message(conversation_id, "assistant", stage1=stage1, stage2=stage2, stage3=stage3)


def update_conversation_title(conversation_id: str, title: str):
    """
    Update the title of a conversation.

    Args:
        conversation_id: Conversation identifier
        title: New title for the conversation
    """
    conversation = get_conversation(conversation_id)
    if conversation is None:
        raise ValueError(f"Conversation {conversation_id} not found")

    conversation["title"] = title
    save_conversation(conversation)
