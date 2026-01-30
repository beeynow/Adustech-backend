# ✅ Pre-Deployment Checklist for ADUSTECH Backend

Use this checklist before deploying to Vercel production.

---

## 🔐 Security (CRITICAL - DO NOT SKIP)

### Credentials & Secrets
- [ ] **MongoDB password changed** from exposed credentials in git history
- [ ] **Cloudinary API keys regenerated** (old keys were exposed)
- [ ] **Gmail App Password regenerated** (old password was exposed)
- [ ] **SESSION_SECRET generated** using secure random string (32+ characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **POWER_ADMIN_EMAIL** set to your actual admin email
- [ ] **All environment variables** documented and ready

### Git Repository
- [ ] `.env` file is NOT committed to git (check with `git status`)
- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded credentials remain in any committed files
- [ ] Consider removing sensitive data from git history if previously committed

---

## 🌐 External Services Setup

### MongoDB Atlas
- [ ] Account created at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Free tier (M0) cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 for Vercel, or Vercel IPs)
- [ ] Connection string copied and tested locally
- [ ] Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/...`

### Cloudinary
- [ ] Account created at [cloudinary.com](https://cloudinary.com)
- [ ] Free tier activated
- [ ] Dashboard accessed
- [ ] Cloud Name copied
- [ ] API Key copied
- [ ] API Secret copied
- [ ] Test upload performed (optional)

### Gmail (Email Service)
- [ ] Gmail account available
- [ ] 2-Factor Authentication enabled
- [ ] App Password generated at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- [ ] 16-character app password copied (format: xxxx xxxx xxxx xxxx)
- [ ] Test email sent locally (optional)

### Vercel
- [ ] Account created at [vercel.com](https://vercel.com)
- [ ] Git repository connected (GitHub/GitLab/Bitbucket)
- [ ] Vercel CLI installed (optional): `npm i -g vercel`

---

## 📝 Environment Variables Ready

Prepare these values before deployment:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Admin
POWER_ADMIN_EMAIL=your-admin@example.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # App Password (16 chars)

# Security
SESSION_SECRET=your-secure-random-32-char-secret-here-from-crypto

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app

# Environment
NODE_ENV=production
```

**Checklist:**
- [ ] All 11 environment variables prepared
- [ ] Values copied to a secure location (password manager)
- [ ] No placeholder values remaining
- [ ] MongoDB URI tested locally
- [ ] Cloudinary credentials verified
- [ ] Gmail app password works

---

## 🧪 Local Testing

### Basic Tests
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server successfully
- [ ] Server responds at `http://localhost:5000`
- [ ] Health endpoint works: `curl http://localhost:5000/api/health`
- [ ] MongoDB connection successful (check logs)

### API Testing
- [ ] Registration endpoint works
- [ ] OTP email received
- [ ] Login endpoint works
- [ ] Session persists across requests
- [ ] Profile endpoints work
- [ ] Post creation works
- [ ] Image upload works (Cloudinary)
- [ ] Rate limiting triggers after multiple requests

### Expected Output
```bash
$ npm run dev

> adustech-backend@1.0.0 dev
> NODE_ENV=development node app.js

🔐 POWER_ADMIN_EMAIL configured: your-email@example.com
✅ MongoDB Connected successfully
🚀 Server running on port 5000
📍 Environment: development
```

---

## 📦 Code Verification

### File Structure
- [ ] `vercel.json` exists in backend folder
- [ ] `.env.example` exists (template)
- [ ] `.gitignore` includes `.env`
- [ ] `.vercelignore` exists
- [ ] `package.json` has correct scripts
- [ ] All documentation files present (README, DEPLOYMENT, SECURITY)

### Code Quality
- [ ] No `console.log` statements with sensitive data
- [ ] No hardcoded credentials
- [ ] No commented-out code with passwords
- [ ] No TODO comments with security concerns
- [ ] All routes have validation middleware

---

## 🚀 Vercel Deployment

### Pre-Deploy
- [ ] All code committed to git
- [ ] All changes pushed to repository
- [ ] Branch is clean (`git status` shows no uncommitted changes)
- [ ] Repository is public OR Vercel has access to private repo

### Deployment Steps
- [ ] Project imported to Vercel
- [ ] Root directory set to `backend` folder
- [ ] Framework preset: Other
- [ ] Build command: (leave empty)
- [ ] Output directory: (leave empty)
- [ ] Install command: `npm install`

