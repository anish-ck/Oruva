/**
 * Test Aadhaar Verification API
 * Run: node test-aadhaar.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/aadhaar';

// Test data
const TEST_EMAIL = 'test@example.com';
const TEST_AADHAAR = '123456789012'; // Replace with valid test Aadhaar from Sandbox docs

async function testAadhaarFlow() {
    console.log('\n🧪 Testing Aadhaar Verification Flow...\n');

    try {
        // Step 1: Generate OTP
        console.log('📱 Step 1: Generating OTP...');
        const otpResponse = await axios.post(`${API_BASE}/generate-otp`, {
            aadhaarNumber: TEST_AADHAAR,
            email: TEST_EMAIL
        });

        console.log('✅ OTP Generated:');
        console.log(JSON.stringify(otpResponse.data, null, 2));

        const { ref_id } = otpResponse.data;

        // Step 2: Prompt for OTP (manual input)
        console.log('\n📥 Step 2: Enter OTP');
        console.log('💡 Check Aadhaar-linked mobile for OTP');
        console.log('💡 Or use test OTP from Sandbox docs if available');

        // For automated testing, you'd get OTP from Sandbox test environment
        // const TEST_OTP = '123456'; // Replace with actual test OTP

        console.log('\n⚠️  Manual Test Required:');
        console.log(`   1. Check mobile for OTP`);
        console.log(`   2. Use this curl command to verify:\n`);
        console.log(`curl -X POST http://localhost:3000/api/aadhaar/verify-otp \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -d '{"email":"${TEST_EMAIL}","otp":"YOUR_OTP"}'\n`);

    } catch (error) {
        console.error('❌ Test Failed:');
        console.error(error.response?.data || error.message);
    }
}

// Run test
testAadhaarFlow();
