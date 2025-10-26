# Magic Link Integration - Setup Complete! ✅

## What's Done

### 1. Packages Installed ✅
```json
"@magic-sdk/react-native-expo": "^32.0.0"
"@magic-ext/react-native-expo-oauth": "^28.0.0"
```

**Note:** We removed the deprecated packages:
- ❌ `@magic-sdk/react-native` (deprecated)
- ❌ `@magic-ext/react-native-bare-oauth` (for bare React Native)
- ❌ `react-native-device-info` (not needed for Expo)

### 2. Magic Service Created ✅
**File:** `src/services/magic.js`

Provides these methods:
- `loginWithEmail(email)` - Email OTP authentication
- `loginWithGoogle()` - Google OAuth login
- `isLoggedIn()` - Check login status
- `getUserInfo()` - Get user info (email, addresses)
- `getUserAddress()` - Get Ethereum address
- `getIdToken()` - Get DID token for backend auth
- `logout()` - Logout user
- `showSettings()` - Show Magic settings UI
- `showAddress()` - Show address QR code
- `showBalances()` - Show token balances
- `getMagicProvider()` - Get RPC provider for ethers.js

### 3. Documentation Created ✅

**Files:**
- `MAGIC_LINK_PLAN.md` - Comprehensive implementation plan
- `FLOW_VS_FLOW_EVM.md` - Explains difference between Flow (Cadence) and Flow EVM

**Key Clarifications:**
- Flow (Cadence) uses `@magic-ext/flow` + FCL → ❌ NOT what we need
- Flow EVM uses standard Magic SDK + ethers.js → ✅ What we're using
- Our contracts are Solidity on Flow EVM (Ethereum-compatible)

## What's Next

### Step 1: Get Magic API Key 🔑
1. Go to https://dashboard.magic.link/
2. Sign up or login
3. Create new app
4. Select **"Ethereum"** as blockchain (Flow EVM is Ethereum-compatible)
5. Copy your **Publishable API Key**
6. Replace in `src/services/magic.js`:
   ```javascript
   const MAGIC_API_KEY = 'YOUR_MAGIC_PUBLISHABLE_API_KEY'; // <- Update this
   ```

### Step 2: Update App.js 📱
Add Magic Relayer component:

```javascript
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { magic } from './src/services/magic';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Magic Relayer - REQUIRED for Magic to work */}
      <magic.Relayer backgroundColor="#FFFFFF" />
      
      {/* Your existing app components */}
      {/* ... */}
    </SafeAreaProvider>
  );
}
```

### Step 3: Create Login Screen 📧
**File:** `src/screens/LoginScreen.js` (create new)

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { loginWithEmail } from '../services/magic';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginWithEmail(email);
      // User is now logged in!
      navigation.navigate('Home');
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Login with Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="your@email.com"
        keyboardType="email-address"
      />
      <Button 
        title={loading ? "Logging in..." : "Login"} 
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

### Step 4: Update Wallet Service 🔗
**File:** `src/services/wallet.js`

Replace manual wallet creation with Magic provider:

```javascript
import { ethers } from 'ethers';
import { getMagicProvider, getUserAddress } from './magic';

class WalletService {
  constructor() {
    // Use Magic provider instead of JSON-RPC
    this.provider = new ethers.providers.Web3Provider(getMagicProvider());
    this.signer = this.provider.getSigner();
  }

  async getAddress() {
    // Get address from Magic
    return await getUserAddress();
  }

  // ... rest of your wallet methods
}
```

### Step 5: Add Authentication Check 🔐
**File:** `App.js` or `_layout.tsx`

Check if user is logged in on app start:

```javascript
import { useEffect, useState } from 'react';
import { isLoggedIn } from './src/services/magic';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const loggedIn = await isLoggedIn();
    setAuthenticated(loggedIn);
    setLoading(false);
  };

  if (loading) return <LoadingScreen />;
  if (!authenticated) return <LoginScreen />;
  
  return <HomeScreen />;
}
```

### Step 6: Add Logout Button 🚪
**File:** `src/screens/HomeScreen.js`

