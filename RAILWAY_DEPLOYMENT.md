# 🚂 Railway Deployment Guide for ADUSTECH Backend

Complete guide to deploy your PostgreSQL + Prisma backend to Railway.

---

## 🎯 What You'll Get

- ✅ Automatic HTTPS domain
- ✅ PostgreSQL database (already connected!)
- ✅ Automatic deployments from Git
- ✅ Environment variables management
- ✅ Free tier: $5/month credit
- ✅ Zero downtime deployments

---

## 📋 Prerequisites

- [x] Railway account (you already have this!)
- [x] PostgreSQL database on Railway (you already have this!)
- [x] Git repository with your code
- [x] Backend working locally

---

## 🚀 Deployment Steps

### Step 1: Push Your Code to Git

```bash
cd backend

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Production-ready backend for Railway"

# Push to GitHub/GitLab
git remote add origin https://github.com/yourusername/adustech-backend.git
git push -u origin main
```

---

### Step 2: Create Railway Project for Backend

1. Go to: https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect Node.js and deploy!

**OR** if you prefer Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to your existing database
railway link

# Deploy
railway up
```

---

### Step 3: Configure Environment Variables

In Railway dashboard, click your backend service → **Variables** tab:

Add these variables:

```bash
# Already set by Railway (your existing PostgreSQL)
DATABASE_URL=postgresql://postgres:pass@...railway.app:5432/railway

# Add these new variables:
NODE_ENV=production
PORT=5000

# Your existing credentials (from .env)
POWER_ADMIN_EMAIL=myusman137@gmail.com

CLOUDINARY_CLOUD_NAME=dcttsbnen
CLOUDINARY_API_KEY=123329878521615
CLOUDINARY_API_SECRET=eeFJsNWoUFRXPByY2nqBaThDYNk

EMAIL_USER=myusman137@gmail.com
EMAIL_PASSWORD=hvnqfgiaiamyskui

SESSION_SECRET=adustech_prod_secret_key_change_this_to_random_32_chars_minimum

# Add your frontend URL when ready
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

---

### Step 4: Generate Public Domain

1. In Railway dashboard, click your backend service
2. Go to **Settings** tab
3. Scroll to **Networking** section
4. Click **"Generate Domain"**
5. You'll get a domain like: `adustech-backend-production.up.railway.app`

**Copy this URL** - this is your production backend!

---

### Step 5: Run Database Migrations

Railway will automatically run migrations on deploy, but you can also trigger manually:

**Option A: Automatic (Recommended)**
- Railway runs `npm run build` which includes `prisma migrate deploy`
- Already configured in `railway.json`

**Option B: Manual via Railway CLI**
```bash
railway run npx prisma migrate deploy
```

---

### Step 6: Verify Deployment

1. **Check Deployment Logs:**
   - Railway Dashboard → Your Service → Deployments
   - Look for "✅ PostgreSQL Connected successfully"

2. **Test Health Endpoint:**
   ```bash
   curl https://your-backend.up.railway.app/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-30T...",
     "environment": "production"
   }
   ```

3. **Test Registration:**
   ```bash
   curl -X POST https://your-backend.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"test123"}'
   ```

---

## 🔧 Railway Configuration Files

Your backend includes these Railway-specific files:

### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### `nixpacks.toml`
Optimized build configuration for Railway's Nixpacks builder.

### `Procfile`
Fallback process definition for Railway.

---

## 🔄 Continuous Deployment

Once deployed, Railway automatically redeploys when you push to Git:

```bash
# Make changes to your code
git add .
git commit -m "Update backend"
git push

# Railway automatically deploys! 🚀
```

**Deploy time:** ~2-3 minutes

---

## 📊 Monitoring & Logs

### View Logs:
1. Railway Dashboard → Your Service
2. Click **"Logs"** tab
3. Real-time logs appear

### Metrics:
1. Click **"Metrics"** tab
2. View CPU, Memory, Network usage

### Alerts:
1. Settings → Notifications
2. Configure Discord/Slack/Email alerts

---

## 💰 Railway Pricing

**Free Tier:**
- $5 credit per month
- Enough for small projects
- ~550 hours of runtime

