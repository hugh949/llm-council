"""FastAPI backend for LLM Council."""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any
from pathlib import Path
import uuid
import json
import asyncio
import os
import subprocess
import shutil
import sys

# Use database storage instead of JSON files
try:
    from . import storage_db as storage
    from .database import init_db
except ImportError:
    # Fallback to JSON storage if database not available
    from . import storage
    init_db = None

from .council import run_full_council, generate_conversation_title, stage1_collect_responses, stage2_collect_rankings, stage3_synthesize_final, calculate_aggregate_rankings
from .prompt_engineering import get_prompt_engineering_response, suggest_finalized_prompt
from .context_engineering import get_context_engineering_response, package_context
from .document_parser import parse_file, fetch_url_content

app = FastAPI(title="LLM Council API")

# Serve static files (frontend) from backend/static directory
# In Azure, files are extracted to /tmp/... so we need to check multiple locations
_base_dir = Path(__file__).parent
_base_parent = _base_dir.parent  # Parent of backend/ (project root)

# Check multiple possible locations where files might be
# 1. backend/static/ (preferred - where we copy files)
# 2. frontend/dist/ (if build happened but copy didn't)
# 3. frontend/ (if files are directly there)
# 4. In wwwroot
# 5. In extracted location
possible_static_dirs = [
    _base_dir / "static",  # backend/static/ (preferred)
    _base_parent / "frontend" / "dist",  # frontend/dist/ (built but not copied)
    _base_parent / "frontend",  # frontend/ (direct)
    Path("/home/site/wwwroot/backend/static"),  # wwwroot location
    Path("/tmp/8de475922a03fff/backend/static"),  # Extracted location
    Path("/tmp/8de475922a03fff/frontend/dist"),  # Extracted frontend/dist
    Path("/tmp/8de475922a03fff/frontend"),  # Extracted frontend
    Path.cwd() / "backend" / "static",  # Current working directory
    Path.cwd() / "frontend" / "dist",  # Current working directory frontend/dist
]

# Find the first location that exists and has index.html
static_dir = None
static_index = None
for possible_dir in possible_static_dirs:
    possible_index = possible_dir / "index.html"
    if possible_index.exists():
        static_dir = possible_dir
        static_index = possible_index
        break

# Fallback to relative path if none found (for local development)
if static_dir is None:
    static_dir = _base_dir / "static"
    static_index = static_dir / "index.html"

# Mount static assets if they exist
if static_dir and static_dir.exists() and (static_dir / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

# Enable CORS - allow all origins (for API access, not needed when serving from same origin)
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_frontend_if_needed():
    """Build frontend if not already built. Runs synchronously before app starts."""
    # Find the app directory
    app_dir = None
    tmp_dir = Path("/tmp")
    
    if tmp_dir.exists():
        # Find directories in /tmp that match the pattern
        extracted_dirs = [d for d in tmp_dir.iterdir() if d.is_dir() and d.name not in ['.', '..']]
        if extracted_dirs:
            extracted_dir = extracted_dirs[0]
            backend_main = extracted_dir / "backend" / "main.py"
            if backend_main.exists():
                app_dir = extracted_dir
    
    # Fallback to wwwroot or current directory
    if app_dir is None:
        wwwroot = Path("/home/site/wwwroot")
        if (wwwroot / "backend" / "main.py").exists():
            app_dir = wwwroot
        else:
            app_dir = _base_parent
    
    backend_static = app_dir / "backend" / "static" / "index.html"
    frontend_dir = app_dir / "frontend"
    frontend_dist = app_dir / "frontend" / "dist"
    
    # Only build if frontend is not already built
    if backend_static.exists():
        print("✅ Frontend already built, skipping build step...", file=sys.stderr, flush=True)
        return
    
    print("🔨 Building frontend...", file=sys.stderr, flush=True)
    
    if not frontend_dir.exists():
        print(f"⚠️  Frontend directory not found at {frontend_dir}, skipping build", file=sys.stderr, flush=True)
        return
    
    # Check if Node.js is available
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, timeout=5)
        print(f"✅ Node.js version: {result.stdout.strip()}", file=sys.stderr, flush=True)
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("⚠️  Node.js not found. Frontend build skipped. Install Node.js extension in Azure.", file=sys.stderr, flush=True)
        return
    
    # Run npm install
    print("📦 Running npm install...", file=sys.stderr, flush=True)
    try:
        result = subprocess.run(
            ["npm", "install"],
            cwd=str(frontend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=300
        )
        if result.returncode != 0:
            print(f"⚠️  npm install failed: {result.stdout[:500]}", file=sys.stderr, flush=True)
            return
        print("✅ npm install completed", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"⚠️  npm install error: {e}", file=sys.stderr, flush=True)
        return
    
    # Run npm run build
    print("🔨 Running npm run build...", file=sys.stderr, flush=True)
    try:
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=str(frontend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=300
        )
        if result.returncode != 0:
            print(f"⚠️  npm run build failed: {result.stdout[:500]}", file=sys.stderr, flush=True)
            return
        print("✅ npm run build completed", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"⚠️  npm run build error: {e}", file=sys.stderr, flush=True)
        return
    
    # Copy files to backend/static
    if not frontend_dist.exists():
        print(f"⚠️  frontend/dist not created after build", file=sys.stderr, flush=True)
        return
    
    print("📦 Copying frontend build to backend/static...", file=sys.stderr, flush=True)
    try:
        backend_static_dir = app_dir / "backend" / "static"
        backend_static_dir.mkdir(parents=True, exist_ok=True)
        
        # Remove existing files
        if backend_static_dir.exists():
            for item in backend_static_dir.iterdir():
                if item.is_dir():
                    shutil.rmtree(item)
                else:
                    item.unlink()
        
        # Copy files
        for item in frontend_dist.iterdir():
            dest = backend_static_dir / item.name
            if item.is_dir():
                shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)
        
        print("✅ Frontend build complete! Files copied to backend/static/", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"⚠️  Error copying files: {e}", file=sys.stderr, flush=True)


