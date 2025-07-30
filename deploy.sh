#!/bin/bash
# Quick deployment script for LetterLink

echo "🚀 Starting LetterLink Deployment Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running linting check..."
npm run lint

echo "🏗️ Building for production..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "🌐 Next steps:"
echo "1. Deploy backend first: cd api && vercel"
echo "2. Get backend URL and update VITE_API_BASE_URL"
echo "3. Deploy frontend: vercel"
echo ""
echo "📚 See DEPLOYMENT-GUIDE.md for detailed instructions"
