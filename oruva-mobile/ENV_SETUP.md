# Environment Variables Setup

## Overview

The Oruva mobile app uses environment variables to manage sensitive configuration like API keys and network settings.

## Setup Instructions

### 1. Create `.env` File

Copy the example file:

```bash
cd oruva-mobile
cp .env.example .env
```

### 2. Configure Variables

Edit `.env` and set your values:

```properties
# Magic Link Configuration
# Get your API key from https://dashboard.magic.link/
EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE

# Flow EVM Configuration (testnet values already set)
EXPO_PUBLIC_FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
EXPO_PUBLIC_FLOW_EVM_CHAIN_ID=545
```

### 3. Get Your Magic API Key

1. Go to https://dashboard.magic.link/
2. Sign up or log in
3. Create a new app
4. Select **"Ethereum"** as blockchain
5. Copy the **Publishable API Key**
6. Paste it in your `.env` file

## Environment Variables Reference

### `EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY`
- **Required**: Yes
- **Description**: Your Magic Link publishable API key
- **Where to get**: https://dashboard.magic.link/
- **Example**: `pk_live_54060FFBAB0C240F`
- **Note**: Must start with `EXPO_PUBLIC_` to be accessible in Expo

### `EXPO_PUBLIC_FLOW_EVM_RPC_URL`
- **Required**: Yes
- **Description**: Flow EVM RPC endpoint
- **Default**: `https://testnet.evm.nodes.onflow.org`
- **Mainnet**: `https://mainnet.evm.nodes.onflow.org`

### `EXPO_PUBLIC_FLOW_EVM_CHAIN_ID`
- **Required**: Yes
- **Description**: Flow EVM chain ID
- **Default**: `545` (testnet)
- **Mainnet**: `747`

## How It Works

### Expo Environment Variables

Expo requires the `EXPO_PUBLIC_` prefix for environment variables to be accessible in the app:

```javascript
// In your code
const apiKey = process.env.EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY;
```

### Fallback Values

The app includes fallback values if environment variables are not set:

```javascript
const MAGIC_API_KEY = process.env.EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY || 'pk_live_54060FFBAB0C240F';
```

This ensures the app works even if `.env` is missing (useful for testing).

## Security

### ✅ What's Safe to Commit
- `.env.example` - Template with placeholder values
- Code that reads from `process.env`
- Documentation

### ❌ Never Commit
- `.env` - Contains actual API keys (already in `.gitignore`)
- Secret keys or private keys
- Production credentials

### API Key Security

Magic's **publishable keys** are safe to expose in client-side code:
- ✅ Safe to use in mobile apps
- ✅ Safe to use in web apps
- ✅ Cannot be used to impersonate users
- ✅ Cannot access user data on backend

Magic's **secret keys** must never be exposed:
- ❌ Never use in mobile/web apps
- ❌ Only use on backend servers
- ❌ Keep in server environment variables

## Troubleshooting

### Issue: "Magic API key is undefined"

**Solution**: Make sure you:
1. Created `.env` file in `oruva-mobile/` folder
2. Set `EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY` (with `EXPO_PUBLIC_` prefix)
3. Restarted the Expo development server

### Issue: "Environment variables not updating"

**Solution**: Restart the Expo server:
```bash
# Press Ctrl+C to stop
npm start
# or
npx expo start
```

### Issue: ".env file not found"

**Solution**: Create it from the example:
```bash
cd oruva-mobile
cp .env.example .env
# Then edit .env with your values
```

## Development Workflow

### For Team Members

When cloning the repository:

```bash
# 1. Clone the repository
git clone https://github.com/anish-ck/Oruva.git
cd Oruva/oruva-mobile

# 2. Install dependencies
npm install

# 3. Create .env from example
cp .env.example .env

# 4. Get Magic API key
# Visit https://dashboard.magic.link/
# Create account/app and get API key

# 5. Edit .env and add your API key
nano .env
# or use your favorite editor

# 6. Start the app
npm start
```

### Switching Networks

To switch from testnet to mainnet:

**Edit `.env`:**
```properties
EXPO_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
EXPO_PUBLIC_FLOW_EVM_CHAIN_ID=747
```

**Restart the app.**

## File Structure

```
oruva-mobile/
├── .env                    # Your local config (not committed)
├── .env.example            # Template (committed)
├── .gitignore              # Includes .env
└── src/
    └── services/
        └── magic.js        # Reads from process.env
```

## Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use `.env.example`** - Document all required variables
3. **Use `EXPO_PUBLIC_` prefix** - Required for Expo
4. **Provide defaults** - Fallback values for better DX
5. **Document variables** - Explain what each one does
6. **Restart server** - After changing `.env`

## Example `.env` File

```properties
# Magic Link Configuration
EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_live_54060FFBAB0C240F

# Flow EVM Testnet Configuration
EXPO_PUBLIC_FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
EXPO_PUBLIC_FLOW_EVM_CHAIN_ID=545
```

## Additional Resources

- **Expo Environment Variables**: https://docs.expo.dev/guides/environment-variables/
- **Magic Dashboard**: https://dashboard.magic.link/
- **Flow EVM Documentation**: https://developers.flow.com/evm/

---

**Note**: The `.env` file is already created and configured for your local development. Other team members should follow the setup instructions above.
