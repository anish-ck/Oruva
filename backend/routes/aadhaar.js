const express = require('express');
const router = express.Router();
const aadhaarService = require('../services/aadhaarService');

// In-memory storage for KYC data (use database in production)
const kycStore = new Map();
const otpStore = new Map();

// Mock mode - for development when Sandbox API has restrictions
const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * POST /api/aadhaar/generate-otp
 * Generate OTP for Aadhaar verification
 */
router.post('/generate-otp', async (req, res) => {
  try {
    const { aadhaarNumber, email } = req.body;

    // Validate Aadhaar number
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be 12 digits.'
      });
    }

    // Check if already verified
    if (kycStore.has(email) && kycStore.get(email).verified) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar already verified for this account'
      });
    }

    // MOCK MODE - for development
    if (MOCK_MODE) {
      console.log('🎭 MOCK MODE: Simulating OTP generation');
      const mockRefId = `MOCK_${Date.now()}`;
      const mockOTP = '123456'; // Fixed OTP for testing

      otpStore.set(mockRefId, {
        aadhaarNumber,
        otp: mockOTP,
        email,
        timestamp: Date.now()
      });

      return res.json({
        success: true,
        referenceId: mockRefId,
        message: 'OTP sent successfully (MOCK MODE)',
        __mockOTP: mockOTP // Only visible in mock mode
      });
    }

    // Real API Mode
    const result = await aadhaarService.generateOTP(aadhaarNumber);

    if (result.success) {
      // Store ref_id temporarily
      otpStore.set(result.referenceId.toString(), {
        aadhaarNumber,
        email,
        timestamp: Date.now()
      });

      return res.json({
        success: true,
        referenceId: result.referenceId,
        message: result.message
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/aadhaar/verify-otp
 * Verify OTP and fetch user details
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { referenceId, otp, email } = req.body;

    // Validate OTP
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Must be 6 digits.'
      });
    }

    // Get stored data
    const otpData = otpStore.get(referenceId.toString());
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reference ID'
      });
    }

    // MOCK MODE - for development
    if (MOCK_MODE) {
      console.log('🎭 MOCK MODE: Simulating OTP verification');

      // Check OTP
      if (otp !== otpData.otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      // Mock user data
      const mockUserData = {
        name: 'Test User',
        dob: '01-01-1990',
        gender: 'M',
        address: {
          house: '123',
          street: 'Test Street',
          locality: 'Test Locality',
          vtc: 'Test City',
          district: 'Test District',
          state: 'Test State',
          pincode: '123456',
          country: 'India',
          combined: '123, Test Street, Test Locality, Test City, Test District, Test State - 123456'
        },
        aadhaarNumber: 'XXXX XXXX ' + otpData.aadhaarNumber.slice(-4),
        photo: null,
        status: 'VALID'
      };

      // Store KYC data
      kycStore.set(email, {
        ...mockUserData,
        verified: true,
        verifiedAt: new Date().toISOString()
      });

      // Cleanup OTP
      otpStore.delete(referenceId.toString());

      return res.json({
        success: true,
        data: mockUserData,
        message: 'Verification successful (MOCK MODE)'
      });
    }

    // Real API Mode
    const result = await aadhaarService.verifyOTP(referenceId, otp);

    if (result.success) {
      // Store KYC data
      kycStore.set(email, {
        ...result.data,
        verified: true,
        verifiedAt: new Date().toISOString()
      });

      // Cleanup OTP
      otpStore.delete(referenceId.toString());

      return res.json({
        success: true,
        data: result.data,
        message: result.message
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/aadhaar/kyc-status/:email
 * Check if user has completed KYC
 */
router.get('/kyc-status/:email', (req, res) => {
  try {
    const { email } = req.params;
    const kycData = kycStore.get(email);

    if (kycData && kycData.verified) {
      return res.json({
        success: true,
        verified: true,
        data: {
          name: kycData.name,
          dob: kycData.dob,
          gender: kycData.gender,
          verifiedAt: kycData.verifiedAt
        }
      });
    } else {
      return res.json({
        success: true,
        verified: false
      });
    }
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check KYC status'
    });
  }
});

module.exports = router;
