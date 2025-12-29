#!/bin/bash
# Azure App Service startup script

# Install Python dependencies
pip install -r requirements.txt

# Build frontend and copy to backend/static
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying frontend build to backend/static..."
mkdir -p backend/static
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/

# Run the application
python -m backend.main