@app.on_event("startup")
async def startup_event():
    """Initialize database and build frontend on startup."""
    # Build frontend first (synchronously)
    build_frontend_if_needed()
    
    # Then initialize database
    if init_db:
        try:
            init_db()
            print("✅ Database initialized successfully", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"⚠️  Database initialization error: {e}", file=sys.stderr, flush=True)
            # Continue anyway - database will be initialized on first use


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation."""
    pass


class SendMessageRequest(BaseModel):
    """Request to send a message in a conversation."""
    content: str


class FinalizePromptRequest(BaseModel):
    """Request to finalize a prompt."""
    finalized_prompt: str


class AddDocumentRequest(BaseModel):
    """Request to add a document."""
    name: str
    content: str


class FinalizeContextRequest(BaseModel):
    """Request to finalize context."""
    finalized_context: str


class AddLinkRequest(BaseModel):
    """Request to add a URL link."""
    url: str


class ConversationMetadata(BaseModel):
    """Conversation metadata for list view."""
    id: str
    created_at: str
    title: str
    message_count: int


class Conversation(BaseModel):
    """Full conversation with all messages."""
    id: str
    created_at: str
    title: str
    messages: List[Dict[str, Any]] = []  # Legacy format
    prompt_engineering: Dict[str, Any] = None
    context_engineering: Dict[str, Any] = None
    council_deliberation: Dict[str, Any] = None


@app.get("/api/")
async def api_root():
    """API root endpoint for health check."""
    return {"status": "ok", "service": "LLM Council API"}


@app.get("/api/conversations", response_model=List[ConversationMetadata])
async def list_conversations():
    """List all conversations (metadata only)."""
    return storage.list_conversations()


@app.post("/api/conversations", response_model=Conversation)
async def create_conversation(request: CreateConversationRequest):
    """Create a new conversation."""
    try:
        conversation_id = str(uuid.uuid4())
        conversation = storage.create_conversation(conversation_id)
        if conversation is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to create conversation in database"
            )
        return conversation
    except Exception as e:
        print(f"Error creating conversation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating conversation: {str(e)}"
        )


@app.get("/api/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation with all its messages."""
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation by ID."""
    success = storage.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted", "id": conversation_id}


# ========== PROMPT ENGINEERING ENDPOINTS ==========

@app.post("/api/conversations/{conversation_id}/prompt-engineering/message")
async def send_prompt_engineering_message(conversation_id: str, request: SendMessageRequest):
    """
    Send a message in the prompt engineering stage.
    """
    try:
        conversation = storage.get_conversation(conversation_id)
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Check if OPENROUTER_API_KEY is set
        from .config import OPENROUTER_API_KEY
        if not OPENROUTER_API_KEY:
            raise HTTPException(
                status_code=500, 
                detail="OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable."
            )
        
        # Get conversation history BEFORE adding user message
        prompt_eng = conversation.get("prompt_engineering", {})
        messages = prompt_eng.get("messages", [])
        
        # Add user message
        storage.add_prompt_engineering_message(conversation_id, "user", request.content)
        
        # Get assistant response (pass the messages list without the user message, as it will be added in the function)
        response = await get_prompt_engineering_response(messages, request.content)
        
        if response is None:
            raise HTTPException(
                status_code=500, 
                detail="Failed to get prompt engineering response. Please check your OpenRouter API key and try again."
            )
        
        # Add assistant message
        storage.add_prompt_engineering_message(conversation_id, "assistant", response)
        
        # Return updated conversation
        updated_conversation = storage.get_conversation(conversation_id)
        return {"response": response, "conversation": updated_conversation}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in send_prompt_engineering_message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/conversations/{conversation_id}/prompt-engineering/suggest-final")
async def suggest_final_prompt(conversation_id: str):
    """
    Suggest a finalized prompt based on the conversation history.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    prompt_eng = conversation.get("prompt_engineering", {})
    messages = prompt_eng.get("messages", [])
    
    suggested_prompt = await suggest_finalized_prompt(messages)
    
    if suggested_prompt is None:
        raise HTTPException(status_code=500, detail="Failed to generate suggested prompt")
    
    return {"suggested_prompt": suggested_prompt}


