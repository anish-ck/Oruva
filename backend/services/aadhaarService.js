const axios = require('axios');

/**
 * Aadhaar Verification Service using Sandbox API
 * Documentation: https://developer.sandbox.co.in/reference/aadhaar-okyc-generate-otp-api
 */
class AadhaarService {
  constructor() {
    this.apiKey = process.env.SANDBOX_API_KEY;
    this.apiSecret = process.env.SANDBOX_API_SECRET;
    this.baseURL = 'https://api.sandbox.co.in';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate and get access token
   * Must be called before any API requests
   */
  async authenticate() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('🔐 Authenticating with Sandbox API...');

      const response = await axios.post(
        `${this.baseURL}/authenticate`,
        {},
        {
          headers: {
            'x-api-key': this.apiKey,
            'x-api-secret': this.apiSecret,
            'x-api-version': '1.0'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token typically expires in 1 hour, store expiry time
      this.tokenExpiry = Date.now() + (55 * 60 * 1000); // 55 minutes to be safe

      console.log('✅ Authentication successful');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Sandbox API');
    }
  }

  /**
   * Generate OTP for Aadhaar verification
   * @param {string} aadhaarNumber - 12 digit Aadhaar number
   * @returns {Promise<{success: boolean, referenceId: string, message: string}>}
   */
  async generateOTP(aadhaarNumber) {
    try {
      // Get access token
      const token = await this.authenticate();

      console.log(`📱 Generating OTP for Aadhaar: ${aadhaarNumber.substring(0, 4)}...`);

      const response = await axios.post(
        `${this.baseURL}/kyc/aadhaar/okyc/otp`,
        {
          '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
          'aadhaar_number': aadhaarNumber,
          'consent': 'Y',
          'reason': 'For KYC verification'
        },
        {
          headers: {
            'Authorization': token,
            'x-api-key': this.apiKey,
            'x-api-version': '2.0',
            'Content-Type': 'application/json'
          }
        }
      );

      const { data } = response;

      console.log('✅ OTP Generation Response:', data);

      if (data.code === 200 && data.data) {
        return {
          success: true,
          referenceId: data.data.reference_id,
          message: data.data.message || 'OTP sent successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to generate OTP'
        };
      }

    } catch (error) {
      console.error('❌ OTP Generation failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate OTP'
      };
    }
  }

  /**
   * Verify OTP and fetch Aadhaar details
   * @param {string} referenceId - Reference ID from generateOTP
   * @param {string} otp - 6 digit OTP received on Aadhaar-linked mobile
   * @returns {Promise<{success: boolean, data: object, message: string}>}
   */
  async verifyOTP(referenceId, otp) {
    try {
      // Get access token
      const token = await this.authenticate();

      console.log(`🔐 Verifying OTP for reference ID: ${referenceId}`);

      const response = await axios.post(
        `${this.baseURL}/kyc/aadhaar/okyc/otp/verify`,
        {
          '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
          'reference_id': referenceId,
          'otp': otp
        },
        {
          headers: {
            'Authorization': token,
            'x-api-key': this.apiKey,
            'x-api-version': '2.0',
            'Content-Type': 'application/json'
          }
        }
      );

      const { data } = response;

      console.log('✅ OTP Verification Response:', data);

      if (data.code === 200 && data.data && data.data.status === 'VALID') {
        const userData = data.data;
        return {
          success: true,
          data: {
            name: userData.name,
            dob: userData.dob,
            gender: userData.gender,
            address: userData.address,
            aadhaarNumber: userData.aadhaar_number, // Masked format
            photo: userData.photo_link, // Base64 encoded photo
            status: userData.status
          },
          message: userData.message || 'Verification successful'
        };
      } else {
        return {
          success: false,
          message: data.data?.message || data.message || 'Invalid OTP'
        };
      }

    } catch (error) {
      console.error('❌ OTP Verification failed:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify OTP'
      };
    }
  }
}

module.exports = new AadhaarService();
