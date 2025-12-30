#!/usr/bin/env python3
"""
Azure App Service startup script (Python version)
This script builds the frontend if needed, then starts the FastAPI app.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

# Force output to stderr so Azure Log Stream captures it
def log(message):
    """Log message to stderr (Azure captures stderr)"""
    print(message, file=sys.stderr, flush=True)

log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
log("🚀 STARTUP.PY STARTED - PYTHON SCRIPT IS RUNNING!")
log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

# Find the app directory
log(f"🔍 Current directory: {os.getcwd()}")
log(f"🔍 Python executable: {sys.executable}")

# Find the extracted directory
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
            log(f"✅ Found extracted directory: {app_dir}")
        else:
            log(f"⚠️  Extracted dir {extracted_dir} doesn't have backend/main.py")
    else:
        log("⚠️  No extracted directories found in /tmp")

# Fallback to wwwroot
if app_dir is None:
    wwwroot = Path("/home/site/wwwroot")
    backend_main = wwwroot / "backend" / "main.py"
    if backend_main.exists():
        app_dir = wwwroot
        log(f"✅ Using wwwroot directory: {app_dir}")
    else:
        app_dir = Path.cwd()
        log(f"⚠️  Defaulting to current directory: {app_dir}")

# Change to app directory
os.chdir(app_dir)
log(f"🔍 Working directory: {os.getcwd()}")

# Check if frontend needs to be built
backend_static = app_dir / "backend" / "static" / "index.html"
frontend_dir = app_dir / "frontend"
frontend_dist = app_dir / "frontend" / "dist"

if not backend_static.exists():
    log("🔨 Building frontend...")
    
    if not frontend_dir.exists():
        log(f"❌ Error: frontend directory not found at {frontend_dir}")
        sys.exit(1)
    
    # Check if Node.js is available
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, timeout=5)
        log(f"✅ Node.js version: {result.stdout.strip()}")
    except (subprocess.TimeoutExpired, FileNotFoundError):
        log("❌ Error: Node.js not found. Cannot build frontend.")
        log("💡 Tip: Install Node.js extension in Azure App Service")
        sys.exit(1)
    
    # Run npm install
    log("📦 Running npm install...")
    os.chdir(frontend_dir)
    result = subprocess.run(
        ["npm", "install"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=300
    )
    
    if result.returncode != 0:
        log(f"❌ npm install failed!")
        log(result.stdout)
        sys.exit(1)
    
    log("✅ npm install completed")
    
    # Run npm run build
    log("🔨 Running npm run build...")
    result = subprocess.run(
        ["npm", "run", "build"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=300
    )
    
    if result.returncode != 0:
        log(f"❌ npm run build failed!")
        log(result.stdout)
        sys.exit(1)
    
    log("✅ npm run build completed")
    
    # Copy files to backend/static
    if not frontend_dist.exists():
        log(f"❌ Error: frontend/dist not created after build")
        sys.exit(1)
    
    log("📦 Copying frontend build to backend/static...")
    backend_static_dir = app_dir / "backend" / "static"
    backend_static_dir.mkdir(parents=True, exist_ok=True)
    
    # Remove existing files
    if backend_static_dir.exists():
        shutil.rmtree(backend_static_dir)
    backend_static_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy files
    for item in frontend_dist.iterdir():
        dest = backend_static_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest)
        else:
            shutil.copy2(item, dest)
    
    log("✅ Frontend build complete! Files copied to backend/static/")
else:
    log("✅ Frontend already built, skipping build step...")

# Change back to app directory
os.chdir(app_dir)

# Start the Python application
log("🚀 Starting Python application...")
log(f"🔍 Running: python -m backend.main from {os.getcwd()}")

# Use exec to replace this process with the FastAPI app
os.execvp("python", ["python", "-m", "backend.main"])

