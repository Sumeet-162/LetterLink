# 🚀 LetterLink Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Frontend (React) Deployment to Vercel

1. **Environment Variables Setup**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add these variables:
     ```
     VITE_API_BASE_URL = https://your-backend-domain.vercel.app/api
     ```

2. **Build Configuration**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### ✅ Backend (Node.js) Deployment to Vercel

1. **Deploy Backend First**:
   - Create a separate Vercel project for the `/api` folder
   - Set Root Directory to `api`
   - Environment Variables needed:
     ```
     MONGODB_URI = your-mongodb-atlas-connection-string
     JWT_SECRET = your-jwt-secret-key
     NODE_ENV = production
     FRONTEND_URL = https://your-frontend-domain.vercel.app
     ```

2. **Backend Build Settings**:
   - Build Command: `npm install`
   - Output Directory: leave empty
   - Install Command: `npm install`

## 🔧 Step-by-Step Deployment Process

### Step 1: Deploy Backend
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Select the `api` folder as root directory
4. Add environment variables
5. Deploy

### Step 2: Update Frontend Configuration
1. Get your backend URL from Step 1
2. Update frontend environment variables
3. Deploy frontend

### Step 3: Test End-to-End
1. Visit your frontend URL
2. Test login/signup
3. Test letter sending
4. Verify API connectivity

## 🐛 Common Deployment Issues & Fixes

### Issue 1: "Failed to fetch" errors
**Solution**: Check CORS configuration in backend and API URL in frontend

### Issue 2: Build failures
**Solution**: 
- Clear node_modules and reinstall
- Check all imports are correct
- Verify all dependencies are in package.json

### Issue 3: Environment variables not working
**Solution**: 
- Ensure variables start with `VITE_` for frontend
- Redeploy after adding environment variables

### Issue 4: Database connection issues
**Solution**: 
- Verify MongoDB Atlas connection string
- Check IP whitelist (allow all: 0.0.0.0/0 for Vercel)
- Ensure database user has proper permissions

## 📱 Production URLs Structure

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-api-name.vercel.app`
- **Database**: MongoDB Atlas cloud database

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **CORS**: Only allow your frontend domain
3. **Environment Variables**: Never commit .env files
4. **Database**: Restrict IP access and use strong passwords

## 📊 Monitoring & Maintenance

1. **Vercel Analytics**: Enable for performance monitoring
2. **Error Tracking**: Consider adding Sentry for error tracking
3. **Database Monitoring**: Use MongoDB Atlas monitoring
4. **Uptime Monitoring**: Set up alerts for downtime

## 🚨 Emergency Rollback

If deployment fails:
1. Revert to previous working commit
2. Check Vercel deployment logs
3. Verify environment variables
4. Test locally before redeploying
