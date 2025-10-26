# Magic Link Integration for Oruva Mobile

## Overview

Integrating Magic Link for email-based authentication in the Oruva mobile app. Users can sign in with just their email - no password needed!

## Implementation Plan

### Phase 1: Setup Magic Link SDK
1. Install Magic SDK for React Native Expo
2. Get API key from Magic dashboard
3. Configure for Flow EVM with custom network

### Phase 2: Authentication Flow
1. Replace current wallet creation with Magic Link
2. Email-based sign in with OTP
3. Automatic wallet generation by Magic
4. Optional: Social login support (Google, etc.)

### Phase 3: Integration with Existing App
1. Keep existing vault operations
2. Keep QR payment system
3. Use Magic-generated wallet with ethers.js provider

## Key Differences from Tutorial

The Emerald Academy tutorial is for:
- Web app (React)
- Flow blockchain (Cadence)
- FCL (Flow Client Library)

We need:
- Mobile app (React Native/Expo)
- Flow EVM (Ethereum-compatible)
- ethers.js (not FCL)

## Magic Link for Flow EVM

**IMPORTANT: Flow vs Flow EVM**

There are TWO different Flow blockchains with different Magic integrations:

1. **Flow (Cadence)** - Non-EVM blockchain
   - Uses `@magic-ext/flow` extension
   - Uses Flow Client Library (FCL)
   - Smart contracts in Cadence language
   - Documentation: https://docs.magic.link/embedded-wallets/blockchains/non-evm/flow
   - ❌ **NOT what we need**

2. **Flow EVM** - Ethereum Virtual Machine on Flow
   - Uses standard Magic SDK (no special extension needed)
   - Uses ethers.js or web3.js
   - Smart contracts in Solidity
   - Fully Ethereum-compatible
   - ✅ **This is what we're using**

**Our Configuration:**
- Use `@magic-sdk/react-native-expo` (standard EVM support)
- Use `@magic-ext/react-native-expo-oauth` for social logins
- Connect to Flow EVM RPC with custom network configuration
- No need for `@magic-ext/flow` extension

## Installation Steps

```bash
# Install Magic SDK for React Native Expo
npm install @magic-sdk/react-native-expo

# Install OAuth extension (optional - for Google/social login)
npm install @magic-ext/react-native-expo-oauth

# Required peer dependencies (should already be installed)
npm install react-native-safe-area-context
npm install @react-native-async-storage/async-storage
```

## Magic SDK Setup

### Basic Configuration

```javascript
import { Magic } from '@magic-sdk/react-native-expo';

const magic = new Magic('YOUR_PUBLISHABLE_API_KEY', {
  network: {
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    chainId: 545,
  },
});
```

### With OAuth Extension (for social login)

```javascript
import { Magic } from '@magic-sdk/react-native-expo';
import { OAuthExtension } from '@magic-ext/react-native-expo-oauth';

const magic = new Magic('YOUR_PUBLISHABLE_API_KEY', {
  network: {
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    chainId: 545,
  },
  extensions: [new OAuthExtension()],
});
```

### App Component with Relayer

```javascript
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      {/* Magic Relayer - required for Magic to work */}
      <magic.Relayer backgroundColor="#FFFFFF" />
      
      {/* Your app components */}
    </SafeAreaProvider>
  );
}
```

## Authentication Methods

### Email Login with OTP

```javascript
// Login with Magic's built-in UI
await magic.auth.loginWithEmailOTP({ 
  email: 'user@example.com' 
});

// Login without UI (custom flow)
const handle = magic.auth.loginWithEmailOTP({ 
  email: 'user@example.com',
  showUI: false 
});

// Handle OTP verification
handle.on('email-otp-sent', () => {
  // Prompt user for OTP
  const otp = getUserInputOTP();
  handle.emit('verify-email-otp', otp);
});
```

### Check Login Status

```javascript
const isLoggedIn = await magic.user.isLoggedIn();
```

### Get User Info

```javascript
const userInfo = await magic.user.getInfo();
// Returns: { issuer, email, wallets: { ethereum: { publicAddress, ... } } }
```

### Logout

```javascript
await magic.user.logout();
```

## Integration with ethers.js

Magic provides an Ethereum-compatible provider that works with ethers.js:

```javascript
import { ethers } from 'ethers';

// Create ethers provider from Magic
const provider = new ethers.providers.Web3Provider(magic.rpcProvider);

// Get signer (wallet)
const signer = provider.getSigner();

// Get user's address
const address = await signer.getAddress();

// Use with existing contracts
const vaultManager = new ethers.Contract(
  vaultManagerAddress,
  vaultManagerABI,
  signer
);

// Call contract methods
await vaultManager.buyOINR(amount);
```

## Configuration Files to Update

1. **src/services/magic.js** (NEW)
   - Initialize Magic instance
   - Export login, logout, getUser methods
   - Handle authentication state

2. **App.js**
   - Add SafeAreaProvider wrapper
   - Add magic.Relayer component
   - Check authentication status on mount
   - Redirect to login if not authenticated

3. **src/services/wallet.js**
   - Remove manual wallet creation
   - Use Magic provider instead of JSON-RPC provider
   - Get signer from Magic provider

4. **src/screens/HomeScreen.js**
   - Add logout button
   - Display user email
   - Show Magic-managed wallet address

## Magic Dashboard Setup

1. Go to https://dashboard.magic.link/
2. Create new account or login
3. Create new app
4. Select "Ethereum" as blockchain
5. Get your Publishable API Key
6. Configure allowed origins (for web) - not needed for React Native
7. Optional: Enable MFA, Account Recovery in settings

## Implementation Files

- `src/services/magic.js` - Magic Link service wrapper
- `src/services/wallet.js` - Update to use Magic provider
- `App.js` - Add SafeAreaProvider and Relayer
- `src/screens/LoginScreen.js` (NEW) - Email login UI
- `src/screens/HomeScreen.js` - Update with logout, user info

## Status

- [x] Branch created: `magic-link-integration`
- [x] Documentation reviewed (official Magic docs)
- [ ] Uninstall deprecated @magic-sdk/react-native
- [ ] Install @magic-sdk/react-native-expo
- [ ] Get API key from Magic dashboard
- [ ] Create Magic service wrapper
- [ ] Update App.js with Relayer
- [ ] Implement email login screen
- [ ] Update wallet service to use Magic provider
- [ ] Test authentication flow
- [ ] Test with existing vault operations
- [ ] Add social login (optional)

## References

- **Magic React Native Docs**: https://docs.magic.link/embedded-wallets/sdk/client-side/react-native
- **Magic Auth Module**: Email OTP, SMS login
- **Magic User Module**: User info, logout, settings
- **Magic Wallet Module**: Show UI, balances, send tokens
- **EVM Chain Switching**: https://docs.magic.link/embedded-wallets/wallets/features/evm-chain-switching
- **Emerald Academy Tutorial**: https://academy.ecdao.org/en/catalog/tutorials/magic-link-auth (for Flow/Cadence reference)

## Notes

- Magic automatically handles wallet creation and key management
- User's private key is never exposed to developer or Magic
- Session persists for 7 days by default (configurable)
- Magic iframe must be rendered in app (via `<magic.Relayer />`)
- Use `SafeAreaProvider` to prevent UI issues
- Magic SDK uses PromiEvents (Promise + EventEmitter)
- Error handling with `RPCError`, `RPCErrorCode`
- Supports white-label OTP flow (custom UI)
