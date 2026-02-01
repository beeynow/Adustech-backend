const { prisma } = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { 
    sendWelcomeEmail,
    sendOtpEmail,
    sendResendOtpEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    sendRoleChangeEmail
} = require('../utils/sendEmail');

const POWER_ADMIN_EMAIL = process.env.POWER_ADMIN_EMAIL || '';

// Generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Register User and Send OTP
exports.register = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log('📝 Registration attempt:', { name: req.body.name, email: req.body.email });
        }
        
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
            return res.status(400).json({ message: 'User already exists'});
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = email === POWER_ADMIN_EMAIL ? 'power' : 'user';
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiry,
                role
            }
        });
        
        console.log('✅ User registered successfully:', email);
        
        // In development, log OTP for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 [DEV] OTP:', otp);
        }

        // Send OTP email
        const emailResult = await sendOtpEmail(email, name, otp);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send OTP email to', email);
            // In development, show OTP in error for manual verification
            if (process.env.NODE_ENV === 'development') {
                console.error('📧 [DEV] Use this OTP:', otp);
            }
        }

        res.status(201).json({ message: 'User registered. Please verify OTP sent to email.' });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const now = new Date();

        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        
        if (!user.otp || !user.otpExpiry || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        
        if (user.otpExpiry < now) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Update user to verified and clear OTP
        const updated = await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                otp: null,
                otpExpiry: null
            }
        });

        // Send welcome email upon successful verification
        const emailResult = await sendWelcomeEmail(updated.email, updated.name);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send welcome email, but verification succeeded');
        }
        
        return res.json({ message: 'Email verified successfully. you can now log in.', isVerified: updated.isVerified });
    } catch (error) {
        console.error('❌ Verify OTP error:', error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(400).json({ message: 'User not found'});
        if (user.isVerified) return res.status(400).json({ message: 'User already verified'});

        const otp = generateOTP();
        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        // In development, log OTP for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 [DEV] Resend OTP:', otp);
        }
        
        const emailResult = await sendResendOtpEmail(email, user.name, otp);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send resend OTP email to', email);
            if (process.env.NODE_ENV === 'development') {
                console.error('📧 [DEV] Use this OTP:', otp);
            }
        }

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('❌ Resend OTP error:', error);
        res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(400).json({ message: 'User not found'});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password'});

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify OTP.'});
        }

        // Ensure POWER_ADMIN_EMAIL always has role 'power'
        let userRole = user.role;
        if (user.email === POWER_ADMIN_EMAIL && user.role !== 'power') {
            await prisma.user.update({
                where: { email },
                data: { role: 'power' }
            });
            userRole = 'power';
        }

        // Store user session
        req.session.user = { id: user.id, email: user.email, name: user.name, role: userRole };
        
        // Return user data along with success message
        res.status(200).json({ 
            message: 'Login successful', 
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name,
                role: userRole,
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Logout User
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out'});
        res.json({ message: 'Logged out successfully' });
    });
};

// Dashboard (Protected Route)
exports.dashboard = async (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.session.user.name}`, user: req.session.user });
};

// Forgot Password - generate reset code and email it
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });

        const resetToken = crypto.randomInt(100000, 999999).toString();
        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            }
        });

        // In development, log token for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 [DEV] Reset token:', resetToken);
        }
        
        const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send password reset email to', email);
            if (process.env.NODE_ENV === 'development') {
                console.error('📧 [DEV] Use this token:', resetToken);
            }
        }
        
        res.json({ message: 'Password reset code sent to your email.' });
    } catch (error) {
        console.error('Forgot password error', error);
        res.status(500).json({ message: 'Error initiating password reset' });
    }
};

// Reset Password with code
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid reset request' });

        if (!user.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordToken !== token) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }
        if (user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashed,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        const emailResult = await sendPasswordChangedEmail(user.email, user.name);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send password changed email');
        }
        
        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

// Change Password (authenticated)
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

        await prisma.user.update({
            where: { id: userId },
            data: { password: await bcrypt.hash(newPassword, 10) }
        });

        const emailResult = await sendPasswordChangedEmail(user.email, user.name);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send password changed email');
        }
        
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change password error', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

// Create Admin (power admin only)
exports.createAdmin = async (req, res) => {
    try {
        const requester = req.session.user;
        if (!requester || requester.role !== 'power') {
            return res.status(403).json({ message: 'Forbidden: Only power admin can create admins' });
        }

        const { email, name, password, role } = req.body;
        if (!email || !name || !password || !role) {
            return res.status(400).json({ message: 'name, email, password and role are required' });
        }
        if (!['admin', 'd-admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Allowed: admin, d-admin' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            // Enforce single position per email
            if (existing.role !== 'user') {
                return res.status(400).json({ message: 'This email already has a position assigned' });
            }
            const previousRole = existing.role || 'user';
            const updated = await prisma.user.update({
                where: { email },
                data: {
                    name,
                    password: await bcrypt.hash(password, 10),
                    role,
                    isVerified: true
                }
            });
            // Notify user of role change
            const emailResult = await sendRoleChangeEmail(updated.email, updated.name, previousRole, role);
            if (!emailResult.success) {
                console.error('⚠️ Failed to send role change email');
            }
            return res.json({ message: 'User promoted to admin successfully', user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role } });
        }

        const hashed = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role,
                isVerified: true
            }
        });
        // Notify user of role change
        const emailResult = await sendRoleChangeEmail(newAdmin.email, newAdmin.name, 'user', role);
        if (!emailResult.success) {
            console.error('⚠️ Failed to send role change email');
        }
        return res.status(201).json({ message: 'Admin created successfully', user: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role } });
    } catch (error) {
        console.error('Create admin error', error);
        res.status(500).json({ message: 'Error creating admin' });
    }
};

// List Admins (power admin only)
exports.listAdmins = async (req, res) => {
    try {
        const requester = req.session.user;
        if (!requester || requester.role !== 'power') {
            return res.status(403).json({ message: 'Forbidden: Only power admin can list admins' });
        }
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ['power', 'admin', 'd-admin'] }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.json({ admins });
    } catch (error) {
        console.error('List admins error', error);
        res.status(500).json({ message: 'Error listing admins' });
    }
};

// Demote Admin to user (power admin only)
exports.demoteAdmin = async (req, res) => {
    try {
        const requester = req.session.user;
        if (!requester || requester.role !== 'power') {
            return res.status(403).json({ message: 'Forbidden: Only power admin can demote admins' });
        }
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'user') return res.status(400).json({ message: 'User is not an admin' });
        
        // Prevent demoting the primary power admin
        if (user.role === 'power' && email === POWER_ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Cannot demote the primary power admin' });
        }
        
        const previousRole = user.role;
        await prisma.user.update({
            where: { email },
            data: { role: 'user' }
        });
        
        // Notify user of role change
        const emailResult = await sendRoleChangeEmail(user.email, user.name, previousRole, 'user');
        if (!emailResult.success) {
            console.error('⚠️ Failed to send role change email');
        }
        
        res.json({ message: 'Admin demoted to user successfully' });
    } catch (error) {
        console.error('Demote admin error', error);
        res.status(500).json({ message: 'Error demoting admin' });
    }
};
