#!/bin/bash
# LetterLink Deployment Script

echo "🚀 Starting LetterLink Deployment..."

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Testing frontend build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Frontend build successful!"

echo ""
echo "🔴 MANUAL STEPS REQUIRED:"
echo ""
echo "1. Deploy Backend:"
echo "   cd api"
echo "   vercel --prod"
echo "   📝 Copy the backend URL"
echo ""
echo "2. Update CORS in api/src/index.js with your frontend URL"
echo ""
echo "3. Add Backend Environment Variables in Vercel:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET" 
echo "   - JWT_EXPIRES_IN"
echo "   - NODE_ENV=production"
echo ""
echo "4. Deploy Frontend:"
echo "   cd .. (back to root)"
echo "   vercel --prod"
echo ""
echo "5. Add Frontend Environment Variable in Vercel:"
echo "   - VITE_API_BASE_URL=https://your-backend-url.vercel.app/api"
echo ""
echo "6. Test your application!"
echo ""
echo "📚 See DEPLOYMENT-GUIDE.md for detailed instructions"