@app.post("/api/conversations/{conversation_id}/prompt-engineering/finalize")
async def finalize_prompt_endpoint(conversation_id: str, request: FinalizePromptRequest):
    """
    Finalize the prompt in the prompt engineering stage.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    storage.finalize_prompt(conversation_id, request.finalized_prompt)
    
    updated_conversation = storage.get_conversation(conversation_id)
    return {"conversation": updated_conversation}


# ========== CONTEXT ENGINEERING ENDPOINTS ==========

@app.post("/api/conversations/{conversation_id}/context-engineering/message")
async def send_context_engineering_message(conversation_id: str, request: SendMessageRequest):
    """
    Send a message in the context engineering stage.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get conversation history and attachments BEFORE adding user message
    context_eng = conversation.get("context_engineering", {})
    messages = context_eng.get("messages", [])
    documents = context_eng.get("documents", [])
    files = context_eng.get("files", [])
    links = context_eng.get("links", [])
    
    # Add user message
    storage.add_context_engineering_message(conversation_id, "user", request.content)
    
    # Get assistant response (pass the messages list without the user message, as it will be added in the function)
    response = await get_context_engineering_response(messages, request.content, documents, files, links)
    
    if response is None:
        raise HTTPException(status_code=500, detail="Failed to get context engineering response")
    
    # Add assistant message
    storage.add_context_engineering_message(conversation_id, "assistant", response)
    
    # Return updated conversation
    updated_conversation = storage.get_conversation(conversation_id)
    return {"response": response, "conversation": updated_conversation}


@app.post("/api/conversations/{conversation_id}/context-engineering/document")
async def add_document_endpoint(conversation_id: str, request: AddDocumentRequest):
    """
    Add a document to the context engineering stage.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    storage.add_document(conversation_id, request.name, request.content)
    
    updated_conversation = storage.get_conversation(conversation_id)
    return {"conversation": updated_conversation}


@app.post("/api/conversations/{conversation_id}/context-engineering/file")
async def upload_file_endpoint(
    conversation_id: str,
    file: UploadFile = File(...)
):
    """
    Upload and parse a file (PDF, Word, Excel, PowerPoint, etc.) to the context engineering stage.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Read file content
    file_content = await file.read()
    
    # Parse the file
    file_data = await parse_file(file_content, file.filename)
    
    # Add to conversation
    storage.add_file(conversation_id, file_data)
    
    updated_conversation = storage.get_conversation(conversation_id)
    return {"file_data": file_data, "conversation": updated_conversation}


