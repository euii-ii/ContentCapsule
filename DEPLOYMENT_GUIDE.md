# 🚀 ContentCapsule Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy Button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/euii-ii/ContentCapsule.git)

### Option 2: Manual Vercel Deployment

#### Step 1: Visit Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Sign in with your GitHub account

#### Step 2: Import Project
1. Click "New Project"
2. Import from GitHub: `https://github.com/euii-ii/ContentCapsule.git`
3. Click "Import"

#### Step 3: Configure Environment Variables
Add these environment variables in Vercel dashboard:

**Required:**
```
GEMINI_API_KEY=AIzaSyCng-287QiVwb34PK6U-IFbnTLi6MQii5E
YOUTUBE_API_KEY=AIzaSyBKpy9V1pUxAyHHlvpaVZPxcFL3mGsIowc
```

**Database (Optional):**
```
MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.kppzd4t.mongodb.net/youtube-summary-ai?retryWrites=true&w=majority
```

**Authentication (Optional - works without):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
CLERK_SECRET_KEY=your_clerk_secret_here
```

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Get your live URL!

## Alternative Deployment Options

### Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables
6. Deploy

### Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Render
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Set build command: `npm run build && npm start`
4. Add environment variables
5. Deploy

## Environment Variables Explained

### Required for Basic Functionality
- **GEMINI_API_KEY**: Google AI API key for content generation
- **YOUTUBE_API_KEY**: YouTube Data API key for video metadata

### Optional for Enhanced Features
- **MONGODB_URI**: Database connection for user history
- **CLERK_SECRET_KEY**: Authentication secret key
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Authentication public key

## Post-Deployment Setup

### 1. Test Basic Features
- Add a YouTube video URL
- Generate a study guide
- Test the audio podcast feature

### 2. Set Up Authentication (Optional)
1. Create Clerk account at [clerk.com](https://clerk.com)
2. Get API keys
3. Add to environment variables
4. Redeploy

### 3. Set Up Database (Optional)
1. Create MongoDB Atlas account
2. Get connection string
3. Add to environment variables
4. Redeploy

## Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Ensure all required dependencies are in package.json
- Check build logs for specific errors

### Runtime Errors
- Verify API keys are valid and have proper permissions
- Check network connectivity to external APIs
- Review application logs

### Performance Issues
- Enable Vercel Analytics
- Monitor API response times
- Optimize large components

## Features Available After Deployment

### ✅ Working Out of the Box
- YouTube video URL input
- AI content generation (study guides, briefing docs)
- Audio podcast generation
- Chat functionality
- Responsive UI with dark/light themes

### ✅ With Database Setup
- User authentication
- Content history storage
- Usage analytics
- Cross-device synchronization

### ✅ With Full Configuration
- Persistent user accounts
- Complete history management
- Advanced analytics
- Production-ready features

## Support

If you encounter any issues during deployment:
1. Check the deployment logs
2. Verify environment variables
3. Test locally first with `npm run dev`
4. Create an issue on GitHub

## Live Demo

Once deployed, your ContentCapsule application will be available at:
`https://your-project-name.vercel.app`

The application includes:
- 🎧 Audio podcast generation
- 📚 AI-powered study guides
- 📋 Professional briefing documents
- 💬 Interactive chat with video content
- 📱 Responsive design for all devices
- 🔐 Optional user authentication
- 📊 Content history and analytics
