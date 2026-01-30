# 🔒 Security Guide

This document outlines the security measures implemented in the ADUSTECH backend and best practices for maintaining security.

## ✅ Implemented Security Features

### 1. Authentication & Authorization
- **Session-based authentication** with MongoDB store
- **Role-based access control** (power admin, admin, d-admin, user)
- **Email verification** via OTP before account activation
- **Password hashing** using bcrypt with salt rounds
- **Secure session cookies** (httpOnly, secure in production)

### 2. Input Validation & Sanitization
- **express-validator** on all routes with user input
- **express-mongo-sanitize** prevents NoSQL injection attacks
- **Field length limits** to prevent buffer overflow
- **Email validation** and normalization
- **Type checking** for all parameters

### 3. Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 10 requests per 15 minutes per IP
- **Prevents brute force attacks** on login/registration
- **DDoS protection** at application level

### 4. HTTP Security Headers (Helmet)
- Content Security Policy disabled (API-only)
- X-DNS-Prefetch-Control
- X-Frame-Options (prevents clickjacking)
- X-Content-Type-Options (prevents MIME sniffing)
- Strict-Transport-Security (HSTS in production)
- X-Download-Options
- X-Permitted-Cross-Domain-Policies

### 5. CORS Configuration
- **Whitelist-based origins** from environment variable
- **Credentials allowed** for session cookies
- **Specific HTTP methods** (GET, POST, PUT, DELETE, PATCH)
- **Limited headers** allowed

### 6. Data Protection
- **Passwords never logged or exposed** in responses
- **OTP tokens expire** after 10 minutes
- **Password reset tokens expire** after 1 hour
- **Session expiry** after 7 days of inactivity
- **Sensitive fields excluded** from API responses

### 7. Error Handling
- **Generic error messages** in production
- **Detailed errors** only in development
- **Stack traces hidden** from clients
- **Errors logged** for debugging

---

## 🚨 Critical Security Actions Required

### IMMEDIATELY After Deployment

1. **Change Default Credentials**
   ```bash
   # Generate a new secure SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Update in Vercel environment variables
   vercel env rm SESSION_SECRET production
   vercel env add SESSION_SECRET production
   ```

2. **Rotate Exposed Credentials**
   - The `.env` file contains exposed credentials
   - **Change MongoDB password** in Atlas
   - **Regenerate Cloudinary API keys**
   - **Generate new Gmail App Password**
   - **Update all in Vercel env vars**

3. **Secure Git Repository**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   
   # Remove .env from git history if committed
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

4. **Configure CORS Properly**
   ```bash
   # Set actual frontend URL(s)
   vercel env add ALLOWED_ORIGINS production
   # Enter: https://your-actual-frontend.vercel.app
   ```

---

## 🛡️ Best Practices

### Password Security
- ✅ **DO**: Use bcrypt with appropriate cost factor (10+)
- ✅ **DO**: Enforce minimum password length (6+ characters)
- ✅ **DO**: Never log passwords
- ❌ **DON'T**: Store passwords in plain text
- ❌ **DON'T**: Send passwords via email

### Session Management
- ✅ **DO**: Use secure, httpOnly cookies
- ✅ **DO**: Implement session expiration
- ✅ **DO**: Use MongoDB session store (not memory)
- ✅ **DO**: Regenerate session ID after login
- ❌ **DON'T**: Store sessions in JWT tokens
- ❌ **DON'T**: Use default session secrets

### API Security
- ✅ **DO**: Validate all inputs
- ✅ **DO**: Sanitize user data
- ✅ **DO**: Implement rate limiting
- ✅ **DO**: Use HTTPS in production
- ❌ **DON'T**: Trust client data
- ❌ **DON'T**: Expose internal errors

### Database Security
- ✅ **DO**: Use parameterized queries (Mongoose does this)
- ✅ **DO**: Implement least privilege access
- ✅ **DO**: Enable MongoDB encryption at rest
- ✅ **DO**: Regular backups
- ❌ **DON'T**: Use root database credentials
- ❌ **DON'T**: Allow all IP addresses (unless necessary)

