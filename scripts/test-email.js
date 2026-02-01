#!/usr/bin/env node

/**
 * Email Testing Script for ADUSTECH Backend
 * 
 * ⚠️ IMPORTANT: This script sends ALL email types for TESTING purposes only.
 * In production, each API endpoint sends ONLY the appropriate email type.
 * 
 * Usage:
 *   node test-email.js              - Test all email types
 *   node test-email.js otp          - Test only OTP email
 *   node test-email.js welcome      - Test only welcome email
 *   node test-email.js reset        - Test only password reset email
 *   node test-email.js changed      - Test only password changed email
 *   node test-email.js resend       - Test only resend OTP email
 *   node test-email.js role         - Test only role change email
 */

require('dotenv').config();
const { 
    sendOtpEmail, 
    sendWelcomeEmail, 
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    sendResendOtpEmail,
    sendRoleChangeEmail
} = require('./utils/sendEmail');

const TEST_EMAIL = process.env.TEST_EMAIL || process.env.EMAIL_USER;
const TEST_NAME = 'Test User';
const TEST_TYPE = process.argv[2]?.toLowerCase();

console.log('🧪 ADUSTECH Email Testing Script\n');
console.log('⚠️  NOTE: This is a TEST script that sends emails for testing purposes.');
console.log('   In production, each API endpoint sends ONLY the appropriate email.\n');
console.log('📧 Email Configuration:');
console.log('   From:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   To:', TEST_EMAIL);
console.log('   Password:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Error: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
    console.log('\n📝 Steps to configure:');
    console.log('1. Go to https://myaccount.google.com/apppasswords');
    console.log('2. Generate a new App Password for "Mail"');
    console.log('3. Add to .env file:');
    console.log('   EMAIL_USER=adustechapp@gmail.com');
    console.log('   EMAIL_PASSWORD=your_app_password_here');
    process.exit(1);
}

const allTestFunctions = [
    {
        name: 'OTP Email',
        type: 'otp',
        fn: () => sendOtpEmail(TEST_EMAIL, TEST_NAME, '123456'),
        description: 'Verification code for registration',
        usage: 'Sent when user registers'
    },
    {
        name: 'Welcome Email',
        type: 'welcome',
        fn: () => sendWelcomeEmail(TEST_EMAIL, TEST_NAME),
        description: 'Welcome message after verification',
        usage: 'Sent when user verifies OTP'
    },
    {
        name: 'Resend OTP Email',
        type: 'resend',
        fn: () => sendResendOtpEmail(TEST_EMAIL, TEST_NAME, '789012'),
        description: 'New verification code',
        usage: 'Sent when user requests new OTP'
    },
    {
        name: 'Password Reset Email',
        type: 'reset',
        fn: () => sendPasswordResetEmail(TEST_EMAIL, TEST_NAME, '345678'),
        description: 'Password reset token',
        usage: 'Sent when user forgets password'
    },
    {
        name: 'Password Changed Email',
        type: 'changed',
        fn: () => sendPasswordChangedEmail(TEST_EMAIL, TEST_NAME),
        description: 'Confirmation of password change',
        usage: 'Sent when password is changed/reset'
    },
    {
        name: 'Role Change Email',
        type: 'role',
        fn: () => sendRoleChangeEmail(TEST_EMAIL, TEST_NAME, 'user', 'admin'),
        description: 'Notification of role change',
        usage: 'Sent when admin changes user role'
    }
];

// Filter tests based on command line argument
const testFunctions = TEST_TYPE 
    ? allTestFunctions.filter(t => t.type === TEST_TYPE)
    : allTestFunctions;

if (TEST_TYPE && testFunctions.length === 0) {
    console.error(`❌ Unknown email type: ${TEST_TYPE}`);
    console.log('\n📝 Available types:');
    allTestFunctions.forEach(t => {
        console.log(`   • ${t.type.padEnd(10)} - ${t.name}`);
    });
    console.log('\nUsage: node test-email.js [type]');
    process.exit(1);
}

async function runTests() {
    if (TEST_TYPE) {
        console.log(`🎯 Testing single email type: ${testFunctions[0].name}\n`);
        console.log(`📝 Usage: ${testFunctions[0].usage}\n`);
    } else {
        console.log('🚀 Testing ALL email types...\n');
        console.log('⚠️  WARNING: This will send 6 different emails to test the system.');
        console.log('   In production, each user action triggers only ONE specific email.\n');
    }
    
    let passed = 0;
    let failed = 0;
    
    for (const test of testFunctions) {
        process.stdout.write(`📧 Testing ${test.name}... `);
        
        try {
            const result = await test.fn();
            
            if (result.success) {
                console.log('✅ PASSED');
                console.log(`   → ${test.usage}`);
                passed++;
            } else {
                console.log('❌ FAILED');
                console.log('   Error:', result.error?.message || 'Unknown error');
                failed++;
            }
        } catch (error) {
            console.log('❌ FAILED');
            console.log('   Exception:', error.message);
            failed++;
        }
        
        // Small delay between emails
        if (!TEST_TYPE) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results:');
    console.log('   ✅ Passed:', passed);
    console.log('   ❌ Failed:', failed);
    console.log('   📧 Total:', testFunctions.length);
    console.log('='.repeat(50));
    
    if (failed === 0) {
        console.log('\n🎉 All email tests passed!');
        console.log('✅ Email functionality is working correctly.');
        console.log(`📬 Check ${TEST_EMAIL} for ${passed} test email(s).`);
        
        if (!TEST_TYPE) {
            console.log('\n📋 Production Email Flow:');
            console.log('   1️⃣  User registers → Sends ONLY OTP email');
            console.log('   2️⃣  User verifies → Sends ONLY Welcome email');
            console.log('   3️⃣  User forgets password → Sends ONLY Reset email');
            console.log('   4️⃣  User resets password → Sends ONLY Changed email');
            console.log('   ℹ️  Each action triggers ONLY ONE appropriate email!');
        }
    } else {
        console.log('\n⚠️ Some email tests failed.');
        console.log('📝 Common issues:');
        console.log('   1. Invalid App Password');
        console.log('   2. Gmail security settings blocking access');
        console.log('   3. Network/firewall issues');
        console.log('   4. Email rate limiting');
    }
    
    console.log('\n💡 To test individual email types:');
    console.log('   node test-email.js otp       - Test OTP email only');
    console.log('   node test-email.js welcome   - Test welcome email only');
    console.log('   node test-email.js reset     - Test password reset only');
    
    process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
