# Aadhaar KYC Integration Guide

## Overview
This guide explains how to integrate Aadhaar verification into the Oruva mobile app login flow.

## Complete User Flow

```
1. Email Login (Magic Link) 
   ↓
2. ✨ NEW: Aadhaar Verification Screen
   - Enter Aadhaar number (12 digits)
   - Receive OTP on Aadhaar-linked mobile
   - Enter OTP
   - Fetch & store KYC data (name, DOB, address)
   ↓
3. Auto-Create Wallet (after successful verification)
   - Generate wallet using verified email + Aadhaar hash
   - Store KYC data securely
   ↓
4. Access Full App Features
   - Vault operations
   - Add INR (Cashfree) - requires KYC
   - Send/Receive oINR
   - Earn yield
```

## Integration Steps

### Step 1: Import Components

Add to `App.js`:

```javascript
import AadhaarVerification from './components/AadhaarVerification';
import aadhaarService from './src/services/aadhaar';
```

### Step 2: Add State Variables

Add these to your `AppContent` component:

```javascript
const [showAadhaarVerification, setShowAadhaarVerification] = useState(false);
const [kycData, setKycData] = useState(null);
const [kycVerified, setKycVerified] = useState(false);
```

### Step 3: Update Magic Login Function

Modify `handleMagicLogin` to show Aadhaar verification instead of connecting immediately:

```javascript
async function handleMagicLogin() {
    if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return;
    }

    setLoading(true);
    try {
        console.log('Logging in with Magic Link...');
        await loginWithEmail(email);
        const addr = await getUserAddress();
        console.log('Magic wallet address:', addr);

        // Check if user has completed KYC
        const kycStatus = await aadhaarService.checkKYCStatus(email);
        
        if (kycStatus.verified) {
            // User already verified - connect wallet directly
            console.log('User already KYC verified');
            setKycData(kycStatus.data);
            setKycVerified(true);
            
            const magicProvider = getMagicProvider();
            await walletService.connectWithMagic(magicProvider, addr);

            setAddress(addr);
            setConnected(true);
            vaultService.initialize();
            await yieldService.initialize(walletService.signer, addr);
            
            Alert.alert('Welcome Back!', `Logged in as ${kycStatus.data.name}`);
        } else {
            // New user - show Aadhaar verification
            console.log('New user - showing Aadhaar verification');
            setShowAadhaarVerification(true);
        }
    } catch (error) {
        console.error('Magic login error:', error);
        Alert.alert('Error', 'Magic login failed: ' + error.message);
    }
    setLoading(false);
}
```

### Step 4: Add Aadhaar Verification Handler

```javascript
async function handleAadhaarVerificationComplete(userData) {
    console.log('Aadhaar verification complete:', userData);
    setKycData(userData);
    setKycVerified(true);
    setShowAadhaarVerification(false);
    
    try {
        // Get address from Magic
        const addr = await getUserAddress();
        
        // Connect wallet
        const magicProvider = getMagicProvider();
        await walletService.connectWithMagic(magicProvider, addr);

        setAddress(addr);
        setConnected(true);
        vaultService.initialize();
        await yieldService.initialize(walletService.signer, addr);
        
        Alert.alert(
            'Welcome to Oruva!', 
            `Hi ${userData.name}! Your wallet has been created.`
        );
    } catch (error) {
        console.error('Wallet creation error:', error);
        Alert.alert('Error', 'Failed to create wallet: ' + error.message);
    }
}

function handleSkipAadhaar() {
    Alert.alert(
        'Skip KYC?',
        'Some features like INR deposits will be unavailable without KYC verification. Continue anyway?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Skip',
                onPress: async () => {
                    setShowAadhaarVerification(false);
                    
                    try {
                        const addr = await getUserAddress();
                        const magicProvider = getMagicProvider();
                        await walletService.connectWithMagic(magicProvider, addr);

                        setAddress(addr);
                        setConnected(true);
                        vaultService.initialize();
                        await yieldService.initialize(walletService.signer, addr);
                        
                        Alert.alert('Wallet Created', 'You can complete KYC later from Profile');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to create wallet: ' + error.message);
                    }
                }
            }
        ]
    );
}
```

### Step 5: Add Render Logic

Add this before your main render logic:

```javascript
// Show Aadhaar verification screen after Magic Link login
if (showAadhaarVerification && !connected) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <magic.Relayer backgroundColor="#f3f4f6" />
            <AadhaarVerification
                email={email}
                onVerificationComplete={handleAadhaarVerificationComplete}
                onSkip={handleSkipAadhaar}
            />
        </SafeAreaView>
    );
}
```

