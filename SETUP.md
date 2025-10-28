# Oruva Platform - Complete Setup Guide

This guide will walk you through setting up the entire Oruva platform including smart contracts, backend API, and mobile application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Smart Contract Setup](#smart-contract-setup)
4. [Backend Setup](#backend-setup)
5. [Mobile App Setup](#mobile-app-setup)
6. [External Services Configuration](#external-services-configuration)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **Foundry**: For smart contract development
- **Expo CLI**: For mobile development
- **VSCode** (recommended): With Solidity and React Native extensions

### Required Accounts
1. **Flow Testnet Wallet**: Get testnet FLOW from [Flow Faucet](https://testnet-faucet.onflow.org/)
2. **Magic Link Account**: Sign up at [magic.link](https://magic.link/)
3. **Cashfree Account**: Sign up at [cashfree.com](https://www.cashfree.com/)
4. **GitHub Account**: For repository access

### System Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Internet**: Stable connection required

---

## Project Structure

```
Oruva/
├── src/                          # Smart contracts
│   ├── OINRToken.sol            # oINR stablecoin
│   ├── VaultEngine.sol          # Core CDP engine
│   ├── VaultManager.sol         # Vault operations
│   ├── CollateralJoin.sol       # Collateral management
│   ├── Oracle.sol               # Price feeds
│   └── YieldVault.sol           # Yield generation
├── script/                       # Deployment scripts
├── test/                         # Smart contract tests
├── backend/                      # Node.js API server
│   ├── server.js
│   ├── routes/
│   └── services/
├── oruva-mobile/                # React Native app
│   ├── App.js
│   ├── screens/
│   ├── components/
│   └── src/
├── lib/                         # Dependencies
├── foundry.toml                 # Foundry config
└── package.json                 # Project dependencies
```

---

## Smart Contract Setup

### Step 1: Install Foundry
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
cast --version
anvil --version
```

### Step 2: Clone and Install Dependencies
```bash
# Clone repository
git clone https://github.com/anish-ck/Oruva.git
cd Oruva

# Install Foundry dependencies
forge install

# Install Node.js dependencies
npm install
```

### Step 3: Configure Environment
Create `.env` file in the root directory:

```env
# Flow EVM Testnet
FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
CHAIN_ID=545

# Deployer Private Key (DO NOT COMMIT THIS!)
PRIVATE_KEY=your_private_key_here

# Etherscan (optional)
ETHERSCAN_API_KEY=your_etherscan_key

# USDC Mock Token Address (if using testnet)
USDC_ADDRESS=0x...
```

### Step 4: Compile Contracts
```bash
# Compile all contracts
forge build

# Check for compilation errors
forge build --force
```

### Step 5: Run Tests
```bash
# Run all tests
forge test

# Run with detailed output
forge test -vvv

# Run specific test
forge test --match-contract VaultEngineTest
```

### Step 6: Deploy Contracts

**Option A: Complete Deployment (Recommended)**
```bash
# Deploy all contracts in one go
forge script script/CompleteDeployment.s.sol \
  --rpc-url $FLOW_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify

# Save deployed addresses to CONTRACT_ADDRESSES.json
```

**Option B: Individual Deployment**
```bash
# 1. Deploy OINRToken
forge script script/DeployOINRToken.s.sol --rpc-url flow-testnet --broadcast

# 2. Deploy VaultEngine
forge script script/DeployVaultEngine.s.sol --rpc-url flow-testnet --broadcast

# 3. Deploy VaultManager
forge script script/DeployVaultManager.s.sol --rpc-url flow-testnet --broadcast

# 4. Deploy CollateralJoin
forge script script/DeployCollateralJoin.s.sol --rpc-url flow-testnet --broadcast

# 5. Deploy Oracle
forge script script/DeployOracle.s.sol --rpc-url flow-testnet --broadcast

# 6. Deploy Yield Vaults
forge script script/DeployYieldVaults.s.sol --rpc-url flow-testnet --broadcast

# 7. Setup Permissions
forge script script/SetupPermissions.s.sol --rpc-url flow-testnet --broadcast
```

### Step 7: Verify Deployment
```bash
# Run verification script
forge script script/VerifySetup.s.sol --rpc-url flow-testnet

# Check contract on Flow EVM Explorer
# Visit: https://evm-testnet.flowscan.io/address/<contract_address>
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Create `backend/.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Flow EVM Configuration
FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
CHAIN_ID=545
PRIVATE_KEY=your_backend_wallet_private_key

# Contract Addresses (from deployment)
OINR_TOKEN_ADDRESS=0x...
VAULT_ENGINE_ADDRESS=0x...
VAULT_MANAGER_ADDRESS=0x...
COLLATERAL_JOIN_ADDRESS=0x...
ORACLE_ADDRESS=0x...
USDC_YIELD_VAULT_ADDRESS=0x...
OINR_YIELD_VAULT_ADDRESS=0x...

# Cashfree Configuration
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=TEST  # Change to PROD for production

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/oruva

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key
```

### Step 4: Setup Database (Optional)
```bash
# If using PostgreSQL
createdb oruva

# Run migrations
npm run migrate
```

### Step 5: Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Step 6: Test Backend API
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test contract endpoints
curl http://localhost:3000/api/vault/info/<wallet_address>

# Test Cashfree integration
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "walletAddress": "0x..."}'
```

---

## Mobile App Setup

### Step 1: Navigate to Mobile Directory
```bash
cd oruva-mobile
```

### Step 2: Install Dependencies
```bash
# Install npm packages
npm install

# Install Expo CLI globally (if not installed)
npm install -g expo-cli
```

### Step 3: Configure Environment
Create `oruva-mobile/.env`:

```env
# Magic Link Configuration
EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_live_your_magic_key

# Backend API
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
# For production: https://your-backend-url.com

# Flow EVM Configuration
EXPO_PUBLIC_FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
EXPO_PUBLIC_CHAIN_ID=545

# Contract Addresses
EXPO_PUBLIC_OINR_TOKEN_ADDRESS=0x...
EXPO_PUBLIC_VAULT_MANAGER_ADDRESS=0x...
EXPO_PUBLIC_USDC_ADDRESS=0x...

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### Step 4: Install Expo Go App
- **iOS**: Download from App Store
- **Android**: Download from Play Store

### Step 5: Start Development Server
```bash
# Start Expo development server
npm start

# Or use specific platform
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web browser
```

### Step 6: Test Mobile App
1. Scan QR code with Expo Go app
2. Wait for app to load
3. Test login with email (Magic Link)
4. Test vault operations
5. Test payment flows

---

## External Services Configuration

### Magic Link Setup

1. **Create Account**: Go to [magic.link](https://magic.link/)
2. **Create Project**: Name it "Oruva"
3. **Get API Key**: Copy publishable key
4. **Configure Blockchain**:
   - Network: Flow EVM Testnet
   - Chain ID: 545
   - RPC URL: https://testnet.evm.nodes.onflow.org
5. **Add to Environment**: Update `.env` files

### Cashfree Setup

1. **Create Account**: Go to [cashfree.com](https://www.cashfree.com/)
2. **Get Credentials**:
   - App ID
   - Secret Key
3. **Enable Test Mode**: Use TEST environment
4. **Configure Webhooks**:
   - URL: `https://your-backend-url.com/api/payment/webhook`
   - Events: Payment success, Payment failed
5. **Add to Environment**: Update backend `.env`

### Flow Testnet Setup

1. **Get Testnet FLOW**:
   - Visit [Flow Faucet](https://testnet-faucet.onflow.org/)
   - Enter your wallet address
   - Request testnet FLOW

2. **Get Test USDC**:
   - Use faucet or mint function
   - Or contact team for test tokens

3. **Verify Network**:
   - Network: Flow EVM Testnet
   - Chain ID: 545
   - Currency: FLOW
   - Explorer: https://evm-testnet.flowscan.io/

---

## Deployment

### Smart Contracts to Mainnet

```bash
# Update .env with mainnet RPC
FLOW_RPC_URL=https://mainnet.evm.nodes.onflow.org
CHAIN_ID=747

# Deploy to mainnet
forge script script/CompleteDeployment.s.sol \
  --rpc-url mainnet \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify

# Verify contracts
forge verify-contract <contract_address> <contract_name> \
  --chain-id 747 \
  --constructor-args $(cast abi-encode "constructor(...)" ...)
```

### Backend Deployment

**Using Heroku:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create oruva-backend

# Set environment variables
heroku config:set FLOW_RPC_URL=https://mainnet.evm.nodes.onflow.org
heroku config:set PRIVATE_KEY=...
# ... set all other env vars

# Deploy
git push heroku master

# Check logs
heroku logs --tail
```

**Using Railway/Render:**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Mobile App Deployment

**Build for Production:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Testing

### Smart Contract Tests
```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run coverage
forge coverage

# Run specific test file
forge test --match-path test/VaultEngine.t.sol
```

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "Cashfree"
```

### Mobile App Tests
```bash
cd oruva-mobile

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# E2E tests (if configured)
npm run test:e2e
```

### Integration Tests
```bash
# Test full flow: Deposit → Borrow → Repay
npm run test:integration

# Test payment flow: Add INR → Mint oINR
npm run test:payment-flow
```

---

## Troubleshooting

### Smart Contract Issues

**Problem**: Deployment fails with "insufficient funds"
```bash
# Solution: Get more testnet FLOW
# Visit: https://testnet-faucet.onflow.org/
```

**Problem**: Contract verification fails
```bash
# Solution: Verify manually
forge verify-contract <address> <contract> --chain-id 545
```

**Problem**: Transaction reverts
```bash
# Solution: Check error message and contract state
cast call <contract> "viewFunction()" --rpc-url $FLOW_RPC_URL
```

### Backend Issues

**Problem**: Cannot connect to blockchain
```bash
# Solution: Check RPC URL
curl -X POST https://testnet.evm.nodes.onflow.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Problem**: Cashfree webhook not receiving
```bash
# Solution: Use ngrok for local testing
ngrok http 3000
# Update Cashfree webhook URL to ngrok URL
```

**Problem**: Contract interaction fails
```bash
# Solution: Check contract addresses and ABI
node backend/check-config.js
```

### Mobile App Issues

**Problem**: Magic Link authentication fails
```bash
# Solution: 
# 1. Check Magic dashboard for errors
# 2. Verify API key in .env
# 3. Clear Expo cache: expo start -c
```

**Problem**: Cannot connect to backend
```bash
# Solution: 
# 1. Check backend URL in .env
# 2. For local testing, use your machine's IP instead of localhost
# 3. Ensure backend is running
```

**Problem**: QR scanner not working
```bash
# Solution:
# 1. Grant camera permissions
# 2. Test on physical device (not emulator)
# 3. Check expo-barcode-scanner installation
```

### Network Issues

**Problem**: RPC calls timeout
```bash
# Solution: Use alternative RPC endpoints
# Or increase timeout in config
```

**Problem**: Gas estimation fails
```bash
# Solution: Set manual gas limit
{ gasLimit: 500000 }
```

---

## Additional Resources

### Documentation
- [Flow EVM Docs](https://developers.flow.com/evm/about)
- [Magic Link Docs](https://magic.link/docs)
- [Cashfree Docs](https://docs.cashfree.com/)
- [Foundry Book](https://book.getfoundry.sh/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)

### Community
- Flow Discord: [discord.gg/flow](https://discord.gg/flow)
- GitHub Issues: [Oruva Issues](https://github.com/anish-ck/Oruva/issues)

### Tools
- [Flow Testnet Faucet](https://testnet-faucet.onflow.org/)
- [Flow EVM Explorer](https://evm-testnet.flowscan.io/)
- [Remix IDE](https://remix.ethereum.org/)
- [Tenderly](https://tenderly.co/)

---

## Next Steps

1. ✅ Complete all setup steps
2. ✅ Deploy smart contracts
3. ✅ Configure backend API
4. ✅ Launch mobile app
5. ✅ Test end-to-end flows
6. ✅ Monitor transactions on explorer
7. 🚀 Deploy to production
8. 📈 Scale and optimize

---

## Support

For help with setup:
- Open a [GitHub Issue](https://github.com/anish-ck/Oruva/issues)
- Check existing issues for solutions
- Contact the team

---

**Happy Building! 🚀**