---

## 🔍 Security Auditing

### Regular Security Checks

1. **Dependency Vulnerabilities**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Code Analysis**
   ```bash
   # Install security linter
   npm install -g eslint-plugin-security
   
   # Run security checks
   eslint . --ext .js
   ```

3. **Environment Variable Audit**
   - Review all environment variables quarterly
   - Rotate secrets every 90 days
   - Remove unused variables

4. **Access Log Review**
   - Monitor Vercel function logs
   - Check for suspicious patterns
   - Set up alerts for errors

---

## 🚫 Known Vulnerabilities to Address

### High Priority

1. **Session Secret in Code**
   - ⚠️ Default fallback session secret exists
   - **Action**: Ensure `SESSION_SECRET` is always set in production
   - **Check**: Warning logged if default is used

2. **No Request ID Tracking**
   - ⚠️ Difficult to trace requests across logs
   - **Action**: Consider adding request ID middleware
   - **Impact**: Low (helpful for debugging)

3. **No API Versioning**
   - ⚠️ Breaking changes affect all clients
   - **Action**: Consider adding `/api/v1/` prefix
   - **Impact**: Medium (future-proofing)

### Medium Priority

1. **No Account Lockout**
   - ⚠️ Unlimited login attempts (rate limited only)
   - **Action**: Consider adding account lockout after N failed attempts
   - **Impact**: Medium (rate limiting provides partial protection)

2. **Image Size Validation After Upload**
   - ⚠️ Large images parsed before validation
   - **Action**: Validate size before parsing (already limited to 15MB)
   - **Impact**: Low (DoS potential is limited)

3. **No Security Headers for API Responses**
   - ⚠️ Content-Type not enforced
   - **Action**: Add response header middleware
   - **Impact**: Low (API-only, not serving HTML)

### Low Priority

1. **No 2FA Support**
   - ℹ️ Only email verification available
   - **Action**: Consider adding TOTP 2FA
   - **Impact**: Low (email OTP provides basic verification)

2. **No IP Whitelist for Admin**
   - ℹ️ Admins can access from anywhere
   - **Action**: Consider IP-based restrictions
   - **Impact**: Low (may limit legitimate use)

---

## 📋 Security Checklist

Use this checklist before going to production:

- [ ] All environment variables set in Vercel
- [ ] `SESSION_SECRET` is secure (32+ random characters)
- [ ] MongoDB password changed from exposed credentials
- [ ] Cloudinary API keys regenerated
- [ ] Gmail App Password regenerated
- [ ] `.env` file not committed to git
- [ ] `ALLOWED_ORIGINS` contains only actual frontend URLs
- [ ] MongoDB Atlas network access configured
- [ ] Rate limiting tested and working
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Error handling doesn't expose sensitive info
- [ ] Admin accounts created and tested
- [ ] Password reset flow tested
- [ ] Email sending tested
- [ ] Session persistence tested
- [ ] CORS tested with actual frontend
- [ ] All API endpoints validated with test requests
- [ ] Logs reviewed for security warnings
- [ ] Database backups enabled
- [ ] Monitoring set up

---

## 🚨 Incident Response

If you suspect a security breach:

1. **Immediate Actions**
   - Rotate all credentials immediately
   - Review access logs for suspicious activity
   - Check database for unauthorized changes
   - Notify affected users if data was accessed

2. **Investigation**
   - Download all logs from Vercel
   - Check MongoDB Atlas activity logs
   - Review Cloudinary access logs
   - Identify attack vector

3. **Remediation**
   - Patch vulnerability
   - Update security measures
   - Deploy fixes
   - Monitor for repeated attempts

4. **Documentation**
   - Document the incident
   - Record lessons learned
   - Update security procedures
   - Train team on new measures

---

## 📞 Security Contact

For security issues, contact: [Your security contact email]

**Please do not file public GitHub issues for security vulnerabilities.**

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Vercel Security](https://vercel.com/docs/security)

---

**Last Updated:** 2025-01-30  
**Next Review Date:** 2025-04-30
