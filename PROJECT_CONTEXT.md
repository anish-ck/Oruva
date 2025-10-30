# Oruva Project - Complete Context Documentation

> **Purpose**: This document provides complete context about the Oruva project for AI assistants to understand the entire system, codebase, architecture, and current state.

**Last Updated**: October 30, 2025  
**Project Status**: Testnet Deployment Complete  
**Repository**: https://github.com/anish-ck/Oruva

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Smart Contracts Details](#smart-contracts-details)
4. [Mobile App Structure](#mobile-app-structure)
5. [Backend API](#backend-api)
6. [Development History](#development-history)
7. [Current State](#current-state)
8. [Code Patterns](#code-patterns)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Future AI Assistant Guidelines](#future-ai-assistant-guidelines)

---

## 1. Project Overview

### What is Oruva?

**Oruva** is India's first decentralized stablecoin platform that bridges Web2 payment systems (UPI, cards) with Web3 blockchain technology. It enables Indians to use cryptocurrency for everyday transactions.

### Core Problem Solved

- **Problem**: 650M+ Indians own crypto but can't easily spend it for daily purchases
- **Solution**: Convert USDC → oINR (INR stablecoin) → Use for UPI/card payments
- **Innovation**: Combines CDP (Collateralized Debt Position) system with Cashfree payment gateway

### Key Value Propositions

1. **For Crypto Holders**: Convert USDC to INR-pegged stablecoin instantly
2. **For Merchants**: Accept crypto payments via familiar UPI interface
3. **For DeFi Users**: Earn 5% APY on USDC/oINR deposits
4. **For Everyone**: Non-custodial wallet with email login (no seed phrases)

---

## 2. Architecture Deep Dive

### System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: PRESENTATION (Frontend)                                │
│ - React Native mobile app (Expo SDK 54)                         │
│ - PayTM-inspired blue gradient UI                               │
│ - 12+ screens (Home, Vault, Profile, etc.)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ LAYER 2: AUTHENTICATION & PAYMENT GATEWAY                       │
│ - Magic Link SDK (email → Web3 wallet)                          │
│ - Cashfree API (INR → oINR conversion)                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ LAYER 3: APPLICATION (Backend)                                  │
│ - Node.js + Express API server                                  │
│ - Aadhaar KYC integration                                       │
│ - Webhook handlers for Cashfree                                 │
│ - Transaction indexing (planned)                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ LAYER 4: BLOCKCHAIN (Smart Contracts)                           │
│ - Flow EVM Testnet (Chain ID: 545)                              │
│ - Solidity 0.8.20 contracts                                     │
│ - 8 deployed contracts (see addresses below)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Example: User Deposits USDC

```
1. User opens app → Magic Link authenticates → Web3 wallet created
2. User navigates: Home → Deposit screen
3. User enters amount (e.g., 100 USDC)
4. Frontend calls: VaultManager.deposit(100)
   ↓
5. Smart contract executes:
   - USDC.transferFrom(user, VaultManager, 100) ✅
   - VaultEngine.increaseCollateral(user, 100) ✅
   - Event emitted: Deposited(user, 100)
   ↓
6. Backend listens to event → Updates UI
7. User sees: "Deposited 100 USDC" notification
8. Balance updates in real-time
```

### Network & Infrastructure

| Component | Details |
|-----------|---------|
| **Blockchain** | Flow EVM Testnet |
| **Chain ID** | 545 |
| **RPC** | https://testnet.evm.nodes.onflow.org |
| **Explorer** | https://evm-testnet.flowscan.io/ |
| **Gas Token** | FLOW |
| **Backend Host** | localhost:3000 (dev) / ngrok (webhooks) |
| **Mobile Platform** | Expo Go (dev) / Standalone (prod) |
| **Database** | None (blockchain is source of truth) |

---

## 3. Smart Contracts Details

### Contract Addresses (Flow EVM Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **oINR** | `0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae` | ERC20 stablecoin (18 decimals) |
| **VaultManager** | `0x5F1311808ED97661D5b31F4C67637D8952a54cc0` | User interface for vaults |
| **VaultEngine** | `0xa9255087b8d1B75456eA5d4fc272B884E7A7AE8a` | Core accounting system |
| **CollateralJoin** | `0x0b54a6bf84108d7C8d5a2296Df4a2264b1f7Fd66` | Collateral gateway (legacy) |
| **PriceOracle** | `0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99` | USDC/INR price feed |
| **MockUSDC** | `0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43` | Test USDC (6 decimals) |
| **USDCYieldVault** | `0x0009f72e3c176163037807f6365695DCeED2a09B` | USDC staking (5% APY) |
| **OINRYieldVault** | `0x5923227b1E40fEbDA88B5231a573069F9669Fb9a` | oINR staking (5% APY) |

### Contract Relationships

```
User
  ↓
VaultManager (user interface)
  ↓
├─→ VaultEngine (tracks collateral & debt)
├─→ oINR (mints/burns tokens)
├─→ MockUSDC (collateral token)
└─→ PriceOracle (gets USDC/INR price)

Separately:
User → YieldVault → Deposits USDC/oINR → Earns 5% APY
```

### Key Contract Functions

#### VaultManager.sol
```solidity
function deposit(uint256 amount) external
// User deposits USDC as collateral
// Transfers USDC from user to contract
// Updates VaultEngine collateral balance

function borrow(uint256 amount) external  
// User borrows oINR against collateral
// Checks collateralization ratio (150% min)
// Mints oINR to user wallet

function repay(uint256 amount) external
// User repays oINR debt
// Burns oINR from user
// Reduces debt in VaultEngine

function withdraw(uint256 amount) external
// User withdraws USDC collateral
// Checks remaining collateral ratio
// Transfers USDC back to user

function buyOINR(uint256 oinrAmount) external
// Direct USDC → oINR swap (no collateral)
// User pays USDC at oracle price
// Receives oINR immediately
```

#### VaultEngine.sol
```solidity
struct Vault {
    uint256 collateral; // USDC amount
    uint256 debt;       // oINR borrowed
}

mapping(address => Vault) public vaults;

// Only VaultManager can call these:
function increaseCollateral(address user, uint256 amount) external
function decreaseCollateral(address user, uint256 amount) external
function increaseDebt(address user, uint256 amount) external
function decreaseDebt(address user, uint256 amount) external
```

#### oINR.sol
```solidity
contract oINR is ERC20, Ownable {
    // Standard ERC20 with mint/burn restricted to owner
    function mint(address to, uint256 amount) external onlyOwner
    function burn(address from, uint256 amount) external onlyOwner
}
// Owner = VaultManager contract address
```

#### YieldVault.sol
```solidity
struct Deposit {
    uint256 amount;
    uint256 depositTime;
    uint256 lastClaimTime;
}

function deposit(uint256 amount) external
// Stake USDC/oINR to earn yield

function withdraw(uint256 amount) external
// Unstake principal

function claimYield() external
// Claim earned interest

function calculateYield(address user) public view returns (uint256)
// Formula: (amount * 500 * timeElapsed) / (365 days * 10000)
// 500 basis points = 5% APY
```

### Important Constants

```solidity
// VaultManager
minCollateralizationRatio = 15000  // 150% (basis points)
RATIO_PRECISION = 10000            // 100%
PRICE_PRECISION = 1e18             // Oracle decimals

// PriceOracle
USDC_PRICE_INR = 83e18             // 1 USDC = 83 INR
PRECISION = 1e18                   // 18 decimals

// YieldVault
APY = 500                          // 5% (basis points)
```

### Security Features

1. **ReentrancyGuard**: Prevents reentrancy attacks on VaultManager
2. **Ownable**: Access control for admin functions
3. **Checks-Effects-Interactions**: Safe state updates before external calls
4. **Overflow Protection**: Solidity 0.8+ built-in
5. **Collateral Ratio Enforcement**: Prevents under-collateralized borrows

---

## 4. Mobile App Structure

### Technology Stack

```javascript
{
  "framework": "React Native 0.81.5",
  "platform": "Expo SDK 54",
  "navigation": "State-based (currentScreen variable)",
  "authentication": "Magic Link SDK",
  "blockchain": "ethers.js v6",
  "icons": "@expo/vector-icons",
  "gradients": "expo-linear-gradient",
  "qr": "expo-barcode-scanner"
}
```

### File Structure

```
oruva-mobile/
├── App.js                        # Main app entry point
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
│
├── screens/                      # Main screens
│   ├── HomeScreen.js            # Dashboard with quick actions
│   ├── BalancesScreen.js        # Token balances & history
│   ├── VaultScreen.js           # Legacy vault (replaced)
│   ├── DepositScreen.js         # Deposit USDC collateral
│   ├── BorrowScreen.js          # Borrow oINR
│   ├── BuyOINRScreen.js         # Buy oINR with USDC
│   ├── RepayScreen.js           # Repay debt
│   └── MintUSDCScreen.js        # Get test USDC
│
├── components/                   # Reusable components
│   ├── LoginScreen.js           # Email/key import login
│   ├── ProfileTab.js            # User profile & settings
│   ├── AadhaarVerification.js   # KYC flow
│   └── ui/                      # UI components (planned)
│
├── src/
│   └── services/
│       ├── cashfree.js          # Payment gateway API
│       └── aadhaar.js           # KYC service API
│
└── assets/
    └── images/
        ├── oruva-logo-white.jpeg
        └── LOGO_SETUP.md
```

### Screen Navigation Flow

```
App.js (Entry Point)
  ├─ currentScreen = 'login'     → LoginScreen
  ├─ currentScreen = 'aadhaar'   → AadhaarVerification
  ├─ currentScreen = 'home'      → HomeScreen
  ├─ currentScreen = 'balances'  → BalancesScreen
  ├─ currentScreen = 'deposit'   → DepositScreen
  ├─ currentScreen = 'borrow'    → BorrowScreen
  ├─ currentScreen = 'buy'       → BuyOINRScreen
  ├─ currentScreen = 'repay'     → RepayScreen
  ├─ currentScreen = 'mintusdc'  → MintUSDCScreen
  └─ currentScreen = 'profile'   → ProfileTab
```

### Design System (PayTM Style)

#### Colors
```javascript
const colors = {
  // Primary blue palette
  darkBlue: '#002E6E',      // Headers, primary buttons
  midBlue: '#00509E',       // Gradients
  brightCyan: '#00BAF2',    // Accents, links
  
  // Gradients
  headerGradient: ['#002E6E', '#00509E'],
  buttonGradient: ['#00BAF2', '#0086C9'],
  successGradient: ['#4CAF50', '#2E7D32'],
  
  // Neutrals
  background: '#F5F5F5',    // Screen background
  cardWhite: '#FFFFFF',     // Card backgrounds
  textDark: '#333333',      // Primary text
  textMedium: '#666666',    // Secondary text
  textLight: '#999999',     // Tertiary text
  border: '#E0E0E0',        // Borders
  inputBg: '#FAFAFA',       // Input backgrounds
  
  // Status
  success: '#4CAF50',       // Success messages
  error: '#F44336',         // Error messages
  warning: '#FF9800',       // Warnings
};
```

#### Typography
```javascript
const typography = {
  // Logo
  logoText: {
    fontSize: 72,
    fontWeight: '300',      // Thin, modern
    letterSpacing: -2,
  },
  
  // Headers
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  
  // Body
  body: { fontSize: 16, fontWeight: 'normal' },
  bodySmall: { fontSize: 14 },
  caption: { fontSize: 12 },
};
```

#### Components
```javascript
// Card
<View style={{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}}>

// Gradient Button
<TouchableOpacity style={{ borderRadius: 8, overflow: 'hidden' }}>
  <LinearGradient
    colors={['#00BAF2', '#0086C9']}
    style={{ padding: 16, alignItems: 'center' }}
  >
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
      Button Text
    </Text>
  </LinearGradient>
</TouchableOpacity>

// Gradient Header
<LinearGradient
  colors={['#002E6E', '#00509E']}
  style={{ paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 }}
>
  <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>
    Screen Title
  </Text>
</LinearGradient>
```

### State Management

```javascript
// App.js manages global state
const [connected, setConnected] = useState(false);
const [address, setAddress] = useState('');
const [magic, setMagic] = useState(null);
const [provider, setProvider] = useState(null);
const [currentScreen, setCurrentScreen] = useState('login');

// Balances
const [balances, setBalances] = useState({
  usdc: '0',
  oinr: '0',
  flow: '0'
});

// Vault info
const [vaultInfo, setVaultInfo] = useState({
  collateral: '0',
  debt: '0',
  ratio: '0'
});

// Form state for each action
const [depositAmount, setDepositAmount] = useState('');
const [borrowAmount, setBorrowAmount] = useState('');
const [buyAmount, setBuyAmount] = useState('');
const [repayAmount, setRepayAmount] = useState('');
const [mintAmount, setMintAmount] = useState('');

// Loading states
const [loading, setLoading] = useState(false);
```

### Key User Flows

#### 1. Login Flow
```
1. User opens app → LoginScreen
2. Options: Email login OR Import private key
3. Email login:
   - Enter email → Magic sends verification email
   - Click link → Wallet created
   - Provider initialized with ethers.js
4. Import key:
   - Paste private key → Wallet imported
   - Direct provider creation
5. App navigates to 'aadhaar' or 'home'
```

#### 2. Aadhaar KYC Flow
```
1. AadhaarVerification screen loads
2. Step 1: Enter 12-digit Aadhaar number
3. Click "Generate OTP" → Backend calls Digilocker API
4. Step 2: Enter 6-digit OTP
5. Click "Verify OTP" → Backend fetches KYC data
6. Step 3: Success screen shows:
   - Name, DOB, Address, Photo
7. Navigate to home screen
```

#### 3. Deposit Collateral Flow
```
1. HomeScreen → Click "Deposit" icon
2. DepositScreen loads with current vault info
3. User enters amount (e.g., "100")
4. Checks: amount > 0, user has USDC balance
5. Click "Deposit Collateral" button
6. Two transactions:
   a. USDC.approve(VaultManager, 100)
   b. VaultManager.deposit(100)
7. Wait for confirmations
8. Success: Update balances, navigate back
```

#### 4. Borrow oINR Flow
```
1. HomeScreen → Click "Borrow" icon
2. BorrowScreen shows:
   - Current collateral
   - Current debt
   - Max borrow (66% of collateral value)
3. User enters amount
4. Check: newDebt keeps ratio ≥ 150%
5. Click "Borrow oINR"
6. Transaction: VaultManager.borrow(amount)
7. oINR minted to user wallet
8. Debt updated in VaultEngine
```

#### 5. Buy oINR (Direct Purchase)
```
1. HomeScreen → Click "Buy oINR" icon
2. BuyOINRScreen shows:
   - USDC balance
   - oINR balance
   - Exchange rate (1 USDC = 83 oINR)
3. User enters USDC amount
4. Preview: "You will receive ~[amount * 83] oINR"
5. Click "Buy oINR"
6. Two transactions:
   a. USDC.approve(VaultManager, amount)
   b. VaultManager.buyOINR(oinrAmount)
7. User gets oINR without opening vault
```

---

## 5. Backend API

### Structure

```
backend/
├── server.js              # Express app entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
├── routes/
│   ├── cashfree.js       # Payment gateway routes
│   └── aadhaar.js        # KYC routes
└── services/
    └── (planned)
```

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Flow EVM
FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
CHAIN_ID=545
PRIVATE_KEY=0x... (backend wallet for minting)

# Contracts
OINR_TOKEN_ADDRESS=0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae
VAULT_MANAGER_ADDRESS=0x5F1311808ED97661D5b31F4C67637D8952a54cc0

# Cashfree
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=TEST

# Optional
DATABASE_URL=postgres://...
JWT_SECRET=...
```

### API Endpoints

#### Cashfree Routes (`/api/*`)

```javascript
POST /api/create-order
// Create payment order for INR deposit
// Body: { amount, customerName, customerEmail, customerPhone, walletAddress }
// Returns: { orderId, paymentSessionId, checkoutUrl }

GET /api/transactions/:walletAddress
// Get transaction history for a wallet
// Returns: { success, transactions: [...] }

POST /api/verify-and-mint
// Verify payment and mint oINR (manual trigger)
// Body: { orderId }
// Returns: { success, txHash, oinrMinted }

GET /api/balance/:walletAddress
// Get oINR balance
// Returns: { success, balance }

POST /api/webhook
// Cashfree payment webhook (automatic)
// Triggered by Cashfree on payment success/failure
// Automatically mints oINR on successful payment
```

#### Aadhaar Routes (`/api/aadhaar/*`)

```javascript
POST /api/aadhaar/generate-otp
// Generate OTP for Aadhaar verification
// Body: { aadhaarNumber, email }
// Returns: { success, referenceId, message, __mockOTP }

POST /api/aadhaar/verify-otp
// Verify OTP and fetch KYC data
// Body: { referenceId, otp, email }
// Returns: { success, data: { name, dob, address, photo } }

GET /api/aadhaar/kyc-status/:email
// Check if user has completed KYC
// Returns: { success, verified, data }
```

### Network Configuration

#### Local Development
```
Backend: http://localhost:3000
Mobile:  http://10.81.135.231:3000 (local IP for device)
```

#### Ngrok (for Cashfree webhooks)
```
Tunnel: https://subpermanently-doughy-bonny.ngrok-free.dev
Maps to: http://localhost:3000
Purpose: Cashfree sends webhooks to public URL

Start: cd backend && ngrok http 3000
Update: oruva-mobile/src/services/cashfree.js BACKEND_URL
```

### Webhook Flow

```
1. User completes Cashfree payment
2. Cashfree sends POST to webhook URL:
   POST https://ngrok-url/api/webhook
   Body: { order_id, payment_status, order_amount, etc. }
3. Backend verifies signature
4. Backend mints oINR:
   - Calculate: oinrAmount = inrAmount (1:1 peg)
   - Call: oinrToken.mint(walletAddress, oinrAmount)
5. Backend saves transaction
6. Returns 200 OK to Cashfree
```

---

## 6. Development History

### Key Milestones

**Phase 1: Smart Contract Development (Oct 2025)**
- ✅ Deployed VaultEngine, VaultManager, oINR token
- ✅ Integrated PriceOracle for USDC/INR conversion
- ✅ Added YieldVault contracts for staking
- ✅ Tested on Flow EVM Testnet

**Phase 2: Mobile App Foundation (Oct 2025)**
- ✅ Built React Native app with Expo
- ✅ Integrated Magic Link authentication
- ✅ Created VaultScreen for deposits/borrows
- ✅ Added balance tracking

**Phase 3: UI Redesign (Oct 28, 2025)**
- ✅ Split VaultScreen into 5 individual screens
- ✅ Applied PayTM-style blue gradient theme
- ✅ Removed all emojis, replaced with vector icons
- ✅ Made vault services horizontally scrollable
- ✅ Updated logout button styling

**Phase 4: Payment Integration (Oct 29, 2025)**
- ✅ Integrated Cashfree payment gateway
- ✅ Added Aadhaar KYC verification
- ✅ Fixed backend connectivity issues
- ✅ Resolved ngrok URL mismatch for webhooks

**Phase 5: Documentation & Polish (Oct 30, 2025)**
- ✅ Updated README with Flow blockchain details
- ✅ Listed all contract addresses
- ✅ Simplified login screen logo
- ✅ Created comprehensive documentation

### Recent Changes (Last 7 Days)

```
Oct 28: Split vault UI into individual screens
Oct 28: Applied PayTM blue gradient theme throughout
Oct 28: Fixed Aadhaar service to use local IP
Oct 28: Fixed Cashfree ngrok URL (.app → .dev)
Oct 28: Fixed BuyOINRScreen balance display
Oct 29: Updated LoginScreen logo to text-based
Oct 30: Created PROJECT_CONTEXT.md for AI handoff
Oct 30: Pushed latest changes to GitHub master
```

---

## 7. Current State

### What's Working ✅

1. **Smart Contracts**: All 8 contracts deployed and functional
2. **Mobile App**: Complete UI with all screens
3. **Authentication**: Magic Link email login working
4. **Vault Operations**: Deposit, borrow, repay, withdraw functional
5. **Direct Purchase**: Buy oINR with USDC working
6. **Yield Vaults**: Staking USDC/oINR for 5% APY
7. **Cashfree Integration**: Payment gateway connected
8. **Aadhaar KYC**: Basic verification flow implemented

### What's Pending ⏳

1. **Transaction Indexer**: No backend database for history
2. **Production Ngrok**: Free plan URL changes on restart
3. **App Store Deployment**: Not yet submitted
4. **Mainnet Deployment**: Still on testnet
5. **Advanced Features**: Liquidations, governance, multi-collateral

### Known Issues 🐛

1. **Ngrok URL Changes**: Must update `cashfree.js` when ngrok restarts
2. **Transaction History Empty**: Returns `[]` (needs indexer)
3. **Expo Fetch Error**: Network error on `expo start` (doesn't block)
4. **Mobile Logo**: Using text instead of image (can be improved)

---

## 8. Code Patterns

### Common Patterns to Follow

#### 1. Screen Structure
```javascript
export default function ScreenName({
    vaultInfo,
    amount,
    setAmount,
    loading,
    onSubmit,
    onBack
}) {
    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient colors={['#002E6E', '#00509E']} style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Screen Title</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Current Status</Text>
                    {/* Info rows */}
                </View>

                {/* Action Card */}
                <View style={styles.card}>
                    <MaterialCommunityIcons name="icon-name" size={48} color="#00BAF2" />
                    <Text style={styles.cardTitle}>Action Title</Text>
                    <TextInput style={styles.input} />
                    
                    <TouchableOpacity style={styles.button} onPress={onSubmit}>
                        <LinearGradient colors={['#00BAF2', '#0086C9']} style={styles.buttonInner}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
```

#### 2. Contract Interaction
```javascript
async function interactWithContract() {
    try {
        setLoading(true);
        
        // Get signer
        const signer = provider.getSigner();
        
        // Create contract instance
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );
        
        // Call function
        const tx = await contract.functionName(param1, param2);
        console.log('Transaction hash:', tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Confirmed in block:', receipt.blockNumber);
        
        // Update UI
        Alert.alert('Success', 'Transaction completed!');
        await fetchBalances(); // Refresh balances
        
    } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', error.message);
    } finally {
        setLoading(false);
    }
}
```

#### 3. Balance Formatting
```javascript
// Contract returns wei (18 decimals), display in human-readable
const formatBalance = (wei, decimals = 18) => {
    return ethers.formatUnits(wei, decimals);
};

// Convert user input to wei
const parseAmount = (amount, decimals = 18) => {
    return ethers.parseUnits(amount.toString(), decimals);
};

// Example
const usdcBalance = '1000000'; // 1 USDC in 6 decimals
const formatted = ethers.formatUnits(usdcBalance, 6); // "1.0"
```

#### 4. Error Handling
```javascript
try {
    // Contract call
    const tx = await contract.deposit(amount);
    await tx.wait();
} catch (error) {
    if (error.code === 'ACTION_REJECTED') {
        Alert.alert('Cancelled', 'Transaction was cancelled');
    } else if (error.message.includes('insufficient funds')) {
        Alert.alert('Error', 'Insufficient balance');
    } else if (error.message.includes('Insufficient collateralization')) {
        Alert.alert('Error', 'Not enough collateral to borrow this amount');
    } else {
        Alert.alert('Error', 'Transaction failed. Please try again.');
        console.error('Full error:', error);
    }
}
```

---

## 9. Common Issues & Solutions

### Issue 1: Ngrok URL Changed
**Symptom**: Cashfree payments return 404 error

**Solution**:
```bash
# 1. Check current ngrok URL
cd backend
ngrok http 3000
# Copy the new URL (e.g., https://xyz.ngrok-free.dev)

# 2. Update mobile app
cd ../oruva-mobile
# Edit src/services/cashfree.js
# Update BACKEND_URL to new ngrok URL

# 3. Restart mobile app
npm start -- --clear
```

### Issue 2: Transaction Not Updating UI
**Symptom**: User deposits USDC but balance doesn't update

**Solution**:
```javascript
// After transaction, always refresh balances
const handleDeposit = async () => {
    const tx = await vaultManager.deposit(amount);
    await tx.wait();
    
    // ✅ Refresh balances
    await fetchBalances();
    await fetchVaultInfo();
    
    // ✅ Navigate back
    setCurrentScreen('home');
};
```

### Issue 3: Collateralization Ratio Error
**Symptom**: Can't borrow even with collateral

**Calculation**:
```javascript
// Formula: ratio = (collateralValue * 10000) / debt
// Must be ≥ 15000 (150%)

// Example:
collateral = 100 USDC
usdcPrice = 83 INR (with 18 decimals: 83e18)
collateralValue = 100 * 83e18 = 8300e18 INR

maxDebt = (8300e18 * 10000) / 15000 = 5533e18 oINR

// User can borrow up to 5533 oINR
```

### Issue 4: Magic Link Not Working
**Symptom**: Email login fails or wallet not created

**Checklist**:
1. Check Magic Link dashboard for errors
2. Verify API key in `.env`
3. Clear Expo cache: `expo start -c`
4. Check internet connection
5. Try different email address

### Issue 5: Contract Call Fails
**Symptom**: "execution reverted" error

**Debug Steps**:
```bash
# 1. Check contract on explorer
https://evm-testnet.flowscan.io/address/[CONTRACT_ADDRESS]

# 2. Verify contract state
cast call [CONTRACT_ADDRESS] "balanceOf(address)(uint256)" [YOUR_ADDRESS] --rpc-url https://testnet.evm.nodes.onflow.org

# 3. Check gas balance
cast balance [YOUR_ADDRESS] --rpc-url https://testnet.evm.nodes.onflow.org

# 4. Get testnet FLOW
https://testnet-faucet.onflow.org/
```

---

## 10. Future AI Assistant Guidelines

### When Starting a New Chat

1. **Read this file first**: `PROJECT_CONTEXT.md`
2. **Check current state**: `git status` and `git log`
3. **Review recent changes**: Look at last 3-5 commits
4. **Understand user's goal**: Ask clarifying questions

### Before Making Changes

1. **Verify file structure**: Use `list_dir` to confirm paths
2. **Read existing code**: Use `read_file` before editing
3. **Check dependencies**: Review `package.json` files
4. **Test locally**: Suggest user test changes before committing

### Code Modification Best Practices

1. **Preserve design patterns**: Follow existing code structure
2. **Maintain PayTM theme**: Use established color scheme
3. **Update related files**: If changing contract, update mobile app too
4. **Document changes**: Update this file if architecture changes

### Common User Requests

**"Add a new feature"**
1. Understand where it fits in architecture
2. Check if contracts need updates (usually no)
3. Add screen/component to mobile app
4. Update navigation in App.js
5. Test and commit

**"Fix a bug"**
1. Reproduce the issue
2. Check Common Issues section above
3. Diagnose root cause
4. Apply fix following code patterns
5. Test thoroughly

**"Deploy to mainnet"**
1. Update `.env` files with mainnet RPC
2. Deploy contracts: `forge script --rpc-url mainnet`
3. Update CONTRACT_ADDRESSES.json
4. Update mobile app contract addresses
5. Test on mainnet before public launch

**"Improve UI"**
1. Maintain PayTM blue theme
2. Use LinearGradient for headers/buttons
3. Keep vector icons (no emojis)
4. Follow existing component structure
5. Ensure responsive design

### Git Workflow

```bash
# Always check status first
git status

# Stage changes
git add -A

# Commit with descriptive message
git commit -m "feat: Add new screen for X
- Detail 1
- Detail 2
- Detail 3"

# Push to master
git push origin master
```

### Testing Checklist

Before telling user "Done":
- [ ] Code compiles without errors
- [ ] No console errors in mobile app
- [ ] Smart contract functions work
- [ ] UI looks good on both iOS/Android
- [ ] Navigation flows correctly
- [ ] Backend endpoints respond
- [ ] All files saved and committed

---

## 📝 Important Notes for AI Assistants

### DO:
✅ Maintain consistent PayTM blue theme  
✅ Use vector icons from @expo/vector-icons  
✅ Follow existing code patterns  
✅ Test thoroughly before marking complete  
✅ Update this document when architecture changes  
✅ Ask clarifying questions when unclear  
✅ Check CONTRACT_ADDRESSES.json for addresses  
✅ Use ngrok for Cashfree webhook testing  

### DON'T:
❌ Add emojis to UI (removed in redesign)  
❌ Change color scheme without consultation  
❌ Modify deployed contract addresses  
❌ Commit .env files  
❌ Break existing functionality  
❌ Ignore error handling  
❌ Use outdated ngrok URLs  
❌ Create new navigation patterns  

---

## 🔗 Quick Reference Links

- **Repository**: https://github.com/anish-ck/Oruva
- **Flow Explorer**: https://evm-testnet.flowscan.io/
- **Flow Faucet**: https://testnet-faucet.onflow.org/
- **Magic Link Dashboard**: https://magic.link/
- **Cashfree Dashboard**: https://www.cashfree.com/
- **Expo Documentation**: https://docs.expo.dev/

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Smart Contracts**: 8 deployed
- **Mobile Screens**: 12+
- **API Endpoints**: 10+
- **Supported Tokens**: USDC, oINR, FLOW
- **Deployment Date**: October 28, 2025
- **Current Network**: Flow EVM Testnet (Chain ID: 545)

---

**Last Updated**: October 30, 2025  
**Document Version**: 1.0  
**Maintained By**: Anish (@anish-ck)

---

*This document should be updated whenever significant changes are made to the project architecture, codebase, or deployment.*
