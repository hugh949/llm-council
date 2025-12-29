"""Migration script to move JSON conversations to database."""

import json
import os
from datetime import datetime
from pathlib import Path
from .database import init_db, Conversation
from .config import DATA_DIR


def migrate_json_to_database():
    """Migrate existing JSON conversations to database."""
    print("Starting migration from JSON to database...")
    
    # Initialize database
    init_db()
    from .database import get_session
    
    db = get_session()
    
    try:
        # Check if data directory exists
        if not os.path.exists(DATA_DIR):
            print(f"Data directory {DATA_DIR} does not exist. No migration needed.")
            return
        
        migrated_count = 0
        skipped_count = 0
        
        # Read all JSON files
        for filename in os.listdir(DATA_DIR):
            if not filename.endswith('.json'):
                continue
            
            conversation_id = filename[:-5]  # Remove .json extension
            file_path = os.path.join(DATA_DIR, filename)
            
            # Check if already in database
            existing = db.query(Conversation).filter(Conversation.id == conversation_id).first()
            if existing:
                print(f"Skipping {conversation_id} (already in database)")
                skipped_count += 1
                continue
            
            # Read JSON file
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # Parse created_at datetime
                created_at_str = data.get("created_at")
                if isinstance(created_at_str, str):
                    try:
                        created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                    except:
                        created_at = datetime.utcnow()
                elif isinstance(created_at_str, datetime):
                    created_at = created_at_str
                else:
                    created_at = datetime.utcnow()
                
                # Create database record
                conversation = Conversation(
                    id=data.get("id", conversation_id),
                    created_at=created_at,
                    title=data.get("title", "New Conversation"),
                    prompt_engineering=data.get("prompt_engineering", {}),
                    context_engineering=data.get("context_engineering", {}),
                    council_deliberation=data.get("council_deliberation", {}),
                    messages=data.get("messages", [])  # For backward compatibility
                )
                
                db.add(conversation)
                migrated_count += 1
                print(f"Migrated {conversation_id}")
                
            except Exception as e:
                print(f"Error migrating {conversation_id}: {e}")
        
        db.commit()
        print(f"\nMigration complete!")
        print(f"Migrated: {migrated_count} conversations")
        print(f"Skipped: {skipped_count} conversations (already in database)")
        
    finally:
        db.close()


if __name__ == "__main__":
    migrate_json_to_database()

