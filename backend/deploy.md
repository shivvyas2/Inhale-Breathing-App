# Railway Deployment Guide

## Quick Deploy to Railway (Free)

### Option 1: Deploy via Railway Dashboard (Easiest)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub** (free)
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Connect your GitHub account**
6. **Select your repository** (inhale)
7. **Set Root Directory to `backend`**
8. **Add Environment Variables:**
   - `SUPABASE_URL` = `https://mkumjzxgocrfmpgxnpmn.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdW1qenhnb2NyZm1wZ3hucG1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0NTgxNiwiZXhwIjoyMDczNzIxODE2fQ.Ksne84y65ZWXSd30-ZSsd8RebmdDnk--r7xX8NS9cp4`
   - `CLERK_WEBHOOK_SECRET` = `your_webhook_secret_here`
   - `PORT` = `3000`
   - `NODE_ENV` = `production`

9. **Click "Deploy"**
10. **Get your public URL** (e.g., `https://your-app-name.railway.app`)

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set SUPABASE_URL=https://mkumjzxgocrfmpgxnpmn.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdW1qenhnb2NyZm1wZ3hucG1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0NTgxNiwiZXhwIjoyMDczNzIxODE2fQ.Ksne84y65ZWXSd30-ZSsd8RebmdDnk--r7xX8NS9cp4
railway variables set CLERK_WEBHOOK_SECRET=your_webhook_secret_here
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Deploy
railway up
```

## After Deployment

1. **Get your Railway URL** (e.g., `https://inhale-backend-production.railway.app`)
2. **Update Clerk Webhook URL** to: `https://your-railway-url.railway.app/api/webhook/clerk`
3. **Test the webhook** by creating a new user in your app

## Free Tier Limits

- **512MB RAM**
- **1GB Storage**
- **$5/month credit** (usually enough for small apps)
- **Custom domains** (free)
- **HTTPS** (automatic)