## Testing the Flow

### With Backend Running

1. **Start the backend**:
   ```bash
   cd /home/anish/stable_coin/backend
   npm start
   ```

2. **Update the backend URL** in `/oruva-mobile/src/services/aadhaar.js`:
   ```javascript
   // For Expo on physical device, use your computer's IP
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api/aadhaar';
   
   // Example:
   const API_BASE_URL = 'http://192.168.1.100:3000/api/aadhaar';
   ```

3. **Test the flow**:
   - Open the mobile app
   - Click "Login with Magic Link"
   - Enter your email
   - Check email for Magic Link
   - After clicking link, Aadhaar screen appears
   - Enter any 12-digit Aadhaar number (e.g., `123456789012`)
   - You'll get a Mock OTP: `123456`
   - Enter OTP
   - Verification succeeds with mock user data
   - Wallet is created automatically

### Mock Mode Data

When `MOCK_MODE=true` in backend `.env`:
- **OTP**: Always `123456`
- **User Data**:
  ```json
  {
    "name": "Test User",
    "dob": "01-01-1990",
    "gender": "M",
    "address": {
      "combined": "123, Test Street, Test Locality, Test City, Test District, Test State - 123456"
    },
    "aadhaarNumber": "XXXX XXXX 9012"
  }
  ```

## Features

### ✅ What Works Now

1. **Magic Link Authentication** - Passwordless email login
2. **Aadhaar Verification** - OTP-based KYC
3. **Auto Wallet Creation** - After successful verification
4. **KYC Status Persistence** - Returning users skip Aadhaar screen
5. **Skip Option** - Users can skip KYC (with feature limitations)
6. **Mock Mode** - Development-friendly testing

### 🔄 Requires KYC

These features check `kycVerified` state:
- INR deposits via Cashfree
- Higher transaction limits
- Full compliance features

### 🔒 Security

- KYC data stored in backend (in-memory currently)
- Switch to database for production
- Aadhaar numbers masked in responses
- OTP verification timeout (backend validates)

## Production Checklist

Before going live:

1. **Backend**:
   - [ ] Set `MOCK_MODE=false` in `.env`
   - [ ] Get production Sandbox API keys
   - [ ] Verify Sandbox API has `verify-otp` endpoint access
   - [ ] Add database for KYC storage (MongoDB/PostgreSQL)
   - [ ] Add encryption for sensitive data
   - [ ] Implement KYC data retention policies

2. **Mobile App**:
   - [ ] Update `API_BASE_URL` to production backend
   - [ ] Add KYC completion in Profile screen
   - [ ] Add re-verification flow if needed
   - [ ] Handle KYC status checks throughout app
   - [ ] Add proper error handling for network issues

3. **Compliance**:
   - [ ] Legal review of data handling
   - [ ] Privacy policy updates
   - [ ] Terms of service updates
   - [ ] Data retention and deletion policies
   - [ ] Audit logging for KYC operations

## API Endpoints

### Generate OTP
```
POST /api/aadhaar/generate-otp
Body: { aadhaarNumber: "123456789012", email: "user@example.com" }
Response: { success: true, referenceId: "MOCK_123...", message: "...", __mockOTP: "123456" }
```

### Verify OTP
```
POST /api/aadhaar/verify-otp
Body: { referenceId: "MOCK_123...", otp: "123456", email: "user@example.com" }
Response: { success: true, data: {...}, message: "..." }
```

### Check KYC Status
```
GET /api/aadhaar/kyc-status/:email
Response: { success: true, verified: true/false, data?: {...} }
```

## Troubleshooting

### "Cannot connect to backend"
- Check backend is running on port 3000
- Update `API_BASE_URL` with correct IP
- Check firewall allows connections
- For Expo: Use computer's IP, not localhost

### "OTP verification failed"
- In Mock Mode, always use OTP: `123456`
- Check reference ID is correct
- Verify backend logs for errors

### "KYC already verified"
- Backend stores in-memory
- Restart backend to clear
- Or implement different email for testing

## Next Steps

1. **Add to Profile Tab**: Button to complete KYC if skipped
2. **KYC Badge**: Show verified status in UI
3. **Feature Gates**: Check `kycVerified` before sensitive operations
4. **Database Integration**: Replace in-memory storage
5. **Real API Testing**: Once production keys available

## Support

For issues:
1. Check backend logs: `npm start` output
2. Check mobile logs: Metro bundler console
3. Test backend directly: Use curl commands in terminal
4. Verify Mock Mode is enabled for development

