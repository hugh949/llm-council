#!/bin/bash
# Azure App Service startup script
# All output goes to stderr so Azure Log Stream captures it

# Force output to stderr (Azure Log Stream captures stderr)
exec 1>&2

# Log that script started
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "🚀 STARTUP.SH STARTED" >&2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
echo "🔍 Current directory: $(pwd)" >&2
echo "🔍 Script location: $0" >&2

# Find the app directory (could be /home/site/wwwroot or extracted location)
# First, try to find where we actually are
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "🔍 Script directory: $SCRIPT_DIR" >&2

# Find the extracted directory
if [ -d "/tmp" ]; then
    # Find the extracted directory
    EXTRACTED_DIR=$(find /tmp -maxdepth 1 -type d -name "*" 2>/dev/null | grep -E "^/tmp/[a-f0-9]+$" | head -1)
    echo "🔍 Found extracted directory: $EXTRACTED_DIR" >&2
    if [ -n "$EXTRACTED_DIR" ] && [ -f "$EXTRACTED_DIR/backend/main.py" ]; then
        APP_DIR="$EXTRACTED_DIR"
        echo "✅ Using extracted directory: $APP_DIR" >&2
    elif [ -f "/home/site/wwwroot/backend/main.py" ]; then
        APP_DIR="/home/site/wwwroot"
        echo "✅ Using wwwroot directory: $APP_DIR" >&2
    elif [ -f "$SCRIPT_DIR/backend/main.py" ]; then
        APP_DIR="$SCRIPT_DIR"
        echo "✅ Using script directory: $APP_DIR" >&2
    else
        APP_DIR="/home/site/wwwroot"
        echo "⚠️  Defaulting to wwwroot: $APP_DIR" >&2
    fi
else
    APP_DIR="/home/site/wwwroot"
    echo "⚠️  /tmp not found, using wwwroot: $APP_DIR" >&2
fi

cd "$APP_DIR"
echo "🔍 Working directory: $(pwd)" >&2
echo "🔍 Checking for frontend directory..." >&2
ls -la . >&2

# Build frontend if not already built
if [ ! -f "backend/static/index.html" ]; then
    echo "🔨 Building frontend..." >&2
    if [ -d "frontend" ]; then
        echo "✅ Found frontend directory" >&2
        cd frontend
        echo "📦 Running npm install..." >&2
        npm install 2>&1
        if [ $? -ne 0 ]; then
            echo "❌ npm install failed!" >&2
            exit 1
        fi
        echo "✅ npm install completed" >&2
        
        echo "🔨 Running npm run build..." >&2
        npm run build 2>&1
        if [ $? -ne 0 ]; then
            echo "❌ npm run build failed!" >&2
            exit 1
        fi
        echo "✅ npm run build completed" >&2
        
        cd ..
        
        if [ -d "frontend/dist" ]; then
            echo "📦 Copying frontend build to backend/static..." >&2
            mkdir -p backend/static
            rm -rf backend/static/*
            cp -r frontend/dist/* backend/static/
            if [ $? -eq 0 ]; then
                echo "✅ Frontend build complete! Files copied to backend/static/" >&2
            else
                echo "❌ Error copying files to backend/static/" >&2
                exit 1
            fi
        else
            echo "❌ Error: frontend/dist not created after build" >&2
            echo "🔍 Contents of frontend directory:" >&2
            ls -la frontend/ >&2
            exit 1
        fi
    else
        echo "❌ Error: frontend directory not found at $(pwd)/frontend" >&2
        echo "🔍 Current directory contents:" >&2
        ls -la >&2
        exit 1
    fi
else
    echo "✅ Frontend already built, skipping build step..." >&2
fi

# Run the application
echo "🚀 Starting Python application..." >&2
exec python -m backend.main
