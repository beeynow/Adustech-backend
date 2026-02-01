#!/usr/bin/env node

/**
 * Email Testing Script for ADUSTECH Backend
 * 
 * This script tests email functionality without starting the full server.
 * Run: node test-email.js
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

console.log('🧪 ADUSTECH Email Testing Script\n');
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

const testFunctions = [
    {
        name: 'OTP Email',
        fn: () => sendOtpEmail(TEST_EMAIL, TEST_NAME, '123456'),
        description: 'Verification code for registration'
    },
    {
        name: 'Welcome Email',
        fn: () => sendWelcomeEmail(TEST_EMAIL, TEST_NAME),
        description: 'Welcome message after verification'
    },
    {
        name: 'Resend OTP Email',
        fn: () => sendResendOtpEmail(TEST_EMAIL, TEST_NAME, '789012'),
        description: 'New verification code'
    },
    {
        name: 'Password Reset Email',
        fn: () => sendPasswordResetEmail(TEST_EMAIL, TEST_NAME, '345678'),
        description: 'Password reset token'
    },
    {
        name: 'Password Changed Email',
        fn: () => sendPasswordChangedEmail(TEST_EMAIL, TEST_NAME),
        description: 'Confirmation of password change'
    },
    {
        name: 'Role Change Email',
        fn: () => sendRoleChangeEmail(TEST_EMAIL, TEST_NAME, 'user', 'admin'),
        description: 'Notification of role change'
    }
];

async function runTests() {
    console.log('🚀 Starting email tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of testFunctions) {
        process.stdout.write(`📧 Testing ${test.name}... `);
        
        try {
            const result = await test.fn();
            
            if (result.success) {
                console.log('✅ PASSED');
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
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        console.log(`📬 Check ${TEST_EMAIL} for ${passed} test emails.`);
    } else {
        console.log('\n⚠️ Some email tests failed.');
        console.log('📝 Common issues:');
        console.log('   1. Invalid App Password');
        console.log('   2. Gmail security settings blocking access');
        console.log('   3. Network/firewall issues');
        console.log('   4. Email rate limiting');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
