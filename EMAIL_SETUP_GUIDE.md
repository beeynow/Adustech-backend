# ADUSTECH Backend - Email Configuration Guide

## 🎯 Overview

This guide explains how to set up and configure email functionality for the ADUSTECH backend. The system uses Gmail's SMTP service to send emails for:

- ✉️ OTP verification codes (registration)
- 📧 Welcome emails (after verification)
- 🔄 Resend OTP emails
- 🔑 Password reset tokens
- ✅ Password change confirmations
- 👤 Role change notifications

---

## 📋 Prerequisites

- Gmail account: `adustechapp@gmail.com` (or your chosen email)
- 2-Step Verification enabled on Gmail
- App Password generated for the application

---

## 🔐 Step 1: Generate Gmail App Password

### Why App Password?

Gmail requires App Passwords for applications that access your account through SMTP. You **cannot** use your regular Gmail password.

### Steps to Generate:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in if prompted
   - Select **"Mail"** as the app
   - Select **"Other (Custom name)"** as the device
   - Enter: `ADUSTECH Backend`
   - Click **"Generate"**

3. **Copy the 16-character password**
   - Example: `abcd efgh ijkl mnop` (remove spaces)
   - This is your `EMAIL_PASSWORD`

---

## ⚙️ Step 2: Configure Backend

### Update `.env` File

1. Open `backend/.env`
2. Update the email configuration:

```bash
# Email Configuration (Gmail App Password)
EMAIL_USER=adustechapp@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Your generated App Password (no spaces)
```

### Example `.env`:

```bash
# Power Admin
POWER_ADMIN_EMAIL=myusman137@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dcttsbnen
CLOUDINARY_API_KEY=123329878521615
CLOUDINARY_API_SECRET=eeFJsNWoUFRXPByY2nqBaThDYNk

# Email Configuration (Gmail App Password)
EMAIL_USER=adustechapp@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# Session Secret (CHANGE THIS IN PRODUCTION!)
SESSION_SECRET=adustech_beeynow2007_myusman

# Frontend URL (optional - for email links)
FRONTEND_URL=http://localhost:8081

# Environment
NODE_ENV=development

# Port
PORT=5000

# PostgreSQL Database URL
DATABASE_URL=postgresql://postgres:password@host:port/database
```

---

## 🧪 Step 3: Test Email Configuration

### Method 1: Use Test Script (Recommended)

Run the built-in email test script:

```bash
cd backend
node test-email.js
```

This will:
- ✅ Verify email credentials
- ✅ Send test emails for all email types
- ✅ Show detailed results

**Expected Output:**
```
🧪 ADUSTECH Email Testing Script

📧 Email Configuration:
   From: adustechapp@gmail.com
   To: adustechapp@gmail.com
   Password: ✅ SET

🚀 Starting email tests...

📧 Testing OTP Email... ✅ PASSED
📧 Testing Welcome Email... ✅ PASSED
📧 Testing Resend OTP Email... ✅ PASSED
📧 Testing Password Reset Email... ✅ PASSED
📧 Testing Password Changed Email... ✅ PASSED
📧 Testing Role Change Email... ✅ PASSED

==================================================
📊 Test Results:
   ✅ Passed: 6
   ❌ Failed: 0
   📧 Total: 6
==================================================

🎉 All email tests passed!
✅ Email functionality is working correctly.
📬 Check adustechapp@gmail.com for 6 test emails.
```

### Method 2: Test via API

Start the backend server:

```bash
cd backend
npm start
```

Test registration (sends OTP email):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your.email@example.com",
    "password": "testpassword123"
  }'
```

Check the console logs for:
- ✅ `User saved to database`
- ✅ `OTP generated: 123456`
- ✅ `OTP email sent to your.email@example.com`

---

## 📧 Email Types & Triggers

### 1. OTP Email (Registration)
**Trigger:** User registers  
**Endpoint:** `POST /api/auth/register`  
**Contains:** 6-digit verification code  
**Expires:** 10 minutes  

### 2. Welcome Email (Verification)
**Trigger:** User verifies OTP  
**Endpoint:** `POST /api/auth/verify-otp`  
**Contains:** Welcome message, getting started tips  

### 3. Resend OTP Email
**Trigger:** User requests new OTP  
**Endpoint:** `POST /api/auth/resend-otp`  
**Contains:** New 6-digit verification code  
**Expires:** 10 minutes  

### 4. Password Reset Email
**Trigger:** User forgets password  
**Endpoint:** `POST /api/auth/forgot-password`  
**Contains:** 6-digit reset token  
**Expires:** 1 hour  

### 5. Password Changed Email
**Trigger:** User changes/resets password  
**Endpoints:** 
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`  
**Contains:** Confirmation of password change  

### 6. Role Change Email
**Trigger:** Admin changes user role  
**Endpoints:**
- `POST /api/auth/create-admin`
- `POST /api/auth/demote-admin`  
**Contains:** Previous role → New role  

---

## 🔧 Troubleshooting

### Issue 1: "Email not configured" Error

**Symptom:**
```
⚠️ Email transporter not configured. Skipping OTP email.
```

**Solution:**
1. Check `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
2. Restart the backend server
3. Verify no typos in credentials

### Issue 2: "Invalid login" Error

**Symptom:**
```
❌ Error sending OTP email: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**
1. **Use App Password, not regular password**
   - Regular Gmail passwords don't work
   - Generate App Password: https://myaccount.google.com/apppasswords