@app.post("/api/conversations/{conversation_id}/context-engineering/link")
async def add_link_endpoint(conversation_id: str, request: AddLinkRequest):
    """
    Fetch and add content from a URL to the context engineering stage.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Fetch URL content
    link_data = await fetch_url_content(request.url)
    
    # Add to conversation
    storage.add_link(conversation_id, link_data)
    
    updated_conversation = storage.get_conversation(conversation_id)
    return {"link_data": link_data, "conversation": updated_conversation}


@app.post("/api/conversations/{conversation_id}/context-engineering/package")
async def package_context_endpoint(conversation_id: str):
    """
    Package the context for council deliberation.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get finalized prompt
    prompt_eng = conversation.get("prompt_engineering", {})
    finalized_prompt = prompt_eng.get("finalized_prompt")
    
    if not finalized_prompt:
        raise HTTPException(status_code=400, detail="Prompt must be finalized before packaging context")
    
    # Get context engineering data
    context_eng = conversation.get("context_engineering", {})
    messages = context_eng.get("messages", [])
    documents = context_eng.get("documents", [])
    files = context_eng.get("files", [])
    links = context_eng.get("links", [])
    
    # Package context
    packaged_context = await package_context(messages, documents, files, links, finalized_prompt)
    
    if packaged_context is None:
        raise HTTPException(status_code=500, detail="Failed to package context")
    
    # Finalize context
    storage.finalize_context(conversation_id, packaged_context)
    
    updated_conversation = storage.get_conversation(conversation_id)
    return {"packaged_context": packaged_context, "conversation": updated_conversation}


@app.post("/api/conversations/{conversation_id}/context-engineering/finalize")
async def finalize_context_endpoint(conversation_id: str, request: FinalizeContextRequest):
    """
    Manually finalize the context in the context engineering stage.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    storage.finalize_context(conversation_id, request.finalized_context)
    
    updated_conversation = storage.get_conversation(conversation_id)
    return {"conversation": updated_conversation}


# ========== COUNCIL DELIBERATION ENDPOINTS ==========


@app.post("/api/conversations/{conversation_id}/council-deliberation/message")
async def send_council_deliberation_message(conversation_id: str):
    """
    Start the council deliberation using finalized prompt and context.
    Returns the complete response with all stages.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get finalized prompt and context
    prompt_eng = conversation.get("prompt_engineering", {})
    context_eng = conversation.get("context_engineering", {})
    
    finalized_prompt = prompt_eng.get("finalized_prompt")
    finalized_context = context_eng.get("finalized_context")
    
    if not finalized_prompt:
        raise HTTPException(status_code=400, detail="Prompt must be finalized before council deliberation")
    
    if not finalized_context:
        raise HTTPException(status_code=400, detail="Context must be finalized before council deliberation")
    
    # Combine prompt and context for the council
    full_query = f"{finalized_context}\n\n---\n\nPlease address the prompt above using the context provided."
    
    # Check if this is the first council message
    council_delib = conversation.get("council_deliberation", {})
    is_first_message = len(council_delib.get("messages", [])) == 0

    # Add user message
    storage.add_council_deliberation_message(conversation_id, "user", content=full_query)

    # If this is the first message, generate a title from the prompt
    if is_first_message:
        title = await generate_conversation_title(finalized_prompt)
        storage.update_conversation_title(conversation_id, title)

    # Run the 3-stage council process
    stage1_results, stage2_results, stage3_result, metadata = await run_full_council(
        full_query
    )

    # Add assistant message with all stages
    storage.add_council_deliberation_message(
        conversation_id,
        "assistant",
        stage1=stage1_results,
        stage2=stage2_results,
        stage3=stage3_result
    )

    # Return the complete response with metadata
    return {
        "stage1": stage1_results,
        "stage2": stage2_results,
        "stage3": stage3_result,
        "metadata": metadata
    }


