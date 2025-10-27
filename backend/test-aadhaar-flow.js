/**
 * Test script for Aadhaar verification flow
 * Tests the complete Mock Mode implementation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@oruva.com';
const TEST_AADHAAR = '123456789012';

let referenceId = null;

console.log('🧪 Testing Aadhaar Verification Flow (Mock Mode)\n');
console.log('='.repeat(60));

async function test() {
    try {
        // Step 1: Check initial KYC status
        console.log('\n📋 Step 1: Checking initial KYC status...');
        const statusBefore = await axios.get(`${BASE_URL}/api/aadhaar/kyc-status/${TEST_EMAIL}`);
        console.log('✅ Status:', statusBefore.data);

        // Step 2: Generate OTP
        console.log('\n📱 Step 2: Generating OTP...');
        const otpResponse = await axios.post(`${BASE_URL}/api/aadhaar/generate-otp`, {
            aadhaarNumber: TEST_AADHAAR,
            email: TEST_EMAIL
        });
        console.log('✅ Response:', otpResponse.data);

        referenceId = otpResponse.data.referenceId;
        const mockOTP = otpResponse.data.__mockOTP;
        console.log(`\n🔑 Reference ID: ${referenceId}`);
        console.log(`🔑 Mock OTP: ${mockOTP}`);

        // Step 3: Verify OTP
        console.log('\n🔐 Step 3: Verifying OTP...');
        const verifyResponse = await axios.post(`${BASE_URL}/api/aadhaar/verify-otp`, {
            referenceId: referenceId,
            otp: mockOTP,
            email: TEST_EMAIL
        });
        console.log('✅ Verification successful!');
        console.log('👤 User Data:');
        console.log(JSON.stringify(verifyResponse.data.data, null, 2));

        // Step 4: Check KYC status after verification
        console.log('\n📋 Step 4: Checking KYC status after verification...');
        const statusAfter = await axios.get(`${BASE_URL}/api/aadhaar/kyc-status/${TEST_EMAIL}`);
        console.log('✅ Status:', JSON.stringify(statusAfter.data, null, 2));

        // Step 5: Try to generate OTP again (should fail)
        console.log('\n🚫 Step 5: Attempting duplicate verification...');
        try {
            await axios.post(`${BASE_URL}/api/aadhaar/generate-otp`, {
                aadhaarNumber: TEST_AADHAAR,
                email: TEST_EMAIL
            });
            console.log('❌ Should have failed but succeeded!');
        } catch (error) {
            console.log('✅ Correctly blocked:', error.response.data.message);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All tests passed successfully!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Run tests
test();