2. **Enable 2-Step Verification**
   - Required for App Passwords
   - https://myaccount.google.com/security

3. **Remove spaces from App Password**
   - Gmail shows: `abcd efgh ijkl mnop`
   - Use: `abcdefghijklmnop`

### Issue 3: "Connection timeout" Error

**Symptom:**
```
❌ Error sending OTP email: Connection timeout
```

**Solutions:**
1. Check internet connection
2. Check if Gmail SMTP is blocked by firewall
3. Try different network
4. Verify port 587 (SMTP) is not blocked

### Issue 4: Emails Going to Spam

**Solutions:**
1. **Add to safe senders list**
2. **Check SPF/DKIM records** (for custom domains)
3. **Warm up the email** (send gradually increasing volume)
4. **Avoid spam trigger words** (already handled in templates)

### Issue 5: "Daily sending limit exceeded"

**Symptom:**
```
❌ Error: 550 5.7.1 Daily sending quota exceeded
```

**Solutions:**
1. **Gmail free account limits:**
   - 500 emails per day
   - 100 emails per 24 hours for new accounts

2. **Consider upgrading to:**
   - Google Workspace (2000 emails/day)
   - SendGrid (100 emails/day free)
   - AWS SES (pay per use)

---

## 🚀 Production Deployment

### Environment Variables

For production (Railway, Vercel, etc.), set these environment variables:

```bash
EMAIL_USER=adustechapp@gmail.com
EMAIL_PASSWORD=your_app_password_here
FRONTEND_URL=https://adustech.vercel.app
NODE_ENV=production
```

### Railway Deployment

1. Go to Railway project settings
2. Click "Variables"
3. Add:
   - `EMAIL_USER` → `adustechapp@gmail.com`
   - `EMAIL_PASSWORD` → `your_app_password`
4. Redeploy

### Vercel Deployment

1. Go to Vercel project settings
2. Click "Environment Variables"
3. Add the same variables
4. Redeploy

---

## 📊 Email Status Logging

The system logs all email operations:

### Success:
```
✅ OTP email sent to user@example.com
✅ Welcome email sent to user@example.com
✅ Password reset email sent to user@example.com
```

### Failure (with fallback):
```
⚠️ Failed to send OTP email, but user is registered. OTP: 123456
⚠️ Failed to send welcome email, but verification succeeded
⚠️ Failed to send password reset email. Token: 123456
```

**Key Point:** If email fails, the operation still completes successfully. Users can:
- See OTP in server logs (development)
- Request resend OTP
- Contact support for manual assistance

---

## 🔄 Alternative Email Services

If Gmail doesn't work for your use case, you can switch to:

### 1. SendGrid (Recommended for production)

```javascript
// In backend/utils/sendEmail.js
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

### 2. AWS SES

```javascript
const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    auth: {
        user: process.env.AWS_SES_USER,
        pass: process.env.AWS_SES_PASSWORD
    }
});
```

### 3. Mailgun

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASSWORD
    }
});
```

---

## 📱 Mobile App Integration

The mobile app should handle email verification flow:

1. **Registration:**
   - User enters name, email, password
   - App calls `POST /api/auth/register`
   - User receives OTP via email
   - User enters OTP in app
   - App calls `POST /api/auth/verify-otp`

2. **Resend OTP:**
   - User clicks "Resend OTP"
   - App calls `POST /api/auth/resend-otp`
   - New OTP sent to email

3. **Forgot Password:**
   - User enters email
   - App calls `POST /api/auth/forgot-password`
   - User receives reset token via email
   - User enters token and new password
   - App calls `POST /api/auth/reset-password`

---

## ✅ Checklist

Before going live:

- [ ] Generated Gmail App Password
- [ ] Updated `EMAIL_USER` in `.env`
- [ ] Updated `EMAIL_PASSWORD` in `.env`
- [ ] Ran `node test-email.js` successfully
- [ ] Tested registration → OTP email
- [ ] Tested OTP verification → Welcome email
- [ ] Tested forgot password → Reset email
- [ ] Set production environment variables
- [ ] Tested on staging/production
- [ ] Email templates look good on mobile
- [ ] Emails not going to spam

---

## 📞 Support

For email-related issues:

- **Email:** adustechapp@gmail.com
- **Phone:** +234 907 347 1497
- **Documentation:** This file

---

## 📝 Files Modified

This email fix includes changes to:

1. **backend/controllers/authController.js**
   - Added email result checking
   - Added error logging
   - Added OTP/token console logging for debugging

2. **backend/utils/sendEmail.js**
   - Already had proper error handling
   - Returns `{ success, error }` for all functions

3. **backend/.env**
   - Updated to use `adustechapp@gmail.com`
   - Added instructions

4. **backend/.env.example**
   - Added detailed App Password instructions

5. **backend/test-email.js** (NEW)
   - Email testing script
   - Tests all 6 email types

6. **backend/EMAIL_SETUP_GUIDE.md** (NEW)
   - This comprehensive guide

---

## 🎉 Summary

Email functionality is now **production-ready** with:

✅ **Proper error handling** - Operations succeed even if email fails
✅ **Detailed logging** - Easy to debug email issues
✅ **Test script** - Quick verification of email setup
✅ **Fallback** - OTP/tokens logged for manual assistance
✅ **Documentation** - Complete setup and troubleshooting guide

**The system will work even if emails fail**, ensuring users aren't blocked from registration/login due to email issues.

---

*Last Updated: 2026-01-31*
*ADUSTECH Backend Team*
