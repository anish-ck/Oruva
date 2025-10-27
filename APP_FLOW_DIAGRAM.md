# Oruva App Flow - Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        🏦 ORUVA DEFI BANK                       │
│                     Complete User Flow with KYC                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: LOGIN SCREEN                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        🏦                                  │  │
│  │                  Oruva DeFi Bank                          │  │
│  │              Borrow INR Stablecoin                        │  │
│  │                Flow EVM Testnet                           │  │
│  │                                                           │  │
│  │        [🪄 Login with Magic Link]                        │  │
│  │        [Create New Wallet]                               │  │
│  │        [Import MetaMask Wallet]                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Click "Magic Link"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: EMAIL INPUT                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        🪄                                  │  │
│  │                Magic Link Login                           │  │
│  │                                                           │  │
│  │        ┌─────────────────────────────────┐               │  │
│  │        │  Enter your email               │               │  │
│  │        │  test@oruva.com                 │               │  │
│  │        └─────────────────────────────────┘               │  │
│  │                                                           │  │
│  │              [Send Magic Link]                           │  │
│  │              [Back]                                      │  │
│  │                                                           │  │
│  │        ✨ No password needed - check your email          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Check email → Click link
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND CHECK: KYC STATUS?                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  GET /api/aadhaar/kyc-status/test@oruva.com              │  │
│  │                                                           │  │
│  │  IF verified: true  ──→  Go to MAIN APP (STEP 6)        │  │
│  │  IF verified: false ──→  Show AADHAAR SCREEN (STEP 3)    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ New User (not verified)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: AADHAAR VERIFICATION                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        🔐                                  │  │
│  │              Aadhaar Verification                         │  │
│  │        Complete KYC to access full features               │  │
│  │                                                           │  │
│  │        📱 Enter Aadhaar Number                           │  │
│  │        ┌─────────────────────────────────┐               │  │
│  │        │  XXXX XXXX XXXX                 │               │  │
│  │        │  1234 5678 9012                 │               │  │
│  │        └─────────────────────────────────┘               │  │
│  │                                                           │  │
│  │        ℹ️ OTP will be sent to your Aadhaar-             │  │
│  │           registered mobile number                       │  │
│  │                                                           │  │
│  │              [Generate OTP]                              │  │
│  │              [Skip for now]                              │  │
│  │                                                           │  │
│  │        🔒 Why KYC?                                       │  │
│  │        • Required for INR deposits via Cashfree          │  │
│  │        • Enables higher transaction limits               │  │
│  │        • Complies with Indian regulations                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
        [Generate OTP]                  [Skip for now]
              ↓                               ↓
              ↓                               ↓ (Go to STEP 6 with limited features)
              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: OTP VERIFICATION                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        🔑                                  │  │
│  │                    Enter OTP                              │  │
│  │      OTP sent to Aadhaar-linked mobile ending ****       │  │
│  │                                                           │  │
│  │        🎭 Mock Mode: Use OTP 123456                      │  │
│  │                                                           │  │
│  │        ┌─────────────────────────────────┐               │  │
│  │        │        1 2 3 4 5 6              │               │  │
│  │        └─────────────────────────────────┘               │  │
│  │                                                           │  │
│  │              [Verify OTP]                                │  │
│  │              [Resend OTP]                                │  │
│  │              [← Change Aadhaar Number]                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ OTP = 123456
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: SUCCESS SCREEN                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        ✅                                  │  │
│  │                  KYC Verified!                            │  │
│  │        Your identity has been verified successfully       │  │
│  │                                                           │  │
│  │        📋 Your Details                                   │  │
│  │        ┌─────────────────────────────────────┐           │  │
│  │        │ Name:      Test User                │           │  │
│  │        │ DOB:       01-01-1990               │           │  │
│  │        │ Gender:    Male                     │           │  │
│  │        │ Aadhaar:   XXXX XXXX 9012           │           │  │
│  │        │ Address:   123, Test Street...      │           │  │
│  │        └─────────────────────────────────────┘           │  │
│  │                                                           │  │
│  │            [Create My Wallet →]                          │  │
│  │                                                           │  │
│  │        🔒 Your data is encrypted and stored securely     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Auto-redirect (2 seconds)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: MAIN APP - YOUR VAULT                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Your Vault                                     💰👤🔧🔄  │  │
│  │  0x1234...5678 📋                                         │  │
│  │  Tap to copy full address                                │  │
│  │  ✅ KYC Verified - Test User                            │  │
│  │  ────────────────────────────────────────────────────    │  │
│  │                                                           │  │
│  │  💰 Your Balances                                        │  │
│  │  USDC: 0    oINR: 0                                      │  │
│  │                                                           │  │
│  │  📊 Vault Status                                         │  │
│  │  Collateral: 0 USDC    Debt: 0 oINR                     │  │
│  │  Value: ₹0             Ratio: 0%                         │  │
│  │  ✅ Healthy                                              │  │
│  │                                                           │  │
│  │  🪙 Mint Test USDC                                       │  │
│  │  💵 Deposit Collateral                                   │  │
│  │  💸 Borrow oINR                                          │  │
│  │  🛒 Buy oINR                                             │  │
│  │  💳 Repay Debt                                           │  │
│  │  📱 UPI-Style QR Payments                                │  │
│  │  💰 Earn Passive Income                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ALTERNATIVE: SKIP KYC FLOW                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  If user clicks "Skip for now" in STEP 3:                │  │
│  │                                                           │  │
│  │  ⚠️ Skip KYC?                                            │  │
│  │  Without KYC verification:                               │  │
│  │  ❌ Cannot add INR via Cashfree                          │  │
│  │  ❌ Limited transaction amounts                          │  │
│  │  ❌ Some features unavailable                            │  │
│  │                                                           │  │
│  │  You can complete KYC later from Profile.                │  │
│  │                                                           │  │
│  │        [Go Back]  [Skip KYC]                             │  │
│  │                                                           │  │
│  │  If Skip → Main App with:                                │  │
│  │  ⚠️ Complete KYC to unlock all features                 │  │
│  │  🔒 Add INR button blocked                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RETURNING USER FLOW                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Login with same email → Magic Link → SKIP STEP 3-5      │  │
│  │                                                           │  │
│  │  Backend checks: GET /api/aadhaar/kyc-status/:email      │  │
│  │  Response: { verified: true, data: {...} }               │  │
│  │                                                           │  │
│  │  Direct to STEP 6 (Main App)                             │  │
│  │  Alert: "Welcome Back! Hi Test User! 👋"                 │  │
│  │  ✅ All features unlocked immediately                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  KEY FEATURES                                                   │
│  ────────────────────────────────────────────────────────────   │
│  ✅ Passwordless login via Magic Link                           │
│  ✅ Aadhaar-based KYC verification                              │
│  ✅ Automatic wallet creation                                   │
│  ✅ KYC status persistence                                      │
│  ✅ Feature gating based on KYC                                 │
│  ✅ Skip option with limitations                                │
│  ✅ Mock mode for development                                   │
│  ✅ Smooth user experience                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  MOCK MODE DATA                                                 │
│  ────────────────────────────────────────────────────────────   │
│  Any 12-digit Aadhaar: 123456789012                            │
│  OTP: 123456 (always)                                          │
│  User Data:                                                     │
│    - Name: Test User                                            │
│    - DOB: 01-01-1990                                            │
│    - Gender: M                                                  │
│    - Address: 123, Test Street, Test Locality...               │
│    - Aadhaar: XXXX XXXX 9012                                   │
└─────────────────────────────────────────────────────────────────┘
```
