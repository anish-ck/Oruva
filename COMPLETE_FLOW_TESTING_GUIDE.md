# Complete App Flow Testing Guide

## 🎯 Overview

This guide walks through testing the complete Oruva DeFi Bank flow with Aadhaar KYC integration.

## 📋 Prerequisites

### Backend Setup
1. Backend server running on port 3000
2. Mock Mode enabled (`MOCK_MODE=true` in `.env`)
3. All Aadhaar endpoints working

### Mobile App Setup
1. Update `API_BASE_URL` in `/oruva-mobile/src/services/aadhaar.js`:
   ```javascript
   // For Expo on same machine
   const API_BASE_URL = 'http://localhost:3000/api/aadhaar';
   
   // For physical device, use your computer's IP
   const API_BASE_URL = 'http://192.168.1.XXX:3000/api/aadhaar';
   ```

2. Start Expo:
   ```bash
   cd /home/anish/stable_coin/oruva-mobile
   npm start
   ```

## 🧪 Complete Flow Test

### Test Case 1: New User with KYC

**Step 1: Start App**
- App opens to login screen
- See three options:
  - 🪄 Login with Magic Link
  - Create New Wallet
  - Import MetaMask Wallet

**Step 2: Click "Login with Magic Link"**
- Email input field appears
- Enter: `test@oruva.com` (or any email)
- Click "Send Magic Link"
- Status: "Logging in with Magic Link..."

**Step 3: Check Email**
- Open email inbox
- Find Magic Link email
- Click the verification link
- Browser opens and confirms

**Step 4: Aadhaar Verification Screen Appears**
- Title: "🔐 Aadhaar Verification"
- Subtitle: "Complete KYC to access full features"
- Input field for Aadhaar number
- "Skip for now" button at bottom

**Step 5: Enter Aadhaar Number**
- Enter: `123456789012` (any 12 digits)
- Number formats automatically: `1234 5678 9012`
- Click "Generate OTP"
- Alert shows: "OTP Sent (Mock Mode) - Your test OTP is: 123456"

**Step 6: Enter OTP**
- OTP screen appears
- Shows: "OTP sent to Aadhaar-linked mobile ending with ****"
- Yellow box: "🎭 Mock Mode: Use OTP 123456"
- Enter: `123456`
- Click "Verify OTP"

**Step 7: Success Screen**
- Shows: "✅ KYC Verified!"
- Displays user details:
  - Name: Test User
  - DOB: 01-01-1990
  - Gender: Male
  - Address: 123, Test Street, Test Locality...
  - Aadhaar: XXXX XXXX 9012
- Shows: "Creating your wallet..."
- Auto-redirects after 2 seconds

**Step 8: Main App Screen**
- Alert: "🎉 Welcome to Oruva! Hi Test User! Your KYC is complete..."
- Header shows:
  - Your Vault
  - Wallet address (clickable to copy)
  - ✅ KYC Verified - Test User (green badge)
- All features unlocked

**Expected Results:**
✅ KYC verified badge visible
✅ Can access "Add INR" button (💰 icon)
✅ All vault operations available
✅ Can send/receive oINR
✅ Can use yield vaults

---

### Test Case 2: New User Skipping KYC

**Follow Steps 1-4 above, then:**

**Step 5: Click "Skip for now"**
- Alert appears: "⚠️ Skip KYC?"
- Shows limitations:
  - ❌ Cannot add INR via Cashfree
  - ❌ Limited transaction amounts
  - ❌ Some features unavailable
- Options: "Go Back" or "Skip KYC"

**Step 6: Click "Skip KYC"**
- Alert: "✅ Wallet Created - You can complete KYC anytime from Profile..."
- Main app screen appears

**Step 7: Check Limitations**
- Header shows:
  - ⚠️ Complete KYC to unlock all features (yellow badge)
  - Badge is clickable
- Try clicking "Add INR" button (💰)
- Alert: "🔒 KYC Required - Please complete Aadhaar verification..."
- Options: "Cancel" or "Complete KYC"

**Step 8: Complete KYC Later**
- Click Profile button (👤)
- See KYC options (if implemented)
- Can complete verification anytime

**Expected Results:**
⚠️ KYC warning badge visible
🔒 Add INR feature blocked
✅ Basic features work (vault operations)
✅ Can complete KYC from Profile

