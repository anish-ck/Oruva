# 🔐 Aadhaar Verification Integration - Complete Guide

## ✅ Implementation Status

**Branch:** `feature/aadhaar-verification`

**Completed:**
- ✅ Backend Aadhaar Service (`backend/services/aadhaarService.js`)
- ✅ Backend API Routes (`backend/routes/aadhaar.js`)
- ✅ Sandbox API Integration (Test API Keys configured)
- ✅ Server Updated with Aadhaar routes
- ✅ Mobile App Aadhaar Service (`oruva-mobile/src/services/aadhaar.js`)
- ✅ Mobile App Aadhaar Verification Screen (`oruva-mobile/components/AadhaarVerification.js`)

---

## 🎯 User Flow

```
1. User opens app → Magic Link login
   ↓
2. NEW: Aadhaar Verification Screen
   ├─ Enter 12-digit Aadhaar number
   ├─ Click "Generate OTP"
   ├─ OTP sent to Aadhaar-linked mobile
   ↓
3. Enter 6-digit OTP
   ├─ Click "Verify OTP"
   ├─ Backend calls Sandbox API
   ├─ Fetch user details (name, DOB, address, photo)
   ↓
4. KYC Verification Success ✅
   ├─ Display user details
   ├─ Store KYC data
   ├─ Auto-create wallet
   ↓
5. Access full app features
```

---

## 📋 API Endpoints

### 1. Generate OTP
```http
POST http://localhost:3000/api/aadhaar/generate-otp
Content-Type: application/json

{
  "aadhaarNumber": "123456789012",
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "ref_id": "abc123...",
  "message": "OTP sent to Aadhaar-linked mobile number"
}
```

### 2. Verify OTP
```http
POST http://localhost:3000/api/aadhaar/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "Aadhaar verified successfully",
  "kycData": {
    "name": "John Doe",
    "dob": "01-01-1990",
    "gender": "M",
    "address": {
      "house": "123",
      "street": "Main St",
      "locality": "Downtown",
      "district": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "full": "123 Main St, Downtown, Mumbai, Maharashtra - 400001"
    },
    "photo": "data:image/jpeg;base64,...",
    "aadhaar_number": "XXXX XXXX 9012",
    "verified_at": "2025-10-27T12:00:00.000Z"
  }
}
```

### 3. Check Verification Status
```http
GET http://localhost:3000/api/aadhaar/status/user@example.com

Response:
{
  "success": true,
  "verified": true,
  "data": {
    "name": "John Doe",
    "dob": "01-01-1990",
    "gender": "M",
    "verified_at": "2025-10-27T12:00:00.000Z"
  }
}
```

### 4. Get Full KYC Data
```http
GET http://localhost:3000/api/aadhaar/kyc/user@example.com

Response:
{
  "success": true,
  "kycData": { ... }
}
```

---

## 🧪 Testing

### Backend Testing

1. **Start the server:**
```bash
cd backend
node server.js
```

2. **Test Generate OTP:**
```bash
curl -X POST http://localhost:3000/api/aadhaar/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012","email":"test@example.com"}'
```

3. **Test Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/aadhaar/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Mobile App Testing

1. **Update API URL** in `oruva-mobile/src/services/aadhaar.js`:
```javascript
// For physical device testing
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api/aadhaar';
```

2. **Integrate into App.js** (before wallet creation):
```javascript
// In App.js
import AadhaarVerification from './components/AadhaarVerification';

// Add state
const [kycVerified, setKycVerified] = useState(false);
const [userEmail, setUserEmail] = useState('');

// After Magic Link login, before wallet creation
if (!kycVerified && userEmail) {
  return (
    <AadhaarVerification
      email={userEmail}
      onVerificationComplete={(kycData) => {
        console.log('KYC Data:', kycData);
        setKycVerified(true);
        // Now create wallet
      }}
      onSkip={() => {
        // Optional: Allow skipping for testing
        setKycVerified(true);
      }}
    />
  );
}
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Sandbox Aadhaar Verification API
SANDBOX_API_KEY=key_test_adba892b9e454febbef3cf367ad5950d
SANDBOX_API_SECRET=secret_test_21a903ea8b9a4f8088f6c6b4c8d5aa2d
```

