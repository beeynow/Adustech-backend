# ADUSTECH Backend - Email Flow Explained

## 🎯 Important: One Action = One Email

**Each user action triggers ONLY ONE specific email type.**  
The system is designed to send the right email at the right time.

---

## ✅ Production Email Flow

### 1. User Registration Flow

**Action:** User registers with name, email, password  
**API:** `POST /api/auth/register`  
**Email Sent:** 🔐 **OTP Email ONLY**  

```
User fills form → API creates user → Sends OTP email → Done
                                    (ONE email sent)
```

**Email Contains:**
- 6-digit OTP code
- Valid for 10 minutes
- Instructions to verify

**Code Location:** `authController.js` line 57
```javascript
const emailResult = await sendOtpEmail(email, name, otp);
```

---

### 2. Email Verification Flow

**Action:** User enters OTP code  
**API:** `POST /api/auth/verify-otp`  
**Email Sent:** 🎉 **Welcome Email ONLY**  

```
User enters OTP → API verifies → Sends welcome email → Done
                                 (ONE email sent)
```

**Email Contains:**
- Welcome message
- Getting started tips
- Support information

**Code Location:** `authController.js` line 104
```javascript
const emailResult = await sendWelcomeEmail(updated.email, updated.name);
```

---

### 3. Resend OTP Flow

**Action:** User requests new OTP  
**API:** `POST /api/auth/resend-otp`  
**Email Sent:** 🔄 **Resend OTP Email ONLY**  

```
User clicks "Resend" → API generates new OTP → Sends resend email → Done
                                                (ONE email sent)
```

**Email Contains:**
- New 6-digit OTP code
- Valid for 10 minutes
- Instructions to verify

**Code Location:** `authController.js` line 135
```javascript
const emailResult = await sendResendOtpEmail(email, user.name, otp);
```

---

### 4. Forgot Password Flow

**Action:** User forgets password  
**API:** `POST /api/auth/forgot-password`  
**Email Sent:** 🔑 **Password Reset Email ONLY**  

```
User enters email → API generates token → Sends reset email → Done
                                         (ONE email sent)
```

**Email Contains:**
- 6-digit reset token
- Valid for 1 hour
- Instructions to reset

**Code Location:** `authController.js` line 221
```javascript
const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);
```

---

### 5. Reset Password Flow

**Action:** User resets password with token  
**API:** `POST /api/auth/reset-password`  
**Email Sent:** ✅ **Password Changed Email ONLY**  

```
User enters token + new password → API updates → Sends confirmation → Done
                                                 (ONE email sent)
```

**Email Contains:**
- Confirmation of password change
- Security notice
- Support contact if not user

**Code Location:** `authController.js` line 257
```javascript
const emailResult = await sendPasswordChangedEmail(user.email, user.name);
```

---

### 6. Change Password Flow (Authenticated)

**Action:** User changes password while logged in  
**API:** `POST /api/auth/change-password`  
**Email Sent:** ✅ **Password Changed Email ONLY**  

```
User enters old + new password → API verifies & updates → Sends confirmation → Done
                                                          (ONE email sent)
```

**Email Contains:**
- Same as reset password confirmation

**Code Location:** `authController.js` line 287
```javascript
const emailResult = await sendPasswordChangedEmail(user.email, user.name);
```

---

### 7. Create/Promote Admin Flow

**Action:** Power admin creates or promotes user to admin  
**API:** `POST /api/auth/create-admin`  
**Email Sent:** 👤 **Role Change Email ONLY**  

```
Power admin assigns role → API updates user → Sends notification → Done
                                              (ONE email sent)
```

**Email Contains:**
- Previous role → New role
- Congratulations message
- New permissions info

**Code Locations:** 
- Line 332 (promote existing user)
- Line 350 (create new admin)

---

### 8. Demote Admin Flow

**Action:** Power admin demotes admin to user  
**API:** `POST /api/auth/demote-admin`  
**Email Sent:** 👤 **Role Change Email ONLY**  

```
Power admin demotes → API updates role → Sends notification → Done
                                        (ONE email sent)
```

**Email Contains:**
- Previous role → New role
- Role change notice

**Code Location:** `authController.js` line 413
```javascript
const emailResult = await sendRoleChangeEmail(user.email, user.name, previousRole, 'user');
```

---

## 📊 Summary Table

| User Action | API Endpoint | Email Sent | Count |
|------------|--------------|------------|-------|
| **Register** | POST /api/auth/register | OTP Email | 1️⃣ |
| **Verify OTP** | POST /api/auth/verify-otp | Welcome Email | 1️⃣ |
| **Resend OTP** | POST /api/auth/resend-otp | Resend OTP Email | 1️⃣ |
| **Forgot Password** | POST /api/auth/forgot-password | Password Reset Email | 1️⃣ |
| **Reset Password** | POST /api/auth/reset-password | Password Changed Email | 1️⃣ |
| **Change Password** | POST /api/auth/change-password | Password Changed Email | 1️⃣ |
| **Create Admin** | POST /api/auth/create-admin | Role Change Email | 1️⃣ |
| **Demote Admin** | POST /api/auth/demote-admin | Role Change Email | 1️⃣ |