---

### Test Case 3: Returning User (Already Verified)

**Step 1-2: Login with Same Email**
- Enter: `test@oruva.com` (email used in Test Case 1)
- Click "Send Magic Link"
- Verify in email

**Step 3: Auto-Login**
- **Aadhaar screen SKIPPED** (already verified)
- Goes directly to main app
- Alert: "Welcome Back! Hi Test User! 👋"
- Shows wallet address

**Step 4: Check Status**
- ✅ KYC badge shows: "KYC Verified - Test User"
- All features immediately available
- No KYC prompts

**Expected Results:**
✅ No Aadhaar verification required
✅ Instant access to all features
✅ KYC data persisted from first login

---

### Test Case 4: Different User

**Step 1: Logout**
- Click Profile button (👤)
- Scroll down
- Click "Logout" or disconnect wallet
- Returns to login screen

**Step 2: Login with Different Email**
- Enter: `newuser@oruva.com`
- Complete Magic Link verification
- **Aadhaar screen appears** (new user)
- Complete KYC with different Aadhaar: `987654321098`

**Expected Results:**
✅ Each email gets separate KYC
✅ Mock OTP still: 123456
✅ New user data stored independently

---

## 🔍 Backend Verification

### Check KYC Status via API

```bash
# Terminal 1: Check first user
curl http://localhost:3000/api/aadhaar/kyc-status/test@oruva.com | jq

# Response:
{
  "success": true,
  "verified": true,
  "data": {
    "name": "Test User",
    "dob": "01-01-1990",
    "gender": "M",
    "verifiedAt": "2025-10-27T..."
  }
}

# Terminal 2: Check new user
curl http://localhost:3000/api/aadhaar/kyc-status/newuser@oruva.com | jq

# Terminal 3: Check unverified user
curl http://localhost:3000/api/aadhaar/kyc-status/unknown@oruva.com | jq

# Response:
{
  "success": true,
  "verified": false
}
```

### Backend Logs to Watch

Start backend with:
```bash
cd /home/anish/stable_coin/backend
npm start
```

**Expected logs during flow:**

```
🚀 Oruva Backend Server running on port 3000
✅ Server ready!

# During Generate OTP:
🎭 MOCK MODE: Simulating OTP generation

# During Verify OTP:
🎭 MOCK MODE: Simulating OTP verification

# During KYC Status Check:
GET /api/aadhaar/kyc-status/test@oruva.com 200
```

---

## 🎨 UI Components to Test

### Login Screen
- [ ] Magic Link email input works
- [ ] "Send Magic Link" button shows loading
- [ ] Back button returns to login options
- [ ] Email validation works

### Aadhaar Screen
- [ ] Aadhaar number formats with spaces
- [ ] Only accepts 12 digits
- [ ] Generate OTP button disabled until valid
- [ ] Mock OTP displayed in alert
- [ ] Skip button shows warning dialog

### OTP Screen
- [ ] OTP input accepts only 6 digits
- [ ] Verify button disabled until 6 digits
- [ ] Resend OTP works
- [ ] Back button returns to Aadhaar entry

### Success Screen
- [ ] User details display correctly
- [ ] Auto-redirect works (2 seconds)
- [ ] Loading indicator shows
- [ ] Manual continue button works

### Main App
- [ ] KYC badge displays correctly
- [ ] Add INR checks KYC status
- [ ] Profile shows KYC info
- [ ] All features respect KYC status

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Symptoms:**
- Generate OTP fails
- Network error in console

**Solutions:**
1. Check backend is running: `curl http://localhost:3000/health`
2. Update `API_BASE_URL` in aadhaar service
3. For physical device, use computer's IP: `http://192.168.1.XXX:3000`
4. Check firewall allows port 3000
5. For Expo, try: `exp://192.168.1.XXX:19000`

### Issue 2: "Invalid OTP"
**Symptoms:**
- Verify OTP fails with any code

**Solutions:**
1. Ensure Mock Mode enabled: `MOCK_MODE=true` in backend `.env`
2. Always use OTP: `123456` in mock mode
3. Check backend logs for errors
4. Verify referenceId is passed correctly

### Issue 3: "Aadhaar screen shows every time"
**Symptoms:**
- KYC not persisting

