// Beautiful Email Templates

const emailStyles = `
  <style>
    body { 
      font-family: 'Arial', 'Helvetica', sans-serif; 
      background-color: #f4f4f4; 
      margin: 0; 
      padding: 0; 
    }
    .email-container { 
      max-width: 600px; 
      margin: 40px auto; 
      background-color: #ffffff; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
    }
    .email-header { 
      background: linear-gradient(135deg, #1976D2 0%, #42A5F5 100%); 
      padding: 40px 30px; 
      text-align: center; 
    }
    .email-title { 
      color: #ffffff; 
      font-size: 28px; 
      font-weight: bold; 
      margin: 0; 
    }
    .email-body { 
      padding: 40px 30px; 
    }
    .greeting { 
      font-size: 20px; 
      color: #333333; 
      margin-bottom: 20px; 
    }
    .message { 
      font-size: 16px; 
      color: #666666; 
      line-height: 1.6; 
      margin-bottom: 30px; 
    }
    .otp-box { 
      background: linear-gradient(135deg, #E6F4FE 0%, #F0F8FF 100%); 
      border: 2px dashed #1976D2; 
      border-radius: 12px; 
      padding: 30px; 
      text-align: center; 
      margin: 30px 0; 
    }
    .otp-label { 
      font-size: 14px; 
      color: #1976D2; 
      font-weight: 600; 
      margin-bottom: 10px; 
      text-transform: uppercase; 
      letter-spacing: 1px;
    }
    .otp-code { 
      font-size: 42px; 
      font-weight: bold; 
      color: #1976D2; 
      letter-spacing: 8px; 
      margin: 10px 0; 
      font-family: 'Courier New', monospace;
    }
    .otp-expiry { 
      font-size: 13px; 
      color: #666666; 
      margin-top: 10px; 
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #1976D2 0%, #42A5F5 100%); 
      color: #ffffff; 
      padding: 16px 40px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-size: 16px; 
      font-weight: bold; 
      margin: 20px 0;
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
    }
    .info-box { 
      background-color: #FFF9E6; 
      border-left: 4px solid #F59E0B; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .warning-box { 
      background-color: #FEE2E2; 
      border-left: 4px solid #EF4444; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .success-box { 
      background-color: #D1FAE5; 
      border-left: 4px solid #10B981; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .email-footer { 
      background-color: #f8f9fa; 
      padding: 30px; 
      text-align: center; 
      color: #666666; 
      font-size: 14px; 
    }
    .footer-links { 
      margin: 20px 0; 
    }
    .footer-links a { 
      color: #1976D2; 
      text-decoration: none; 
      margin: 0 15px; 
    }
    .social-icons { 
      margin: 20px 0; 
    }
    .social-icons a { 
      display: inline-block; 
      margin: 0 10px; 
      font-size: 24px; 
      text-decoration: none; 
    }
  </style>
`;