```javascript
import { logout, getUserInfo } from '../services/magic';

const handleLogout = async () => {
  await logout();
  // Navigate to login screen
  navigation.navigate('Login');
};

// Show user email
const [userEmail, setUserEmail] = useState('');

useEffect(() => {
  const loadUser = async () => {
    const info = await getUserInfo();
    setUserEmail(info.email);
  };
  loadUser();
}, []);
```

## Configuration Summary

### Magic SDK Configuration
```javascript
// src/services/magic.js
import { Magic } from '@magic-sdk/react-native-expo';

const magic = new Magic('YOUR_API_KEY', {
  network: {
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    chainId: 545,
  },
});
```

### Flow EVM Testnet
- **RPC URL**: `https://testnet.evm.nodes.onflow.org`
- **Chain ID**: 545
- **Block Explorer**: https://evm-testnet.flowscan.io/

### Contract Addresses (Already Deployed)
```javascript
VaultManager: 0x5F1311808ED97661D5b31F4C67637D8952a54cc0
VaultEngine: 0xa9255087b8d1B75456eA5d4fc272B884E7A7AE8a
oINR: 0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae
CollateralJoin: 0x0b54a6bf84108d7C8d5a2296Df4a2264b1f7Fd66
MockUSDC: 0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43
PriceOracle: 0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99
```

## Testing Plan

1. **Test Email Login**
   - Enter email address
   - Receive OTP in email
   - Verify OTP
   - Check login successful

2. **Test Wallet Integration**
   - Get user's Ethereum address from Magic
   - Check address matches between Magic and ethers.js
   - Verify address has test USDC balance

3. **Test Contract Interactions**
   - Buy oINR using Magic wallet
   - Deposit collateral
   - Borrow oINR
   - Repay loan
   - Withdraw collateral

4. **Test QR Payments**
   - Generate payment QR code
   - Scan QR code from another device
   - Complete payment
   - Verify transaction on blockchain

5. **Test Logout**
   - Logout user
   - Verify session cleared
   - Login again
   - Verify same wallet address

## Important Notes

### Session Persistence
- Magic sessions last **7 days** by default
- User doesn't need to re-login every time
- Check `isLoggedIn()` on app start
- Automatically show home screen if logged in

### Error Handling
```javascript
import { RPCError, RPCErrorCode } from '@magic-sdk/react-native-expo';

try {
  await magic.auth.loginWithEmailOTP({ email });
} catch (err) {
  if (err instanceof RPCError) {
    switch (err.code) {
      case RPCErrorCode.UserAlreadyLoggedIn:
        // Handle already logged in
        break;
      case RPCErrorCode.MagicLinkExpired:
        // Handle expired link
        break;
    }
  }
}
```

### SafeAreaProvider Required
- Magic Relayer must be wrapped in `SafeAreaProvider`
- Already installed: `react-native-safe-area-context`
- Must be at root of app component tree

### Internet Connection
- Magic requires internet connection
- Handle offline state gracefully
- Show appropriate error messages

## Resources

- **Magic Dashboard**: https://dashboard.magic.link/
- **Magic React Native Docs**: https://docs.magic.link/embedded-wallets/sdk/client-side/react-native
- **Flow EVM Docs**: https://developers.flow.com/evm/about
- **Flow EVM Explorer**: https://evm-testnet.flowscan.io/

## Current Branch

Branch: `magic-link-integration`

**Don't merge to master yet!**
- Test thoroughly first
- Ensure all features work
- Master branch has working QR payments
- Can always revert if issues arise

## Quick Start Commands

```bash
# Install dependencies (already done)
cd oruva-mobile
npm install

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Check for errors
npm run lint
```

## Status Checklist

- [x] Uninstall deprecated packages
- [x] Install correct Expo packages
- [x] Create Magic service wrapper
- [x] Document Flow vs Flow EVM difference
- [ ] Get Magic API key from dashboard
- [ ] Update magic.js with API key
- [ ] Add SafeAreaProvider to App.js
- [ ] Add Magic Relayer to App.js
- [ ] Create LoginScreen component
- [ ] Update WalletService to use Magic
- [ ] Add authentication check
- [ ] Add logout functionality
- [ ] Test email login flow
- [ ] Test with existing contracts
- [ ] Test QR payments
- [ ] Full integration testing

---

**Ready to proceed with Step 1: Get Magic API Key!** 🚀