**Solutions:**
1. Backend restarts clear in-memory storage
2. Use same email for testing
3. Check backend logs: `GET /api/aadhaar/kyc-status/:email`
4. Verify response has `verified: true`

### Issue 4: "Add INR still blocked after KYC"
**Symptoms:**
- KYC badge shows verified but feature locked

**Solutions:**
1. Check `kycVerified` state in React DevTools
2. Restart app after KYC completion
3. Verify `onVerificationComplete` was called
4. Check console logs for errors

### Issue 5: "Magic Link not working"
**Symptoms:**
- Email doesn't arrive or link doesn't work

**Solutions:**
1. Check spam folder
2. Wait 1-2 minutes for email
3. Ensure Magic API keys are correct
4. Check Magic dashboard for logs
5. Try different email provider

---

## 📊 Testing Checklist

### Functional Tests
- [ ] Login with Magic Link
- [ ] Generate OTP for new user
- [ ] Verify OTP with correct code
- [ ] Verify OTP with wrong code (should fail)
- [ ] Skip KYC flow
- [ ] Complete KYC later from Profile
- [ ] Returning user auto-login
- [ ] Multiple users with different emails
- [ ] Logout and re-login
- [ ] Add INR blocked without KYC
- [ ] Add INR works with KYC

### UI/UX Tests
- [ ] Smooth screen transitions
- [ ] Loading indicators show properly
- [ ] Error messages are clear
- [ ] Success messages are encouraging
- [ ] KYC badges visible and styled
- [ ] Mobile keyboard behavior correct
- [ ] Back buttons work correctly
- [ ] Skip warnings are clear

### Data Tests
- [ ] KYC data persists per email
- [ ] Aadhaar masked in responses
- [ ] User details accurate
- [ ] Logout clears sensitive data
- [ ] Multiple sessions work

---

## 🚀 Next Steps After Testing

### If Everything Works:
1. ✅ **Celebrate!** You have a working KYC flow!
2. Update `API_BASE_URL` for production
3. Set `MOCK_MODE=false` when real API is ready
4. Add database for KYC persistence
5. Implement KYC completion in Profile
6. Add analytics/logging
7. Test on physical devices
8. Submit for review

### Production Readiness:
- [ ] Replace in-memory storage with database
- [ ] Get production Sandbox API keys
- [ ] Test with real Aadhaar numbers
- [ ] Add encryption for KYC data
- [ ] Implement data retention policies
- [ ] Add audit logging
- [ ] Security audit
- [ ] Legal compliance review
- [ ] Privacy policy update
- [ ] Load testing

---

## 📞 Debug Commands

```bash
# Check backend health
curl http://localhost:3000/health

# Test generate OTP
curl -X POST http://localhost:3000/api/aadhaar/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012", "email":"test@oruva.com"}'

# Test verify OTP (use referenceId from above)
curl -X POST http://localhost:3000/api/aadhaar/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"referenceId":"MOCK_1730040000000", "otp":"123456", "email":"test@oruva.com"}'

# Check KYC status
curl http://localhost:3000/api/aadhaar/kyc-status/test@oruva.com

# Watch backend logs
npm start  # and watch console output

# Mobile app logs
npm start  # in oruva-mobile folder, watch Metro bundler
```

---

## ✅ Success Criteria

**New User Flow (with KYC):**
1. ✅ Magic Link login works
2. ✅ Aadhaar screen appears
3. ✅ OTP generation succeeds
4. ✅ OTP verification succeeds
5. ✅ User details displayed correctly
6. ✅ Wallet created automatically
7. ✅ KYC badge shows "Verified"
8. ✅ All features unlocked

**Returning User Flow:**
1. ✅ Magic Link login works
2. ✅ Aadhaar screen SKIPPED
3. ✅ Direct access to app
4. ✅ KYC status preserved
5. ✅ Features remain unlocked

**Skip KYC Flow:**
1. ✅ Skip option available
2. ✅ Warning dialog shows limitations
3. ✅ Wallet created without KYC
4. ✅ Add INR blocked
5. ✅ Can complete later

---

## 🎉 You're Ready!

If all tests pass, your Oruva DeFi Bank has a complete, working KYC flow! 🚀

Next: Test on physical device and prepare for production deployment.