### Sandbox Test Credentials

From Sandbox documentation:
- **Test Aadhaar Numbers:** Check Sandbox docs for valid test numbers
- **Test OTP:** Usually `123456` for sandbox environment
- **Environment:** Test/Sandbox

---

## 📱 Mobile App Features

### AadhaarVerification Component

**Props:**
- `email` (required): User's email from Magic Link login
- `onVerificationComplete(kycData)`: Callback when verification succeeds
- `onSkip()`: Optional callback to skip verification

**Features:**
- ✅ Two-step verification (OTP generation + verification)
- ✅ Progress indicator
- ✅ Formatted Aadhaar input (XXXX XXXX XXXX)
- ✅ OTP resend functionality
- ✅ Success screen with user photo and details
- ✅ Error handling
- ✅ Loading states

---

## 🔒 Security Considerations

### Current Implementation (Development)
- ⚠️ In-memory storage (Map) - **NOT production-ready**
- ⚠️ No encryption for KYC data
- ⚠️ No rate limiting

### Production Requirements
1. **Database Storage:**
   - Use PostgreSQL/MongoDB to store KYC data
   - Encrypt sensitive fields (Aadhaar, photo)
   - Add proper indexes

2. **Security:**
   - Implement rate limiting (max 3 OTP requests per hour)
   - Add CAPTCHA for OTP generation
   - Encrypt KYC data at rest
   - Use HTTPS only
   - Implement session management

3. **Compliance:**
   - Store audit logs for all KYC operations
   - Implement data retention policies
   - Add user consent flows
   - GDPR/Privacy policy compliance

---

## 🚀 Next Steps

### 1. Integrate with App Workflow

**Modify `App.js`:**
```javascript
// User flow
const [authStage, setAuthStage] = useState('login'); // 'login' → 'kyc' → 'wallet' → 'app'

// After Magic Link login
if (authStage === 'kyc') {
  return <AadhaarVerification ... />;
}

// After KYC verification
if (authStage === 'wallet') {
  // Create wallet
  await walletService.connect();
  setAuthStage('app');
}
```

### 2. Add Database Integration

**Install dependencies:**
```bash
cd backend
npm install pg  # PostgreSQL
# or
npm install mongodb  # MongoDB
```

**Create KYC schema:**
```sql
CREATE TABLE kyc_data (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  aadhaar_number_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dob DATE,
  gender CHAR(1),
  address_json JSONB,
  photo_url TEXT,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Production Deployment

1. Switch to Sandbox **Live Keys** (not test keys)
2. Deploy backend to cloud (AWS/Heroku/DigitalOcean)
3. Configure production database
4. Set up SSL/HTTPS
5. Add monitoring and logging
6. Implement backup strategy

---

## 📊 Integration Checklist

- [x] Backend Aadhaar service created
- [x] API routes implemented
- [x] Sandbox API keys configured
- [x] Mobile app service created
- [x] Mobile app UI component created
- [ ] Integrate into main App.js flow
- [ ] Test end-to-end on device
- [ ] Add database storage
- [ ] Implement encryption
- [ ] Add rate limiting
- [ ] Production deployment

---

## 🐛 Troubleshooting

### Issue: "Failed to generate OTP"
**Solution:**
- Check Sandbox API keys are correct
- Verify aadhaar number format (12 digits)
- Check backend logs for detailed error

### Issue: "Invalid OTP"
**Solution:**
- Verify OTP is 6 digits
- Check OTP hasn't expired (10 min validity)
- Try resending OTP

### Issue: "Network Error"
**Solution:**
- Ensure backend is running
- Check API URL in mobile app
- For physical device, use computer's IP address
- Ensure devices are on same network

---

## 📞 Support

- **Sandbox Docs:** https://developer.sandbox.co.in/docs/aadhaar-verification
- **API Reference:** https://developer.sandbox.co.in/reference/aadhaar-okyc-generate-otp-api

---

**Status:** ✅ Ready for Testing
**Branch:** `feature/aadhaar-verification`
**Next:** Integrate into main app flow and test end-to-end
