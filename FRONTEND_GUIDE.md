# Frontend Development Guide - Oruva DeFi Bank

## 📋 Quick Start

### Contract Addresses
All contract addresses are in `CONTRACT_ADDRESSES.json`

### ABIs Location
Contract ABIs are in: `out/[ContractName].sol/[ContractName].json`

Example:
- VaultManager ABI: `out/VaultManager.sol/VaultManager.json`
- oINR ABI: `out/oINR.sol/oINR.json`

---

## 🔌 Network Configuration

```javascript
const flowEVMTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
    public: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://evm-testnet.flowscan.io' },
  },
}
```

---

## 🎯 Main Functions to Integrate

### 1. **VaultManager Contract** (Main Interface)

```javascript
// Import contract address and ABI
import contractAddresses from './CONTRACT_ADDRESSES.json';
import VaultManagerABI from './out/VaultManager.sol/VaultManager.json';

const VAULT_MANAGER = contractAddresses.contracts.VaultManager.address;
```

#### Functions:

**a) Deposit Collateral**
```javascript
// User deposits MockUSDC
// Amount in USDC decimals (6 decimals)
async function deposit(amount) {
  // amount = 1000000000 for 1000 USDC
  await vaultManager.deposit(amount);
}
```

**b) Borrow oINR**
```javascript
// User borrows oINR
// Amount in oINR decimals (18 decimals)
async function borrow(amount) {
  // amount = ethers.parseEther("50000") for 50,000 oINR
  await vaultManager.borrow(amount);
}
```

**c) Repay Debt**
```javascript
// User repays oINR
async function repay(amount) {
  await vaultManager.repay(amount);
}
```

**d) Withdraw Collateral**
```javascript
// User withdraws USDC
async function withdraw(amount) {
  await vaultManager.withdraw(amount);
}
```

**e) Get Vault Info (Read-only)**
```javascript
async function getVaultInfo(userAddress) {
  const info = await vaultManager.getVaultInfo(userAddress);
  return {
    collateral: info[0], // USDC amount (6 decimals)
    debt: info[1],       // oINR amount (18 decimals)
    collateralValueINR: info[2], // Value in INR (18 decimals)
    ratio: info[3],      // Collateralization ratio (basis points)
    isHealthy: info[4]   // true/false
  };
}
```

**f) Check Borrow Capacity (Read-only)**
```javascript
async function checkBorrowCapacity(userAddress, amount) {
  const result = await vaultManager.checkBorrowCapacity(userAddress, amount);
  return {
    canBorrow: result[0],    // true/false
    maxBorrowable: result[1] // Max oINR amount (18 decimals)
  };
}
```

---

## 💰 Token Contracts

### MockUSDC (Collateral)
```javascript
const MOCK_USDC = contractAddresses.contracts.MockUSDC.address;

// Approve VaultManager to spend USDC
async function approveUSDC(amount) {
  await mockUSDC.approve(VAULT_MANAGER, amount);
}

// Get USDC balance
async function getUSDCBalance(address) {
  return await mockUSDC.balanceOf(address);
}

// Mint test USDC (for testing only)
async function mintUSDC(amount) {
  await mockUSDC.mint(userAddress, amount);
}
```

### oINR Token
```javascript
const OINR = contractAddresses.contracts.oINR.address;

// Get oINR balance
async function getOINRBalance(address) {
  return await oinr.balanceOf(address);
}

// Approve VaultManager to burn oINR (for repay)
async function approveOINR(amount) {
  await oinr.approve(VAULT_MANAGER, amount);
}
```

---

## 🔢 Important Calculations

### Convert USDC to display value
```javascript
function formatUSDC(amount) {
  // USDC has 6 decimals
  return (amount / 1e6).toFixed(2);
}
```

### Convert oINR to display value
```javascript
function formatOINR(amount) {
  // oINR has 18 decimals
  return ethers.formatEther(amount);
}
```

### Calculate collateral ratio percentage
```javascript
function formatRatio(ratioBasisPoints) {
  // Ratio is in basis points (10000 = 100%)
  return (ratioBasisPoints / 100).toFixed(2) + '%';
}
```

### Calculate max borrowable
```javascript
function calculateMaxBorrow(collateralValueINR) {
  // collateralValueINR is in 18 decimals
  // minRatio = 15000 (150%)
  const maxBorrow = (collateralValueINR * 10000n) / 15000n;
  return maxBorrow;
}
```

