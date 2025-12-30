#!/bin/bash
# Azure App Service startup script

# Change to app directory
cd /home/site/wwwroot

# Build frontend if not already built (check if backend/static/index.html exists)
if [ ! -f "backend/static/index.html" ]; then
    echo "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    echo "Copying frontend build to backend/static..."
    mkdir -p backend/static
    rm -rf backend/static/*
    cp -r frontend/dist/* backend/static/
else
    echo "Frontend already built, skipping build step..."
fi

# Run the application
echo "Starting Python application..."
python -m backend.main
