const nodemailer = require('nodemailer');
const { welcomeEmail, otpEmail, resendOtpEmail, passwordResetEmail, passwordChangedEmail, roleChangeEmail } = require('./emailTemplates');

// Email configuration from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASSWORD not set. Email functionality will be disabled.');
}

const transporter = EMAIL_USER && EMAIL_PASSWORD ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
}) : null;

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping welcome email.');
        return { success: false, error: 'Email not configured' };
    }
    try {
        const mailOptions = {
            from: `"ADUSTECH" <${EMAIL_USER}>`,
            to: email,
            subject: '🎉 Welcome to ADUSTECH - Let\'s Get Started!',
            html: welcomeEmail(name, email)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        return { success: false, error };
    }
};

// Send OTP Email
const sendOtpEmail = async (email, name, otp) => {
    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping OTP email.');
        return { success: false, error: 'Email not configured' };
    }
    try {
        const mailOptions = {
            from: `"ADUSTECH" <${EMAIL_USER}>`,
            to: email,
            subject: '🔐 Your ADUSTECH Verification Code',
            html: otpEmail(name, otp)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return { success: false, error };
    }
};

// Send Resend OTP Email
const sendResendOtpEmail = async (email, name, otp) => {
    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping resend OTP email.');
        return { success: false, error: 'Email not configured' };
    }
    try {
        const mailOptions = {
            from: `"ADUSTECH" <${EMAIL_USER}>`,
            to: email,
            subject: '🔄 Your New ADUSTECH Verification Code',
            html: resendOtpEmail(name, otp)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Resend OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending resend OTP email:', error);
        return { success: false, error };
    }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, name, resetToken) => {
    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping password reset email.');
        return { success: false, error: 'Email not configured' };
    }
    try {
        const mailOptions = {
            from: `"ADUSTECH" <${EMAIL_USER}>`,
            to: email,
            subject: '🔑 Reset Your ADUSTECH Password',
            html: passwordResetEmail(name, resetToken, email)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        return { success: false, error };
    }
};

// Send Password Changed Confirmation Email
const sendPasswordChangedEmail = async (email, name) => {
    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping password changed email.');
        return { success: false, error: 'Email not configured' };
    }
    try {
        const mailOptions = {
            from: `"ADUSTECH" <${EMAIL_USER}>`,
            to: email,
            subject: '✅ Your ADUSTECH Password Has Been Changed',
            html: passwordChangedEmail(name, email)
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Password changed confirmation email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending password changed email:', error);
        return { success: false, error };
    }
};

// Send Role Change Notification
const sendRoleChangeEmail = async (email, name, previousRole, newRole) => {
    if (!transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping role change email.');
        return { success: false, error: 'Email not configured' };
    }
    try {
        const mailOptions = {
            from: `"ADUSTECH" <${EMAIL_USER}>`,
            to: email,
            subject: `👤 Your ADUSTECH Role Changed: ${previousRole || 'user'} → ${newRole}`,
            html: roleChangeEmail(name, email, previousRole, newRole)
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Role change email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending role change email:', error);
        return { success: false, error };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendOtpEmail,
    sendResendOtpEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    sendRoleChangeEmail
};
