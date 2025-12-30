#!/bin/bash
# Azure App Service startup script

# Find the app directory (could be /home/site/wwwroot or extracted location)
if [ -d "/tmp" ]; then
    # Find the extracted directory
    EXTRACTED_DIR=$(find /tmp -maxdepth 1 -type d -name "*" 2>/dev/null | grep -E "^/tmp/[a-f0-9]+$" | head -1)
    if [ -n "$EXTRACTED_DIR" ] && [ -f "$EXTRACTED_DIR/backend/main.py" ]; then
        APP_DIR="$EXTRACTED_DIR"
    else
        APP_DIR="/home/site/wwwroot"
    fi
else
    APP_DIR="/home/site/wwwroot"
fi

cd "$APP_DIR"
echo "Working directory: $(pwd)"

# Build frontend if not already built
if [ ! -f "backend/static/index.html" ]; then
    echo "🔨 Building frontend..."
    if [ -d "frontend" ]; then
        cd frontend
        echo "Running npm install..."
        npm install
        echo "Running npm run build..."
        npm run build
        cd ..
        
        if [ -d "frontend/dist" ]; then
            echo "📦 Copying frontend build to backend/static..."
            mkdir -p backend/static
            rm -rf backend/static/*
            cp -r frontend/dist/* backend/static/
            echo "✅ Frontend build complete!"
        else
            echo "❌ Error: frontend/dist not created after build"
        fi
    else
        echo "❌ Error: frontend directory not found"
    fi
else
    echo "✅ Frontend already built, skipping build step..."
fi

# Run the application
echo "🚀 Starting Python application..."
python -m backend.main
