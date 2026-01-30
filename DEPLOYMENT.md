# 🚀 ADUSTECH Backend - Vercel Deployment Guide

Complete step-by-step guide to deploy your ADUSTECH backend to Vercel.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] MongoDB Atlas account with a cluster created
- [ ] Cloudinary account with API credentials
- [ ] Gmail account with App Password generated
- [ ] Vercel account (free tier works)
- [ ] Git repository (GitHub, GitLab, or Bitbucket)

---

## 🔧 Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create a Cluster**
   - Click "Build a Database"
   - Select FREE tier (M0)
   - Choose your cloud provider and region
   - Name your cluster

3. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and strong password
   - Set role to "Read and write to any database"

5. **Get Connection String**
   - Go to "Database" > "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## 📧 Step 2: Set Up Gmail App Password

1. **Enable 2-Factor Authentication**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select app: "Mail"
   - Select device: "Other" (enter "ADUSTECH Backend")
   - Click "Generate"
   - Copy the 16-character password (no spaces)

---

## 🖼️ Step 3: Set Up Cloudinary

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get API Credentials**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

---

## 🌐 Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push Code to Git Repository**
   ```bash
   cd backend
   git add .
   git commit -m "Production-ready backend"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your Git repository
   - Select the `backend` directory as root

3. **Configure Environment Variables**
   
   Click "Environment Variables" and add:

   | Name | Value | Notes |
   |------|-------|-------|
   | `MONGODB_URI` | Your MongoDB connection string | From Step 1 |
   | `POWER_ADMIN_EMAIL` | your-email@example.com | Your admin email |
   | `CLOUDINARY_CLOUD_NAME` | your_cloud_name | From Step 3 |
   | `CLOUDINARY_API_KEY` | your_api_key | From Step 3 |
   | `CLOUDINARY_API_SECRET` | your_api_secret | From Step 3 |
   | `EMAIL_USER` | your-email@gmail.com | Gmail address |
   | `EMAIL_PASSWORD` | your_app_password | From Step 2 (16 chars) |
   | `SESSION_SECRET` | Generate random 32+ chars | Use password generator |
   | `ALLOWED_ORIGINS` | https://your-frontend.vercel.app | Your frontend URL(s) |
   | `FRONTEND_URL` | https://your-frontend.vercel.app | Your frontend URL |
   | `NODE_ENV` | production | Always set to production |

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Get your backend URL (e.g., `https://your-backend.vercel.app`)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd backend
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI production
   vercel env add POWER_ADMIN_EMAIL production
   vercel env add CLOUDINARY_CLOUD_NAME production
   vercel env add CLOUDINARY_API_KEY production
   vercel env add CLOUDINARY_API_SECRET production
   vercel env add EMAIL_USER production
   vercel env add EMAIL_PASSWORD production
   vercel env add SESSION_SECRET production
   vercel env add ALLOWED_ORIGINS production
   vercel env add FRONTEND_URL production
   vercel env add NODE_ENV production
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## ✅ Step 5: Verify Deployment

1. **Check Health Endpoint**
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-30T15:00:00.000Z",
     "environment": "production"
   }
   ```

2. **Check Logs**
   - Go to Vercel Dashboard
   - Select your project
   - Click "Logs" tab
   - Verify no errors

3. **Test Registration**
   ```bash
   curl -X POST https://your-backend.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "testpass123"
     }'
   ```

---

## 🔄 Step 6: Update Frontend Configuration

Update your frontend API base URL to point to your Vercel backend:

```javascript
// In your frontend config (e.g., adustech/services/config.ts)
const API_BASE_URL = 'https://your-backend.vercel.app/api';
```

Make sure to update CORS in backend if needed:
```bash
vercel env add ALLOWED_ORIGINS production
# Enter: https://your-frontend-url.com,https://www.your-frontend-url.com
```

---

## 🛠️ Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Verify MongoDB connection string is correct
- Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)
- Ensure password in connection string doesn't contain special characters (URL encode if needed)

### Issue: "CORS error when calling API"
**Solution:**
- Add frontend URL to `ALLOWED_ORIGINS` environment variable
- Format: `https://frontend.vercel.app,https://www.frontend.vercel.app`
- Redeploy after changing env vars

### Issue: "Session not persisting"
**Solution:**
- Verify `MONGODB_URI` is set correctly
- Check `SESSION_SECRET` is configured (32+ characters)
- Ensure frontend sends `credentials: include` in requests

### Issue: "Emails not sending"
**Solution:**
- Use App Password, not regular Gmail password
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
- Check Gmail account isn't locked/suspended

### Issue: "Rate limit errors"
**Solution:**
- Rate limits are per IP (100 req/15min general, 10/15min auth)
- In development, may need to adjust limits in `app.js`
- Clear browser cache/cookies

### Issue: "Environment variables not loading"
**Solution:**
- Redeploy after adding/changing environment variables
- Go to Vercel Dashboard > Settings > Environment Variables
- Click "..." > "Redeploy"

---

## 🔐 Security Best Practices

1. **Generate Strong SESSION_SECRET**
   ```bash
   # Use this command to generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Rotate Credentials Regularly**
   - Change `SESSION_SECRET` every few months
   - Rotate database passwords
   - Update API keys if compromised

3. **Monitor Logs**
   - Regularly check Vercel logs for suspicious activity
   - Set up alerts in MongoDB Atlas

4. **Restrict CORS**
   - Only allow your actual frontend URLs in `ALLOWED_ORIGINS`
   - Never use `*` in production

5. **Database Backups**
   - Enable automated backups in MongoDB Atlas
   - Test restore procedures

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard
- Monitor function invocations
- Check error rates
- Review response times

### MongoDB Atlas
- Monitor database size
- Check query performance
- Set up alerts for issues

### Cloudinary
- Monitor storage usage
- Track bandwidth
- Review transformation costs

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to your Git repository:

```bash
# Make changes to code
git add .
git commit -m "Update backend"
git push

# Vercel automatically deploys
```

---

## 📝 Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `POWER_ADMIN_EMAIL` | ✅ Yes | Power admin email address | `admin@example.com` |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name | `my_cloud` |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret | `abcdefghijklmnop` |
| `EMAIL_USER` | ✅ Yes | Gmail address | `myapp@gmail.com` |
| `EMAIL_PASSWORD` | ✅ Yes | Gmail app password | `abcd efgh ijkl mnop` |
| `SESSION_SECRET` | ✅ Yes | Session encryption key (32+ chars) | `your-random-32-char-secret` |
| `ALLOWED_ORIGINS` | ✅ Yes | Comma-separated frontend URLs | `https://app.com,https://www.app.com` |
| `FRONTEND_URL` | ✅ Yes | Primary frontend URL | `https://app.com` |
| `NODE_ENV` | ✅ Yes | Environment mode | `production` |
| `PORT` | ❌ No | Port number (auto-set by Vercel) | `5000` |

---

## 🎉 Success!

Your ADUSTECH backend is now live on Vercel! 

**Next Steps:**
1. Update frontend to use production API URL
2. Test all endpoints thoroughly
3. Set up monitoring and alerts
4. Document any custom configurations
5. Share API documentation with your team

**Support:**
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Cloudinary Docs: [cloudinary.com/documentation](https://cloudinary.com/documentation)

---

**Deployed by:** [Your Name]  
**Last Updated:** 2025-01-30
