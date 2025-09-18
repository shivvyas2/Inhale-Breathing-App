# Deploy Backend on Vercel - Complete Guide

## 🚀 Quick Deploy (2 minutes)

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up with GitHub** (free)
3. **Click "New Project"**
4. **Import your repository**: `shivvyas2/Inhale-Breathing-App`
5. **Set Root Directory**: `backend`
6. **Framework Preset**: `Other`
7. **Build Command**: `npm run build`
8. **Output Directory**: Leave empty
9. **Install Command**: `npm install`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to backend directory
cd backend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: inhale-backend
# - Directory: ./
# - Override settings? No
```

## 🔧 Environment Variables Setup

After deployment, add these environment variables in Vercel Dashboard:

### Required Variables:
```
SUPABASE_URL = https://mkumjzxgocrfmpgxnpmn.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdW1qenhnb2NyZm1wZ3hucG1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0NTgxNiwiZXhwIjoyMDczNzIxODE2fQ.Ksne84y65ZWXSd30-ZSsd8RebmdDnk--r7xX8NS9cp4
CLERK_WEBHOOK_SECRET = your_webhook_secret_here
NODE_ENV = production
```

### How to Add Environment Variables:
1. Go to your project in Vercel Dashboard
2. Click **Settings** tab
3. Click **Environment Variables**
4. Add each variable with the values above
5. Click **Save**

## 🌐 After Deployment

### Your API Endpoints:
- **Base URL**: `https://inhale-backend.vercel.app`
- **Health Check**: `https://inhale-backend.vercel.app/health`
- **API Docs**: `https://inhale-backend.vercel.app/api-docs`
- **Webhook**: `https://inhale-backend.vercel.app/api/webhook/clerk`

### Configure Clerk Webhook:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks**
3. Click **Add Endpoint**
4. **URL**: `https://inhale-backend.vercel.app/api/webhook/clerk`
5. **Events**: Select `user.created` and `user.updated`
6. **Copy the Signing Secret** and add it to Vercel environment variables

## 🎯 What You Get:

✅ **Free hosting** with HTTPS  
✅ **Global CDN** for fast performance  
✅ **Automatic deployments** from GitHub  
✅ **Custom domain** (free)  
✅ **Serverless functions** (unlimited)  
✅ **Environment variables** management  
✅ **Real-time logs** and monitoring  

## 🔄 Automatic Deployments

Every time you push to your GitHub repository, Vercel will automatically:
- Build your backend
- Deploy the new version
- Update your live API

## 📊 Monitoring

- **Function Logs**: Available in Vercel Dashboard
- **Performance**: Real-time metrics
- **Errors**: Automatic error tracking
- **Analytics**: Request/response data

## 🆓 Free Tier Limits

- **100GB bandwidth** per month
- **Unlimited** serverless function executions
- **Custom domains** (free)
- **HTTPS** (automatic)
- **GitHub integration** (free)

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Make sure they're set in Vercel Dashboard
3. **Function Timeout**: Vercel has a 10-second timeout for free tier
4. **CORS Issues**: Already handled in the code

### Debug Steps:
1. Check Vercel function logs
2. Test endpoints with Postman/curl
3. Verify environment variables
4. Check GitHub repository connection

## 🎉 Success!

Once deployed, your backend will be live at:
`https://inhale-backend.vercel.app`

Test it by visiting:
- Health: `https://inhale-backend.vercel.app/health`
- API Docs: `https://inhale-backend.vercel.app/api-docs`