### Environment Variables in Vercel
- [ ] All 11 environment variables added to Vercel
- [ ] Variables set for "Production" environment
- [ ] `NODE_ENV` set to `production`
- [ ] Sensitive values not visible in logs

### Deploy
- [ ] Click "Deploy" button
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors
- [ ] Copy deployment URL

---

## ✅ Post-Deployment Verification

### Health Check
```bash
curl https://your-backend.vercel.app/api/health
```
**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-30T...",
  "environment": "production"
}
```

### Registration Test
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}'
```
**Expected:** Success message and OTP email sent

### CORS Test
- [ ] Frontend can make requests to backend
- [ ] Cookies are set properly
- [ ] No CORS errors in browser console
- [ ] Session persists across requests

### Logs Review
- [ ] Vercel Dashboard > Logs shows no errors
- [ ] MongoDB connection successful
- [ ] No rate limit errors (unless expected)
- [ ] Email sending works

---

## 🔄 Frontend Integration

### Update Frontend Config
- [ ] Update API base URL to Vercel deployment URL
- [ ] Ensure `credentials: include` in all requests
- [ ] Update CORS origins if frontend URL changes
- [ ] Test all API calls from frontend
- [ ] Verify session/cookies work

Example frontend config:
```javascript
// adustech/services/config.ts
export const API_BASE_URL = 'https://your-backend.vercel.app/api';

// In API calls
fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  credentials: 'include',  // Important for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## 📊 Monitoring Setup

### Vercel Dashboard
- [ ] Deployment successful and green
- [ ] No errors in real-time logs
- [ ] Function invocations working
- [ ] Response times acceptable

### MongoDB Atlas
- [ ] Connections showing from Vercel
- [ ] No connection errors
- [ ] Alerts configured (optional)
- [ ] Backups enabled (optional)

### Cloudinary
- [ ] Uploads working
- [ ] Storage usage tracked
- [ ] Bandwidth monitored

---

## 🛟 Rollback Plan

### If Deployment Fails
- [ ] Check Vercel logs for errors
- [ ] Verify all environment variables are set
- [ ] Test locally with production env vars
- [ ] Check MongoDB network access
- [ ] Review DEPLOYMENT.md troubleshooting section

### Emergency Rollback
- [ ] Vercel Dashboard > Deployments > Redeploy previous version
- [ ] Frontend can point back to old backend temporarily
- [ ] Document the issue for resolution

---

## 📚 Documentation Review

Before going live, ensure you've read:
- [ ] **README.md** - Understand the API
- [ ] **DEPLOYMENT.md** - Follow deployment steps
- [ ] **SECURITY.md** - Understand security measures
- [ ] **PRODUCTION_READY_SUMMARY.md** - Review all changes

---

## 🎉 Final Checklist

### Before Clicking Deploy
- [ ] All secrets rotated and secure
- [ ] All environment variables set
- [ ] Local tests passing
- [ ] Code committed and pushed
- [ ] Frontend ready for new backend URL
- [ ] Rollback plan understood

### After Deployment
- [ ] Health check passes
- [ ] Registration test successful
- [ ] Email sending works
- [ ] Frontend integration working
- [ ] Logs show no errors
- [ ] Team notified of new backend URL

---

## 🚨 Security Reminder

**CRITICAL ACTIONS REQUIRED:**

1. ⚠️ **The current .env file contains exposed credentials**
   - Change MongoDB password immediately
   - Regenerate all API keys
   - Update in Vercel environment variables

2. ⚠️ **Generate a new SESSION_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. ⚠️ **Never commit .env to git**
   - Verify: `git ls-files | grep .env`
   - Should return nothing

---

## ✅ Ready to Deploy?

If all items above are checked, you're ready to deploy! 🚀

**Deployment Command:**
```bash
# Via Vercel Dashboard (Recommended)
1. Push to Git
2. Import to Vercel
3. Add environment variables
4. Click Deploy

# OR via CLI
cd backend
vercel --prod
```

---

**Good luck with your deployment!** 🎉

Need help? Check:
- DEPLOYMENT.md for step-by-step guide
- SECURITY.md for security best practices
- Vercel Docs: https://vercel.com/docs

---

**Last Updated:** 2025-01-30
