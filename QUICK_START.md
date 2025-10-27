# 🚀 Quick Start Guide - Test Your App Now!

## ⚡ 5-Minute Setup

### 1. Backend (Terminal 1)
```bash
cd /home/anish/stable_coin/backend
npm start

# Expected output:
# 🚀 Oruva Backend Server running on port 3000
# ✅ Server ready!
```

### 2. Mobile App - Configuration
```bash
cd /home/anish/stable_coin/oruva-mobile

# Edit this file:
nano src/services/aadhaar.js

# Change line 4 to your IP:
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api/aadhaar';

# Find your IP:
# Linux/Mac: ip addr show | grep inet
# Windows: ipconfig
```

### 3. Mobile App - Start (Terminal 2)
```bash
cd /home/anish/stable_coin/oruva-mobile
npm start

# Then:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code for physical device
```

## 🧪 Test in 2 Minutes

### Test Credentials (Mock Mode)
```
Email: test@oruva.com (or any email)
Aadhaar: 123456789012 (any 12 digits)
OTP: 123456 (always)
```

### Flow
1. **App Opens** → Click "🪄 Login with Magic Link"
2. **Enter Email** → `test@oruva.com` → "Send Magic Link"
3. **Check Email** → Click verification link
4. **Aadhaar Screen** → Enter `123456789012` → "Generate OTP"
5. **Alert Shows** → "Mock OTP: 123456"
6. **Enter OTP** → `123456` → "Verify OTP"
7. **Success!** → See user details → Auto-redirect
8. **Main App** → "Welcome to Oruva! Hi Test User!"
9. **Header Shows** → "✅ KYC Verified - Test User"

### Quick Test Commands
```bash
# Test backend directly
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/aadhaar/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012", "email":"test@oruva.com"}'
```

## 🎯 What to Look For

### ✅ Success Indicators
- Backend shows: `🎭 MOCK MODE: Simulating OTP generation`
- Mobile shows: Alert with "Mock OTP: 123456"
- OTP verification succeeds
- Main app shows green KYC badge
- Add INR button (💰) is clickable

### ❌ If Something Fails
1. **"Cannot connect to backend"**
   - Check backend is running: `curl http://localhost:3000/health`
   - Update API_BASE_URL with correct IP
   - Check firewall allows port 3000

2. **"Invalid OTP"**
   - Always use: `123456` in Mock Mode
   - Check backend shows Mock Mode enabled

3. **Magic Link not working**
   - Check email spam folder
   - Wait 1-2 minutes
   - Try different email provider

## 📱 Test Scenarios

### Scenario 1: New User (2 min)
1. Login → Aadhaar → OTP → Success → Main App
2. ✅ Should see: "✅ KYC Verified - Test User"

### Scenario 2: Returning User (1 min)
1. Logout → Login with same email
2. ✅ Should skip Aadhaar screen
3. ✅ Should show: "Welcome Back!"

### Scenario 3: Skip KYC (1 min)
1. Login → Aadhaar screen → "Skip for now"
2. ✅ Should show warning
3. ✅ Main app with "⚠️ Complete KYC..."
4. ✅ Add INR blocked

## 🔍 Debug Checklist

- [ ] Backend running on port 3000
- [ ] Backend shows Mock Mode enabled
- [ ] Mobile API_BASE_URL updated
- [ ] Mobile app connected to backend
- [ ] Magic Link email received
- [ ] OTP 123456 works

## 📊 Expected Mock Data

**User Details After Verification:**
```
Name: Test User
DOB: 01-01-1990
Gender: Male
Aadhaar: XXXX XXXX 9012
Address: 123, Test Street, Test Locality, Test City...
```

## 🎉 Success!

If you see **"✅ KYC Verified - Test User"** in the app header, congratulations! 🎊

Your complete DeFi bank with KYC is working!

## 📚 More Info

- **Detailed Testing:** See `COMPLETE_FLOW_TESTING_GUIDE.md`
- **Visual Flow:** See `APP_FLOW_DIAGRAM.md`
- **Full Summary:** See `IMPLEMENTATION_SUMMARY.md`
- **Integration:** See `oruva-mobile/AADHAAR_INTEGRATION_GUIDE.md`

---

**Quick Help:**
```bash
# Backend health
curl http://localhost:3000/health

# Check KYC status
curl http://localhost:3000/api/aadhaar/kyc-status/test@oruva.com

# Backend logs
npm start  # Watch terminal for 🎭 Mock Mode messages
```

**Ready to test? Let's go!** 🚀
