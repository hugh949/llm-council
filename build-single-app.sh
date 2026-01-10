#!/bin/bash
# Build script to create a single app with frontend and backend

echo "🔨 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "📦 Copying frontend build to backend static directory..."
mkdir -p backend/static
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/

echo "✅ Build complete! Frontend files are in backend/static/"
echo "🚀 You can now deploy just the backend, and it will serve both frontend and API!"