// Welcome Email Template
const welcomeEmail = (name, email) => {
  // Using graduation cap icon instead of image
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ADUSTECH</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">
           <div style="
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#667eea;
  text-align:center;
  line-height:80px;
  font-size:40px;
  box-shadow:0 4px 15px rgba(102,126,234,0.4);
  border:3px solid rgba(255,255,255,0.9);
">
  🎓
</div>

          </div>
          <h1 class="email-title">Welcome to ADUSTECH!</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          
          <p class="message">
            Welcome to <strong>ADUSTECH</strong> - Innovation Simplified! We're thrilled to have you join our community.
          </p>
          
          <div class="success-box">
            <p style="margin: 0; font-size: 16px; color: #065F46;">
              ✅ <strong>Your account has been created successfully!</strong>
            </p>
          </div>
          
          <p class="message">
            Your email address <strong>${email}</strong> has been registered with us. 
            You can now access all the amazing features we offer.
          </p>
          
          <p class="message">
            <strong>What's Next?</strong><br>
            📝 Complete your profile<br>
            🔍 Explore our platform<br>
            📚 Start learning and growing<br>
            👥 Connect with the community
          </p>
          
          <div style="text-align: center;">
            <a href="#" class="button">Get Started</a>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
              <strong>💡 Tip:</strong> Complete your profile to get personalized recommendations and updates.
            </p>
          </div>
          
          <p class="message">
            If you have any questions or need assistance, feel free to reach out to our support team.
          </p>
          
          <p class="message">
            Best regards,<br>
            <strong>The ADUSTECH Team</strong>
          </p>
        </div>
        
        <div class="email-footer">
          <p>© 2024 ADUSTECH. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Help Center</a> | 
            <a href="#">Privacy Policy</a> | 
            <a href="#">Terms of Service</a>
          </div>
          <div class="social-icons">
            <a href="#">📘</a>
            <a href="#">🐦</a>
            <a href="#">📸</a>
            <a href="#">💼</a>
          </div>
          <p style="font-size: 12px; color: #999999; margin-top: 20px;">
            This email was sent to ${email}. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// OTP Verification Email Template
const otpEmail = (name, otp) => {
  // Using graduation cap icon instead of image
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ADUSTECH</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">
            <div style="
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#667eea;
  text-align:center;
  line-height:80px;
  font-size:40px;
  box-shadow:0 4px 15px rgba(102,126,234,0.4);
  border:3px solid rgba(255,255,255,0.9);
">
  🎓
</div>

          </div>
          <h1 class="email-title">Verify Your Email</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          
          <p class="message">
            Thank you for registering with <strong>ADUSTECH</strong>. 
            To complete your registration, please verify your email address using the code below:
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ This code expires in 10 minutes</div>
          </div>
          
          <p class="message">
            Simply enter this code in the app to verify your email address and activate your account.
          </p>
          
          <div class="warning-box">
            <p style="margin: 0; font-size: 14px; color: #991B1B;">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. 
              ADUSTECH will never ask for your verification code via phone or email.
            </p>
          </div>
          
          <p class="message">
            If you didn't request this code, please ignore this email or contact our support team if you have concerns.
          </p>
          
          <p class="message">
            Best regards,<br>
            <strong>The ADUSTECH Team</strong>
          </p>
        </div>
        
        <div class="email-footer">
          <p>© 2024 ADUSTECH. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Help Center</a> | 
            <a href="#">Contact Support</a>
          </div>
          <p style="font-size: 12px; color: #999999; margin-top: 20px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Resend OTP Email Template
const resendOtpEmail = (name, otp) => {
  // Using graduation cap icon instead of image
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Verification Code - ADUSTECH</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">
            <div style="
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#667eea;
  text-align:center;
  line-height:80px;
  font-size:40px;
  box-shadow:0 4px 15px rgba(102,126,234,0.4);
  border:3px solid rgba(255,255,255,0.9);
">
  🎓
</div>

          </div>
          <h1 class="email-title">New Verification Code</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          
          <p class="message">
            You requested a new verification code. Here's your new code:
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Your New Verification Code</div>
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ This code expires in 10 minutes</div>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
              <strong>💡 Note:</strong> Your previous verification code is now invalid. 
              Please use this new code to verify your email.
            </p>
          </div>
          
          <p class="message">
            If you didn't request a new code, please secure your account immediately and contact our support team.
          </p>
          
          <p class="message">
            Best regards,<br>
            <strong>The ADUSTECH Team</strong>
          </p>
        </div>
        
        <div class="email-footer">
          <p>© 2024 ADUSTECH. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Help Center</a> | 
            <a href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password Reset Email Template
const passwordResetEmail = (name, resetToken, email) => {
  // Using graduation cap icon instead of image
  // In production, use actual reset URL
  const resetUrl = `http://localhost:8081/reset-password?token=${resetToken}&email=${email}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ADUSTECH</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">
            <div style="
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#667eea;
  text-align:center;
  line-height:80px;
  font-size:40px;
  box-shadow:0 4px 15px rgba(102,126,234,0.4);
  border:3px solid rgba(255,255,255,0.9);
">
  🎓
</div>

          </div>
          <h1 class="email-title">Reset Your Password</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          
          <p class="message">
            We received a request to reset your password for your ADUSTECH account.
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Your Password Reset Code</div>
            <div class="otp-code">${resetToken}</div>
            <div class="otp-expiry">⏱️ This code expires in 1 hour</div>
          </div>
          
          <p class="message">
            Enter this code in the app to reset your password, or click the button below:
          </p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="warning-box">
            <p style="margin: 0; font-size: 14px; color: #991B1B;">
              <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, 
              please ignore this email and ensure your account is secure. Your password will not be changed.
            </p>
          </div>
          
          <p class="message">
            For security reasons, this link will expire in 1 hour. If you need to reset your password after that, 
            you'll need to submit a new request.
          </p>
          
          <p class="message">
            Best regards,<br>
            <strong>The ADUSTECH Team</strong>
          </p>
        </div>
        
        <div class="email-footer">
          <p>© 2024 ADUSTECH. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Help Center</a> | 
            <a href="#">Contact Support</a>
          </div>
          <p style="font-size: 12px; color: #999999; margin-top: 20px;">
            If you're having trouble with the button above, copy and paste this URL into your browser:<br>
            <span style="color: #1976D2; word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password Changed Confirmation Email Template
const passwordChangedEmail = (name, email) => {
  // Using graduation cap icon instead of image
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed - ADUSTECH</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">
            <div style="
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#667eea;
  text-align:center;
  line-height:80px;
  font-size:40px;
  box-shadow:0 4px 15px rgba(102,126,234,0.4);
  border:3px solid rgba(255,255,255,0.9);
">
  🎓
</div>

          </div>
          <h1 class="email-title">Password Changed Successfully</h1>
        </div>
        
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          
          <div class="success-box">
            <p style="margin: 0; font-size: 16px; color: #065F46;">
              ✅ <strong>Your password has been changed successfully!</strong>
            </p>
          </div>
          
          <p class="message">
            This email confirms that the password for your ADUSTECH account (${email}) was recently changed.
          </p>
          
          <p class="message">
            <strong>Change Details:</strong><br>
            🕐 Date & Time: ${new Date().toLocaleString()}<br>
            📧 Account Email: ${email}
          </p>
          
          <div class="warning-box">
            <p style="margin: 0; font-size: 14px; color: #991B1B;">
              <strong>⚠️ Didn't make this change?</strong><br>
              If you didn't change your password, please contact our support team immediately. 
              Your account security may be at risk.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="#" class="button">Contact Support</a>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
              <strong>💡 Security Tips:</strong><br>
              • Use a strong, unique password<br>
              • Never share your password with anyone<br>
              • Enable two-factor authentication if available<br>
              • Change your password regularly
            </p>
          </div>
          
          <p class="message">
            Thank you for keeping your account secure!
          </p>
          
          <p class="message">
            Best regards,<br>
            <strong>The ADUSTECH Team</strong>
          </p>
        </div>
        
        <div class="email-footer">
          <p>© 2024 ADUSTECH. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Help Center</a> | 
            <a href="#">Security Settings</a> | 
            <a href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Role Change Notification Email Template
const roleChangeEmail = (name, email, previousRole, newRole) => {
  // Using graduation cap icon instead of image
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Role Update - ADUSTECH</title>
      ${emailStyles}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="logo">
            <div style="
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#667eea;
  text-align:center;
  line-height:80px;
  font-size:40px;
  box-shadow:0 4px 15px rgba(102,126,234,0.4);
  border:3px solid rgba(255,255,255,0.9);
">
  🎓
</div>

          </div>
          <h1 class="email-title">Your Role Has Been Updated</h1>
        </div>
        <div class="email-body">
          <p class="greeting">Hello ${name}! 👋</p>
          <div class="info-box">
            <p style="margin: 0; font-size: 16px; color: #92400E;">
              <strong>Account:</strong> ${email}
            </p>
          </div>
          <p class="message">
            This is to inform you that your ADUSTECH account role has been updated.
          </p>
          <div class="otp-box" style="border-style: solid;">
            <div class="otp-label">Previous Role</div>
            <div class="otp-code" style="font-size:24px; letter-spacing: 2px;">${previousRole || 'user'}</div>
            <div class="otp-label" style="margin-top: 12px;">New Role</div>
            <div class="otp-code" style="font-size:24px; letter-spacing: 2px; color:#10B981;">${newRole}</div>
          </div>
          <p class="message">
            If you have questions about this change, please contact support or your administrator.
          </p>
          <p class="message">Best regards,<br><strong>The ADUSTECH Team</strong></p>
        </div>
        <div class="email-footer">
          <p>© 2024 ADUSTECH. All rights reserved.</p>
          <div class="footer-links">
            <a href="#">Help Center</a> | <a href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  welcomeEmail,
  otpEmail,
  resendOtpEmail,
  passwordResetEmail,
  passwordChangedEmail,
  roleChangeEmail,
};