---

## 📱 Example User Flow

```javascript
// 1. User deposits 1000 USDC
const usdcAmount = 1000 * 1e6; // 1000 USDC (6 decimals)

// First approve
await mockUSDC.approve(VAULT_MANAGER, usdcAmount);

// Then deposit
await vaultManager.deposit(usdcAmount);

// 2. Check how much user can borrow
const vaultInfo = await vaultManager.getVaultInfo(userAddress);
console.log("Collateral Value:", ethers.formatEther(vaultInfo.collateralValueINR), "INR");

const maxBorrow = (vaultInfo.collateralValueINR * 10000n) / 15000n;
console.log("Max Borrowable:", ethers.formatEther(maxBorrow), "oINR");

// 3. Borrow 50,000 oINR
const borrowAmount = ethers.parseEther("50000");
await vaultManager.borrow(borrowAmount);

// 4. Later, repay the debt
await oinr.approve(VAULT_MANAGER, borrowAmount);
await vaultManager.repay(borrowAmount);

// 5. Withdraw collateral
await vaultManager.withdraw(usdcAmount);
```

---

## 🎨 UI Components Needed

### 1. **Dashboard**
- Display user's vault info
- Show collateral amount (USDC)
- Show debt amount (oINR)
- Show collateral ratio
- Health indicator (Green if > 150%, Red if below)

### 2. **Deposit Form**
- Input for USDC amount
- Show current USDC balance
- Approve + Deposit buttons
- Show collateral value in INR

### 3. **Borrow Form**
- Input for oINR amount
- Show max borrowable
- Show resulting collateral ratio
- Warning if ratio < 200%
- Borrow button

### 4. **Repay Form**
- Input for oINR amount
- Show current debt
- Show oINR balance
- Approve + Repay buttons

### 5. **Withdraw Form**
- Input for USDC amount
- Check if withdrawal is safe
- Show resulting ratio
- Withdraw button

---

## 🧪 Testing

### Get Test USDC
```javascript
// Mint 10,000 test USDC
await mockUSDC.mint(userAddress, 10000 * 1e6);
```

### Test Addresses
- Your Wallet: Connect with MetaMask
- Network: Flow EVM Testnet (Chain ID: 545)
- Add network in MetaMask with RPC: https://testnet.evm.nodes.onflow.org

---

## 📊 Key Numbers to Display

1. **Collateral Value**: Show in both USDC and INR
2. **Debt**: Show in oINR
3. **Collateral Ratio**: Show as percentage (e.g., 166%)
4. **Health Status**: Good (>200%), Warning (150-200%), Danger (<150%)
5. **Max Borrowable**: Calculate and show available credit

---

## 🔗 Useful Libraries

```bash
npm install ethers@6
npm install wagmi viem
npm install @rainbow-me/rainbowkit
```

---

## 📞 Contract Events to Listen

```javascript
// Listen to deposit events
vaultManager.on("Deposited", (user, amount) => {
  console.log(`${user} deposited ${amount}`);
});

// Listen to borrow events
vaultManager.on("Borrowed", (user, amount) => {
  console.log(`${user} borrowed ${amount}`);
});

// Listen to repay events
vaultManager.on("Repaid", (user, amount) => {
  console.log(`${user} repaid ${amount}`);
});

// Listen to withdraw events
vaultManager.on("Withdrawn", (user, amount) => {
  console.log(`${user} withdrew ${amount}`);
});
```

---

## ⚠️ Important Notes

1. **Always approve before deposit/repay**
2. **Check balances before transactions**
3. **Show loading states during transactions**
4. **Handle transaction errors gracefully**
5. **Show transaction confirmations**
6. **Update UI after successful transactions**

---

## 🎯 Priority Features

### Must Have:
- ✅ Connect wallet (MetaMask)
- ✅ View vault info
- ✅ Deposit USDC
- ✅ Borrow oINR
- ✅ Repay oINR
- ✅ Withdraw USDC

### Nice to Have:
- Transaction history
- Price charts
- Notifications
- Mobile responsive design

---

## 🚀 Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy ABIs from `out/` folder
4. Use addresses from `CONTRACT_ADDRESSES.json`
5. Build your frontend!

---

**Questions? Check the main README.md for more details!**