@app.post("/api/conversations/{conversation_id}/council-deliberation/message/stream")
async def send_council_deliberation_stream(conversation_id: str):
    """
    Start the council deliberation using finalized prompt and context, with streaming.
    Returns Server-Sent Events as each stage completes.
    """
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get finalized prompt and context
    prompt_eng = conversation.get("prompt_engineering", {})
    context_eng = conversation.get("context_engineering", {})
    
    finalized_prompt = prompt_eng.get("finalized_prompt")
    finalized_context = context_eng.get("finalized_context")
    
    if not finalized_prompt:
        raise HTTPException(status_code=400, detail="Prompt must be finalized before council deliberation")
    
    if not finalized_context:
        raise HTTPException(status_code=400, detail="Context must be finalized before council deliberation")
    
    # Combine prompt and context for the council
    full_query = f"{finalized_context}\n\n---\n\nPlease address the prompt above using the context provided."
    
    # Check if this is the first council message
    council_delib = conversation.get("council_deliberation", {})
    is_first_message = len(council_delib.get("messages", [])) == 0

    async def event_generator():
        try:
            # Add user message
            storage.add_council_deliberation_message(conversation_id, "user", content=full_query)

            # Start title generation in parallel (don't await yet)
            title_task = None
            if is_first_message:
                title_task = asyncio.create_task(generate_conversation_title(finalized_prompt))

            # Stage 1: Collect responses
            yield f"data: {json.dumps({'type': 'stage1_start'})}\n\n"
            stage1_results = await stage1_collect_responses(full_query)
            yield f"data: {json.dumps({'type': 'stage1_complete', 'data': stage1_results})}\n\n"

            # Check if Stage 1 failed (no responses)
            if not stage1_results:
                # Return error message instead of continuing
                stage3_result = {
                    "model": "error",
                    "response": "All models failed to respond. Please check your API key and try again."
                }
                stage2_results = []
                label_to_model = {}
                aggregate_rankings = []
                
                # Skip Stage 2 and go directly to Stage 3 with error
                yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
                yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"
            else:
                # Stage 2: Collect rankings
                yield f"data: {json.dumps({'type': 'stage2_start'})}\n\n"
                stage2_results, label_to_model = await stage2_collect_rankings(full_query, stage1_results)
                aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)
                yield f"data: {json.dumps({'type': 'stage2_complete', 'data': stage2_results, 'metadata': {'label_to_model': label_to_model, 'aggregate_rankings': aggregate_rankings}})}\n\n"

                # Stage 3: Synthesize final answer
                yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
                stage3_result = await stage3_synthesize_final(full_query, stage1_results, stage2_results)
                yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"

            # Wait for title generation if it was started
            if title_task:
                title = await title_task
                storage.update_conversation_title(conversation_id, title)
                yield f"data: {json.dumps({'type': 'title_complete', 'data': {'title': title}})}\n\n"

            # Save complete assistant message
            storage.add_council_deliberation_message(
                conversation_id,
                "assistant",
                stage1=stage1_results,
                stage2=stage2_results,
                stage3=stage3_result
            )

            # Send completion event
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.post("/api/conversations/{conversation_id}/message/stream")
async def send_message_stream(conversation_id: str, request: SendMessageRequest):
    """
    Send a message and stream the 3-stage council process.
    Returns Server-Sent Events as each stage completes.
    """
    # Check if conversation exists
    conversation = storage.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Check if this is the first message
    is_first_message = len(conversation["messages"]) == 0

    async def event_generator():
        try:
            # Add user message
            storage.add_user_message(conversation_id, request.content)

            # Start title generation in parallel (don't await yet)
            title_task = None
            if is_first_message:
                title_task = asyncio.create_task(generate_conversation_title(request.content))

            # Stage 1: Collect responses
            yield f"data: {json.dumps({'type': 'stage1_start'})}\n\n"
            stage1_results = await stage1_collect_responses(request.content)
            yield f"data: {json.dumps({'type': 'stage1_complete', 'data': stage1_results})}\n\n"

            # Check if Stage 1 failed (no responses)
            if not stage1_results:
                # Return error message instead of continuing
                stage3_result = {
                    "model": "error",
                    "response": "All models failed to respond. Please check your API key and try again."
                }
                stage2_results = []
                label_to_model = {}
                aggregate_rankings = []
                
                # Skip Stage 2 and go directly to Stage 3 with error
                yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
                yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"
            else:
                # Stage 2: Collect rankings
                yield f"data: {json.dumps({'type': 'stage2_start'})}\n\n"
                stage2_results, label_to_model = await stage2_collect_rankings(request.content, stage1_results)
                aggregate_rankings = calculate_aggregate_rankings(stage2_results, label_to_model)
                yield f"data: {json.dumps({'type': 'stage2_complete', 'data': stage2_results, 'metadata': {'label_to_model': label_to_model, 'aggregate_rankings': aggregate_rankings}})}\n\n"

                # Stage 3: Synthesize final answer
                yield f"data: {json.dumps({'type': 'stage3_start'})}\n\n"
                stage3_result = await stage3_synthesize_final(request.content, stage1_results, stage2_results)
                yield f"data: {json.dumps({'type': 'stage3_complete', 'data': stage3_result})}\n\n"

            # Wait for title generation if it was started
            if title_task:
                title = await title_task
                storage.update_conversation_title(conversation_id, title)
                yield f"data: {json.dumps({'type': 'title_complete', 'data': {'title': title}})}\n\n"

            # Save complete assistant message
            storage.add_assistant_message(
                conversation_id,
                stage1_results,
                stage2_results,
                stage3_result
            )

            # Send completion event
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"

        except Exception as e:
            # Send error event
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