**Total:** 8 different actions, each sends **exactly 1 email**.

---

## 🧪 Testing vs Production

### Test Script Behavior

When you run `node test-email.js`, it tests ALL email types:

```bash
node test-email.js
```

**Result:** Sends 6 emails (for testing purposes)
- ✉️ OTP Email
- ✉️ Welcome Email
- ✉️ Resend OTP Email
- ✉️ Password Reset Email
- ✉️ Password Changed Email
- ✉️ Role Change Email

**⚠️ This is INTENTIONAL for testing!**

### Test Individual Email Types

You can test one email type at a time:

```bash
# Test only OTP email
node test-email.js otp

# Test only welcome email
node test-email.js welcome

# Test only password reset
node test-email.js reset

# Test only password changed
node test-email.js changed

# Test only resend OTP
node test-email.js resend

# Test only role change
node test-email.js role
```

**Result:** Sends only 1 email

---

## 🔍 How to Verify Correct Behavior

### 1. Check Server Logs

When a user registers, you should see:
```
📝 Registration attempt: { name: 'John', email: 'john@example.com' }
✅ User saved to database
📧 OTP generated: 123456 (for testing - check this in console)
✅ OTP email sent to john@example.com
```

**Note:** Only ONE email log entry!

### 2. Check User's Inbox

User should receive ONLY ONE email based on their action:
- Registered? → Receives OTP email only
- Verified? → Receives welcome email only
- Forgot password? → Receives reset email only

### 3. Test via API

Register a test user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected:**
- ✅ Response: "User registered. Please verify OTP sent to email."
- ✅ ONE email sent: OTP email
- ❌ NO welcome email
- ❌ NO other emails

---

## ❌ Common Misconceptions

### Misconception 1: "All users receive all email types"

**FALSE!** Each user receives only the email for their specific action.

### Misconception 2: "Test script represents production behavior"

**FALSE!** The test script sends all emails for testing. Production sends one.

### Misconception 3: "Registration sends welcome email immediately"

**FALSE!** Registration sends OTP email. Welcome email is sent after OTP verification.

---

## ✅ Correct Understanding

1. **Registration** → User receives **1 email** (OTP)
2. **Verification** → User receives **1 email** (Welcome)
3. **Forgot Password** → User receives **1 email** (Reset)
4. **Reset Password** → User receives **1 email** (Changed)

**Each action = 1 specific email**

---

## 🎯 Why This Design?

### Benefits:

1. **No Email Spam**
   - Users only get relevant emails
   - No confusion with multiple emails

2. **Clear Purpose**
   - Each email has a specific purpose
   - User knows why they received it

3. **Better User Experience**
   - Not overwhelmed with emails
   - Clear next steps

4. **Compliance**
   - Follows email best practices
   - Reduces spam complaints

---

## 🔧 Code Architecture

### Email Functions (utils/sendEmail.js)

Each function is independent and sends ONE email type:

```javascript
sendOtpEmail(email, name, otp)           // Registration
sendWelcomeEmail(email, name)            // Verification
sendResendOtpEmail(email, name, otp)     // Resend OTP
sendPasswordResetEmail(email, name, token) // Forgot password
sendPasswordChangedEmail(email, name)    // Password changed
sendRoleChangeEmail(email, name, old, new) // Role change
```

### Controller Logic (controllers/authController.js)

Each endpoint calls ONLY the appropriate email function:

```javascript
// Registration endpoint
exports.register = async (req, res) => {
    // ... create user ...
    await sendOtpEmail(email, name, otp);  // ONE email call
    // ... respond ...
};

// Verification endpoint
exports.verifyOTP = async (req, res) => {
    // ... verify OTP ...
    await sendWelcomeEmail(email, name);   // ONE email call
    // ... respond ...
};

// And so on for each endpoint...
```

**Pattern:** One endpoint → One email function → One email sent

---

## 🧪 Testing Individual Flows

### Test Registration Flow:
```bash
# Step 1: Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Expected: 1 OTP email received
# Check console for: ✅ OTP email sent to test@example.com

# Step 2: Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# Expected: 1 Welcome email received
# Check console for: ✅ Welcome email sent to test@example.com
```

**Total emails in complete flow:** 2 emails (OTP + Welcome)  
**But each action sent only 1 email!**

---

## 📞 Support

If you're still receiving multiple emails per action:

1. **Check your code** - Ensure you haven't called multiple email functions
2. **Check email logs** - Console should show only ONE email per action
3. **Check test script** - Are you running the test script vs using the API?

**Contact:**
- Email: adustechapp@gmail.com
- Phone: +234 907 347 1497

---

## 🎉 Summary

✅ **Production:** Each user action sends ONLY 1 email  
✅ **Test Script:** Sends all 6 emails for testing (intentional)  
✅ **Code:** Each endpoint calls only 1 email function  
✅ **Design:** One action = One email = Happy users  

**Your email system is working correctly!** 🚀

---

*Last Updated: 2026-01-31*  
*Status: ✅ Working as designed*  
*Email Flow: Perfect!*
