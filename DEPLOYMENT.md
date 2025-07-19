# Deployment Guide

## Option 1: Quick Deploy with Vercel (Recommended)

### Frontend + Backend on Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy Frontend**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Environment Variables: Add `VITE_API_BASE_URL`

3. **Deploy Backend**:
   - Create a new Vercel project for your backend
   - Or use Railway/Render for backend (see Option 2)

## Option 2: Separate Deployment (Recommended for production)

### Frontend: Vercel/Netlify
### Backend: Railway

1. **Deploy Backend on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables:
     - `NODE_ENV=production`
     - `MONGODB_URI=your_connection_string`
     - `JWT_SECRET=your_secret`
   - Railway will auto-deploy

2. **Deploy Frontend on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set environment variable:
     - `VITE_API_BASE_URL=https://your-backend-url.railway.app/api`

## Option 3: All Free Tier

### Frontend: Netlify
### Backend: Render
### Database: MongoDB Atlas (Free)

1. **Build and Deploy Frontend**:
   ```bash
   npm run build
   ```
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop the `dist` folder

2. **Deploy Backend on Render**:
   - Go to [render.com](https://render.com)
   - Connect GitHub repository
   - Set:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment variables

## Environment Variables Setup

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Backend Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-key
```

## Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection string updated
- [ ] API base URL updated in frontend
- [ ] Build command works locally: `npm run build`
- [ ] Backend starts without errors: `npm start`
- [ ] CORS configured for production domain
- [ ] Security headers added

## Cost Breakdown (All Free Options)

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| Vercel | Unlimited personal projects | $20/month team |
| Railway | $5 credit/month | Pay as you use |
| MongoDB Atlas | 512MB storage | $9/month |
| Netlify | 100GB bandwidth | $19/month |
| Render | 750 hours/month | $7/month |

## Recommended Stack for Your App

**Best Free Option**:
- Frontend: Vercel
- Backend: Railway  
- Database: MongoDB Atlas (already set up)

**Why**: This gives you the best performance, automatic deployments, and room to scale.
