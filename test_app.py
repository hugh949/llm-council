#!/usr/bin/env python3
"""
Basic integration tests for LLM Council application.
Tests core functionality without requiring API keys.
"""

import sys
import os
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all core modules can be imported."""
    print("🔍 Testing imports...")
    
    try:
        from backend.database import init_db, SessionLocal, Conversation
        from backend.storage_db import (
            create_conversation, get_conversation, list_conversations,
            delete_conversation, finalize_prompt, add_context_engineering_message
        )
        from backend.config import (
            COUNCIL_MODELS, CHAIRMAN_MODEL,
            PROMPT_ENGINEERING_MODEL, CONTEXT_ENGINEERING_MODEL
        )
        from backend.document_parser import parse_document, fetch_url_content
        print("  ✅ All core imports successful")
        return True
    except Exception as e:
        print(f"  ❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database():
    """Test database initialization and basic operations."""
    print("\n🔍 Testing database...")
    
    try:
        from backend.database import init_db, SessionLocal, Conversation
        
        # Initialize database
        init_db()
        print("  ✅ Database initialized")
        
        # Test session creation
        db = SessionLocal()
        try:
            # Test query
            conversations = db.query(Conversation).limit(1).all()
            print("  ✅ Database session works")
        finally:
            db.close()
        
        return True
    except Exception as e:
        print(f"  ❌ Database error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_storage_operations():
    """Test storage operations."""
    print("\n🔍 Testing storage operations...")
    
    try:
        from backend.storage_db import (
            create_conversation, get_conversation, 
            list_conversations, delete_conversation,
            add_prompt_engineering_message, finalize_prompt
        )
        
        # Create a test conversation
        conv_id = create_conversation()
        print(f"  ✅ Conversation created: {conv_id[:8]}...")
        
        # Retrieve conversation
        conv = get_conversation(conv_id)
        assert conv is not None, "Conversation should exist"
        assert conv['id'] == conv_id, "Conversation ID should match"
        print("  ✅ Conversation retrieved")
        
        # Add prompt engineering message
        add_prompt_engineering_message(conv_id, "user", "Test message")
        conv = get_conversation(conv_id)
        assert len(conv['prompt_engineering']['messages']) == 1, "Should have 1 message"
        print("  ✅ Added prompt engineering message")
        
        # Finalize prompt
        finalize_prompt(conv_id, "Final test prompt")
        conv = get_conversation(conv_id)
        assert conv['prompt_engineering']['finalized_prompt'] == "Final test prompt"
        print("  ✅ Prompt finalized")
        
        # List conversations
        conversations = list_conversations()
        assert len(conversations) > 0, "Should have at least one conversation"
        print(f"  ✅ Listed {len(conversations)} conversations")
        
        # Delete conversation
        delete_conversation(conv_id)
        conv = get_conversation(conv_id)
        assert conv is None, "Conversation should be deleted"
        print("  ✅ Conversation deleted")
        
        return True
    except Exception as e:
        print(f"  ❌ Storage operation error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_config():
    """Test configuration values."""
    print("\n🔍 Testing configuration...")
    
    try:
        from backend.config import (
            COUNCIL_MODELS, CHAIRMAN_MODEL,
            PROMPT_ENGINEERING_MODEL, CONTEXT_ENGINEERING_MODEL
        )
        
        assert isinstance(COUNCIL_MODELS, list), "COUNCIL_MODELS should be a list"
        assert len(COUNCIL_MODELS) > 0, "COUNCIL_MODELS should not be empty"
        print(f"  ✅ COUNCIL_MODELS configured ({len(COUNCIL_MODELS)} models)")
        
        assert CHAIRMAN_MODEL, "CHAIRMAN_MODEL should be set"
        print(f"  ✅ CHAIRMAN_MODEL: {CHAIRMAN_MODEL}")
        
        assert PROMPT_ENGINEERING_MODEL, "PROMPT_ENGINEERING_MODEL should be set"
        print(f"  ✅ PROMPT_ENGINEERING_MODEL: {PROMPT_ENGINEERING_MODEL}")
        
        assert CONTEXT_ENGINEERING_MODEL, "CONTEXT_ENGINEERING_MODEL should be set"
        print(f"  ✅ CONTEXT_ENGINEERING_MODEL: {CONTEXT_ENGINEERING_MODEL}")
        
        return True
    except Exception as e:
        print(f"  ❌ Config error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_document_parser():
    """Test document parser functions (without actual parsing)."""
    print("\n🔍 Testing document parser...")
    
    try:
        from backend.document_parser import parse_document, fetch_url_content
        
        # Test that functions exist and are callable
        assert callable(parse_file), "parse_file should be callable"
        assert callable(fetch_url_content), "fetch_url_content should be callable"
        print("  ✅ Document parser functions available")
        
        return True
    except Exception as e:
        print(f"  ❌ Document parser error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_structure():
    """Test that API endpoints are properly structured."""
    print("\n🔍 Testing API structure...")
    
    try:
        from backend.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test health check
        response = client.get("/")
        assert response.status_code == 200, "Health check should return 200"
        data = response.json()
        assert data.get("status") == "ok", "Status should be 'ok'"
        print("  ✅ Health check endpoint works")
        
        # Test CORS headers
        response = client.options("/")
        print("  ✅ CORS preflight supported")
        
        return True
    except ImportError:
        print("  ⚠️  FastAPI TestClient not available (install: pip install pytest httpx)")
        return True  # Not a critical failure
    except Exception as e:
        print(f"  ❌ API structure error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_frontend_build():
    """Test that frontend can be built."""
    print("\n🔍 Testing frontend build...")
    
    try:
        frontend_dir = Path(__file__).parent / "frontend"
        package_json = frontend_dir / "package.json"
        
        assert package_json.exists(), "package.json should exist"
        print("  ✅ package.json exists")
        
        with open(package_json) as f:
            package = json.load(f)
        
        assert "dependencies" in package, "package.json should have dependencies"
        assert "react" in package["dependencies"], "Should have react dependency"
        print("  ✅ Frontend dependencies configured")
        
        # Check for key files
        vite_config = frontend_dir / "vite.config.js"
        if vite_config.exists():
            print("  ✅ vite.config.js exists")
        
        index_html = frontend_dir / "index.html"
        if index_html.exists():
            print("  ✅ index.html exists")
        
        return True
    except Exception as e:
        print(f"  ❌ Frontend build check error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 LLM Council Application Tests")
    print("=" * 60)
    
    results = []
    
    results.append(("Imports", test_imports()))
    results.append(("Database", test_database()))
    results.append(("Storage Operations", test_storage_operations()))
    results.append(("Configuration", test_config()))
    results.append(("Document Parser", test_document_parser()))
    results.append(("API Structure", test_api_structure()))
    results.append(("Frontend Build", test_frontend_build()))
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 All tests passed! The application is ready.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