**Hobby Plan ($5/month):**
- $5 base + usage
- More resources
- Priority support

**Your Current Setup:**
- PostgreSQL: ~$1-2/month
- Backend Service: ~$2-3/month
- **Total: ~$3-5/month** (fits in free tier!)

---

## 🔐 Security Best Practices

### 1. Rotate Exposed Credentials

⚠️ Your current credentials were in git history:

```bash
# Generate new SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Railway:
# Settings → Variables → Edit SESSION_SECRET
```

### 2. Enable HTTPS Only
✅ Railway automatically provides HTTPS - no configuration needed!

### 3. Configure CORS Properly
Update `ALLOWED_ORIGINS` with your actual frontend URL:
```bash
ALLOWED_ORIGINS=https://your-actual-frontend.vercel.app
```

### 4. Set Strong Passwords
- Cloudinary: Regenerate API keys
- Gmail: Create new App Password
- Update all in Railway Variables

---

## 🐛 Troubleshooting

### Deployment Failed?

**Check Build Logs:**
- Railway Dashboard → Deployments → Click failed build
- Look for error messages

**Common Issues:**

1. **Prisma Generate Failed**
   ```bash
   # Run locally to test
   npx prisma generate
   ```

2. **Database Connection Failed**
   - Verify `DATABASE_URL` is set in Railway Variables
   - Check Railway PostgreSQL is running

3. **Port Binding Error**
   - Railway automatically sets `PORT`
   - Don't hardcode port in production

### Health Check Failing?

1. Check `/api/health` endpoint is working locally
2. Verify `healthcheckPath` in `railway.json`
3. Check service is actually running (logs)

### CORS Errors?

1. Add frontend URL to `ALLOWED_ORIGINS`
2. Format: `https://yourdomain.com` (no trailing slash)
3. Separate multiple with commas

---

## 🔄 Database Migrations

### Adding New Fields

1. **Update Prisma Schema:**
   ```prisma
   // prisma/schema.prisma
   model User {
     // ... existing fields
     newField String @default("")
   }
   ```

2. **Create Migration Locally:**
   ```bash
   npx prisma migrate dev --name add_new_field
   ```

3. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Add new field to User"
   git push
   ```

4. **Railway Auto-Deploys:**
   - Runs `prisma migrate deploy` automatically
   - Zero downtime migration

---

## 📱 Connect Frontend

Update your frontend API configuration:

```javascript
// Frontend config
const API_BASE_URL = 'https://your-backend.up.railway.app/api';

// Example: React Native
export const config = {
  apiUrl: API_BASE_URL,
  timeout: 10000,
};

// Ensure credentials are included
fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  credentials: 'include', // Important for cookies!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Health check returning `{"status":"ok"}`
- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] Public domain generated
- [ ] CORS configured with frontend URL
- [ ] Registration endpoint working
- [ ] Login endpoint working
- [ ] Frontend connected to backend
- [ ] Logs showing no errors
- [ ] Monitoring configured

---

## 🚀 Advanced Features

### Custom Domain

1. Railway Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Add DNS records as shown
5. Wait for verification

### Database Backups

Railway automatically backs up your PostgreSQL database.

**Manual Backup:**
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Scaling

Railway auto-scales based on traffic. For manual control:
- Settings → Resources
- Adjust CPU/Memory allocation

---

## 📞 Support

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app
- Status: https://status.railway.app

**Your Backend:**
- Logs: Railway Dashboard → Logs tab
- Metrics: Railway Dashboard → Metrics tab

---

## ✅ Success!

Your backend is now live on Railway! 🎉

**Your URLs:**
- Backend API: `https://your-backend.up.railway.app/api`
- Health Check: `https://your-backend.up.railway.app/api/health`
- Database: Already connected via Railway PostgreSQL

**Next Steps:**
1. Update frontend to use production API URL
2. Test all endpoints
3. Monitor logs for errors
4. Set up alerts
5. Share with your team!

---

**Deployed on:** Railway  
**Database:** PostgreSQL (Railway)  
**Framework:** Express.js + Prisma  
**Version:** 2.0.0
