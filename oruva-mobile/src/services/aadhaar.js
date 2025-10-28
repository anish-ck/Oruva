import axios from 'axios';

// Update this URL based on your backend
const API_BASE_URL = 'http://10.81.135.231:3000/api/aadhaar';
// For testing on physical device, use your computer's IP:
// const API_BASE_URL = 'http://192.168.x.x:3000/api/aadhaar';
// For Expo: const API_BASE_URL = 'http://YOUR_IP:3000/api/aadhaar';

export const aadhaarService = {
    /**
     * Generate OTP for Aadhaar verification
     * @param {string} aadhaarNumber - 12 digit Aadhaar number
     * @param {string} email - User's email
     * @returns {Promise<{success: boolean, referenceId?: string, message?: string, __mockOTP?: string}>}
     */
    async generateOTP(aadhaarNumber, email) {
        try {
            console.log('📱 Generating OTP for:', aadhaarNumber);
            const response = await axios.post(`${API_BASE_URL}/generate-otp`, {
                aadhaarNumber,
                email
            });

            console.log('✅ OTP Generated:', response.data);
            return response.data; // Returns: { success, referenceId, message, __mockOTP }
        } catch (error) {
            console.error('❌ Generate OTP Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to generate OTP'
            };
        }
    },

    /**
     * Verify OTP and get KYC data
     * @param {string} referenceId - Reference ID from generate OTP
     * @param {string} otp - 6 digit OTP
     * @param {string} email - User's email
     * @returns {Promise<{success: boolean, data?: object, message?: string}>}
     */
    async verifyOTP(referenceId, otp, email) {
        try {
            console.log('🔐 Verifying OTP...');
            const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
                referenceId,
                otp,
                email
            });

            console.log('✅ OTP Verified:', response.data);
            return response.data; // Returns: { success, data: {name, dob, address, ...}, message }
        } catch (error) {
            console.error('❌ Verify OTP Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to verify OTP'
            };
        }
    },

    /**
     * Check KYC verification status
     * @param {string} email - User's email
     * @returns {Promise<{success: boolean, verified: boolean, data?: object}>}
     */
    async checkKYCStatus(email) {
        try {
            console.log('📋 Checking KYC status for:', email);
            const response = await axios.get(`${API_BASE_URL}/kyc-status/${email}`);

            console.log('✅ KYC Status:', response.data);
            return response.data; // Returns: { success, verified, data?: {name, dob, ...} }
        } catch (error) {
            console.error('❌ Check KYC Status Error:', error.response?.data || error.message);
            return {
                success: false,
                verified: false,
                message: error.response?.data?.message || 'Failed to check KYC status'
            };
        }
    }
};

export default aadhaarService;