# ========== STATIC FILE SERVING (Must be last to not interfere with API routes) ==========

@app.get("/")
async def serve_index():
    """Serve the React app index page."""
    import sys
    # Use stderr for logging (shows in Azure logs)
    sys.stderr.write(f"🔍 Checking for static files...\n")
    sys.stderr.write(f"   __file__: {__file__}\n")
    sys.stderr.write(f"   static_dir: {static_dir}\n")
    sys.stderr.write(f"   static_dir.exists(): {static_dir.exists() if static_dir else False}\n")
    sys.stderr.write(f"   static_index: {static_index}\n")
    sys.stderr.write(f"   static_index.exists(): {static_index.exists() if static_index else False}\n")
    sys.stderr.flush()
    
    # Check all possible locations dynamically
    check_paths = [
        static_index,  # Pre-detected location
        _base_dir / "static" / "index.html",  # backend/static/
        _base_parent / "frontend" / "dist" / "index.html",  # frontend/dist/
        _base_parent / "frontend" / "index.html",  # frontend/
        Path("/home/site/wwwroot/backend/static/index.html"),  # wwwroot
        Path("/tmp/8de475922a03fff/backend/static/index.html"),  # Extracted backend/static
        Path("/tmp/8de475922a03fff/frontend/dist/index.html"),  # Extracted frontend/dist
        Path("/tmp/8de475922a03fff/frontend/index.html"),  # Extracted frontend
        Path.cwd() / "backend" / "static" / "index.html",  # Current directory backend
        Path.cwd() / "frontend" / "dist" / "index.html",  # Current directory frontend/dist
    ]
    
    for check_path in check_paths:
        if check_path and check_path.exists():
            sys.stderr.write(f"✅ Found index.html at: {check_path}\n")
            sys.stderr.flush()
            return FileResponse(str(check_path))
    
    sys.stderr.write(f"❌ Frontend not found. Checked paths:\n")
    for p in check_paths:
        if p:
            sys.stderr.write(f"   - {p} (exists: {p.exists()})\n")
    sys.stderr.flush()
    return {"status": "ok", "service": "LLM Council API", "message": "Frontend not built. Please run build script.", "debug": {"static_dir": str(static_dir), "checked_paths": [str(p) for p in check_paths if p]}}

@app.get("/{file_path:path}")
async def serve_spa(file_path: str):
    """Serve the React app for all non-API routes (SPA routing)."""
    # Don't interfere with API routes
    if file_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Serve the requested file if it exists (e.g., favicon, robots.txt, etc.)
    # Check all possible locations
    check_locations = [
        static_dir / file_path if static_dir else None,
        _base_dir / "static" / file_path,  # backend/static/
        _base_parent / "frontend" / "dist" / file_path,  # frontend/dist/
        _base_parent / "frontend" / file_path,  # frontend/
        Path("/home/site/wwwroot/backend/static") / file_path,
        Path("/tmp/8de475922a03fff/backend/static") / file_path,
        Path("/tmp/8de475922a03fff/frontend/dist") / file_path,
        Path("/tmp/8de475922a03fff/frontend") / file_path,
        Path.cwd() / "backend" / "static" / file_path,
        Path.cwd() / "frontend" / "dist" / file_path,
    ]
    
    for requested_file in check_locations:
        if requested_file and requested_file.exists() and requested_file.is_file() and not file_path.endswith('.html'):
            return FileResponse(str(requested_file))
    
    # For all other routes, serve index.html (React Router will handle client-side routing)
    if static_index and static_index.exists():
        return FileResponse(str(static_index))
    
    # Try all locations for index.html
    for check_path in [
        _base_dir / "static" / "index.html",  # backend/static/
        _base_parent / "frontend" / "dist" / "index.html",  # frontend/dist/
        _base_parent / "frontend" / "index.html",  # frontend/
        Path("/home/site/wwwroot/backend/static/index.html"),
        Path("/tmp/8de475922a03fff/backend/static/index.html"),
        Path("/tmp/8de475922a03fff/frontend/dist/index.html"),
        Path("/tmp/8de475922a03fff/frontend/index.html"),
        Path.cwd() / "backend" / "static" / "index.html",
        Path.cwd() / "frontend" / "dist" / "index.html",
    ]:
        if check_path.exists():
            return FileResponse(str(check_path))
    
    raise HTTPException(status_code=404, detail="Frontend not found. Please build the frontend first.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
