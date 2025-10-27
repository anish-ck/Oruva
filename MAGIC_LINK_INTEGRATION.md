# 🪄 Magic Link Integration Guide for Frontend

## ✅ Good News!

**Your Magic Link walletless onboarding works perfectly with our smart contracts!** No changes needed to the deployed contracts. Users can login with email and interact with the DeFi bank seamlessly.

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  User enters email → Magic creates wallet → Use DeFi Bank  │
└─────────────────────────────────────────────────────────────┘

Traditional:  Install MetaMask → Save seed phrase → Connect
Magic Link:   Enter email → Click link → Done! ✅
```

---

## 🔧 Quick Setup

### 1. Install Dependencies

```bash
npm install magic-sdk ethers@5
```

### 2. Initialize Magic

```javascript
// src/config/magic.js
import { Magic } from 'magic-sdk';

const magic = new Magic('YOUR_PUBLISHABLE_KEY', {
  network: {
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    chainId: 545,
  },
});

export default magic;
```

### 3. Contract Configuration

```javascript
// src/config/contracts.js
export const CONTRACTS = {
  vaultManager: '0x22E1AE8A85e76e94683D668c0107b69eF18a62cA',
  vaultEngine: '0x544759a30fD8fbf6E26b2184119F49921BF3c265',
  oinr: '0x883Fa6BE70D11516dC3d9ED851278829a746840F',
  mockUSDC: '0x6BF62E80CaF83847eD57233Ee119673F8fF7aB5c',
  priceOracle: '0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e',
  collateralJoin: '0x248Ed726c497238c1bD8977b1E377559daE1c479',
};

export const NETWORK = {
  chainId: 545,
  name: 'Flow EVM Testnet',
  rpcUrl: 'https://testnet.evm.nodes.onflow.org',
  explorer: 'https://evm-testnet.flowscan.io',
};
```

---

## 📱 User Flow Implementation

### Step 1: Login with Email

```javascript
// src/services/auth.js
import magic from '../config/magic';
import { ethers } from 'ethers';

export async function loginWithEmail(email) {
  try {
    // Magic handles the email link
    await magic.auth.loginWithEmailOTP({ email });
    
    // Get user's wallet address (auto-created by Magic)
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('User logged in!', address);
    return { provider, signer, address };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function logout() {
  await magic.user.logout();
}

export async function isLoggedIn() {
  return await magic.user.isLoggedIn();
}
```

### Step 2: Interact with VaultManager

```javascript
// src/services/vault.js
import { ethers } from 'ethers';
import magic from '../config/magic';
import { CONTRACTS } from '../config/contracts';

// Import ABIs (get from out/ folder)
import VaultManagerABI from '../abis/VaultManager.json';
import MockUSDCABI from '../abis/MockUSDC.json';
import oINRABI from '../abis/oINR.json';

class VaultService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.vaultManager = null;
    this.usdc = null;
    this.oinr = null;
  }

  // Call this after user logs in
  async initialize() {
    this.provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    this.signer = this.provider.getSigner();
    
    // Initialize contract instances
    this.vaultManager = new ethers.Contract(
      CONTRACTS.vaultManager,
      VaultManagerABI.abi,
      this.signer
    );
    
    this.usdc = new ethers.Contract(
      CONTRACTS.mockUSDC,
      MockUSDCABI.abi,
      this.signer
    );
    
    this.oinr = new ethers.Contract(
      CONTRACTS.oinr,
      oINRABI.abi,
      this.signer
    );
  }

  // Get user's vault information
  async getVaultInfo(userAddress) {
    const info = await this.vaultManager.getVaultInfo(userAddress);
    
    return {
      collateral: ethers.utils.formatUnits(info.collateral, 6), // USDC has 6 decimals
      debt: ethers.utils.formatEther(info.debt), // oINR has 18 decimals
      collateralValueINR: ethers.utils.formatEther(info.collateralValueINR),
      ratio: info.ratio.toNumber() / 100, // Convert basis points to percentage
      isHealthy: info.isHealthy,
    };
  }

  // 1. Deposit USDC collateral
  async deposit(amountUSDC) {
    const amount = ethers.utils.parseUnits(amountUSDC.toString(), 6);
    
    // Step 1: Approve VaultManager to spend USDC
    console.log('Approving USDC...');
    const approveTx = await this.usdc.approve(CONTRACTS.vaultManager, amount);
    await approveTx.wait();
    console.log('USDC approved ✅');
    
    // Step 2: Deposit to vault
    console.log('Depositing...');
    const depositTx = await this.vaultManager.deposit(amount);
    const receipt = await depositTx.wait();
    console.log('Deposited successfully! ✅');
    
    return receipt;
  }

  // 2. Borrow oINR
  async borrow(amountOINR) {
    const amount = ethers.utils.parseEther(amountOINR.toString());
    
    console.log('Borrowing oINR...');
    const tx = await this.vaultManager.borrow(amount);
    const receipt = await tx.wait();
    console.log('Borrowed successfully! ✅');
    
    return receipt;
  }

  // 3. Buy oINR with USDC (for users who spent their oINR)
  async buyOINR(amountOINR) {
    const amount = ethers.utils.parseEther(amountOINR.toString());
    
    // Calculate required USDC (assuming 83 INR per USDC)
    const requiredUSDC = ethers.utils.parseUnits(
      (amountOINR / 83).toFixed(6),
      6
    );
    
    // Step 1: Approve USDC
    console.log('Approving USDC for purchase...');
    const approveTx = await this.usdc.approve(CONTRACTS.vaultManager, requiredUSDC);
    await approveTx.wait();
    
    // Step 2: Buy oINR
    console.log('Buying oINR...');
    const tx = await this.vaultManager.buyOINR(amount);
    const receipt = await tx.wait();
    console.log('oINR purchased! ✅');
    
    return receipt;
  }

  // 4. Repay debt
  async repay(amountOINR) {
    const amount = ethers.utils.parseEther(amountOINR.toString());
    
    // Step 1: Approve VaultManager to burn oINR
    console.log('Approving oINR...');
    const approveTx = await this.oinr.approve(CONTRACTS.vaultManager, amount);
    await approveTx.wait();
    
    // Step 2: Repay
    console.log('Repaying debt...');
    const tx = await this.vaultManager.repay(amount);
    const receipt = await tx.wait();
    console.log('Debt repaid! ✅');
    
    return receipt;
  }

  // 5. Withdraw USDC collateral
  async withdraw(amountUSDC) {
    const amount = ethers.utils.parseUnits(amountUSDC.toString(), 6);
    
    console.log('Withdrawing collateral...');
    const tx = await this.vaultManager.withdraw(amount);
    const receipt = await tx.wait();
    console.log('Withdrawn successfully! ✅');
    
    return receipt;
  }

  // Get balances
  async getBalances(userAddress) {
    const usdcBalance = await this.usdc.balanceOf(userAddress);
    const oinrBalance = await this.oinr.balanceOf(userAddress);
    
    return {
      usdc: ethers.utils.formatUnits(usdcBalance, 6),
      oinr: ethers.utils.formatEther(oinrBalance),
    };
  }

  // Check borrowing capacity
  async checkBorrowCapacity(userAddress, borrowAmount) {
    const amount = ethers.utils.parseEther(borrowAmount.toString());
    const result = await this.vaultManager.checkBorrowCapacity(userAddress, amount);
    
    return {
      canBorrow: result.canBorrow,
      maxBorrowable: ethers.utils.formatEther(result.maxBorrowable),
    };
  }
}

export default new VaultService();
```

---

## 🎨 React Component Example

```javascript
// src/components/VaultDashboard.jsx
import React, { useState, useEffect } from 'react';
import { loginWithEmail, logout, isLoggedIn } from '../services/auth';
import vaultService from '../services/vault';

function VaultDashboard() {
  const [user, setUser] = useState(null);
  const [vaultInfo, setVaultInfo] = useState(null);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    const loggedIn = await isLoggedIn();
    if (loggedIn) {
      await initializeUser();
    }
  }

  async function handleLogin(email) {
    setLoading(true);
    try {
      const userData = await loginWithEmail(email);
      await vaultService.initialize();
      setUser(userData);
      await loadUserData(userData.address);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
    setLoading(false);
  }

  async function initializeUser() {
    await vaultService.initialize();
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setUser({ provider, signer, address });
    await loadUserData(address);
  }

  async function loadUserData(address) {
    const info = await vaultService.getVaultInfo(address);
    const bal = await vaultService.getBalances(address);
    setVaultInfo(info);
    setBalances(bal);
  }

  async function handleDeposit() {
    setLoading(true);
    try {
      await vaultService.deposit(1000); // 1000 USDC
      await loadUserData(user.address);
      alert('Deposit successful! ✅');
    } catch (error) {
      alert('Deposit failed: ' + error.message);
    }
    setLoading(false);
  }

  async function handleBorrow() {
    setLoading(true);
    try {
      await vaultService.borrow(50000); // 50,000 oINR
      await loadUserData(user.address);
      alert('Borrow successful! ✅');
    } catch (error) {
      alert('Borrow failed: ' + error.message);
    }
    setLoading(false);
  }

  async function handleBuyOINR() {
    setLoading(true);
    try {
      await vaultService.buyOINR(10000); // Buy 10,000 oINR
      await loadUserData(user.address);
      alert('Purchase successful! ✅');
    } catch (error) {
      alert('Purchase failed: ' + error.message);
    }
    setLoading(false);
  }

  async function handleRepay() {
    setLoading(true);
    try {
      await vaultService.repay(50000); // Repay 50,000 oINR
      await loadUserData(user.address);
      alert('Repayment successful! ✅');
    } catch (error) {
      alert('Repayment failed: ' + error.message);
    }
    setLoading(false);
  }

  async function handleWithdraw() {
    setLoading(true);
    try {
      await vaultService.withdraw(1000); // Withdraw 1000 USDC
      await loadUserData(user.address);
      alert('Withdrawal successful! ✅');
    } catch (error) {
      alert('Withdrawal failed: ' + error.message);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setVaultInfo(null);
    setBalances(null);
  }

  if (!user) {
    return (
      <div className="login-container">
        <h1>Oruva DeFi Bank</h1>
        <p>Login with your email - no wallet needed!</p>
        <LoginForm onLogin={handleLogin} loading={loading} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Your Vault</h1>
        <p>Address: {user.address.slice(0, 6)}...{user.address.slice(-4)}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="balances">
        <h2>Your Balances</h2>
        <p>USDC: {balances?.usdc || '0'}</p>
        <p>oINR: {balances?.oinr || '0'}</p>
      </div>

      <div className="vault-info">
        <h2>Vault Status</h2>
        <p>Collateral: {vaultInfo?.collateral || '0'} USDC</p>
        <p>Debt: {vaultInfo?.debt || '0'} oINR</p>
        <p>Collateral Value: ₹{vaultInfo?.collateralValueINR || '0'}</p>
        <p>Health Ratio: {vaultInfo?.ratio || '0'}%</p>
        <p>Status: {vaultInfo?.isHealthy ? '✅ Healthy' : '⚠️ Undercollateralized'}</p>
      </div>

      <div className="actions">
        <h2>Actions</h2>
        <button onClick={handleDeposit} disabled={loading}>
          Deposit 1000 USDC
        </button>
        <button onClick={handleBorrow} disabled={loading}>
          Borrow 50,000 oINR
        </button>
        <button onClick={handleBuyOINR} disabled={loading}>
          Buy 10,000 oINR
        </button>
        <button onClick={handleRepay} disabled={loading}>
          Repay Debt
        </button>
        <button onClick={handleWithdraw} disabled={loading}>
          Withdraw Collateral
        </button>
      </div>

      {loading && <div className="loader">Processing...</div>}
    </div>
  );
}

function LoginForm({ onLogin, loading }) {
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (email) {
      onLogin(email);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending magic link...' : 'Login with Email'}
      </button>
    </form>
  );
}

export default VaultDashboard;
```

---

## 📂 File Structure

```
frontend/
├── src/
│   ├── config/
│   │   ├── magic.js          ← Magic initialization
│   │   └── contracts.js      ← Contract addresses
│   ├── services/
│   │   ├── auth.js           ← Login/logout logic
│   │   └── vault.js          ← All vault operations
│   ├── abis/
│   │   ├── VaultManager.json ← Copy from out/VaultManager.sol/
│   │   ├── MockUSDC.json     ← Copy from out/MockUSDC.sol/
│   │   └── oINR.json         ← Copy from out/oINR.sol/
│   └── components/
│       └── VaultDashboard.jsx
```

---

## 🔑 Getting ABIs

Copy the ABI files from the smart contract compilation output:

```bash
# From the smart contract repo root:
cp out/VaultManager.sol/VaultManager.json frontend/src/abis/
cp out/MockUSDC.sol/MockUSDC.json frontend/src/abis/
cp out/oINR.sol/oINR.json frontend/src/abis/
```

Each JSON file has this structure:
```json
{
  "abi": [...],  ← You need this
  "bytecode": {...}
}
```

Use `VaultManagerABI.abi` when creating contract instances.

---

## 🎯 Complete User Flow

### Scenario: User borrows 50,000 oINR

```javascript
// 1. User logs in with email
const user = await loginWithEmail('anish@example.com');

// 2. Initialize vault service
await vaultService.initialize();

// 3. Deposit 1000 USDC as collateral
await vaultService.deposit(1000);
// User approves → Deposits → Collateral recorded ✅

// 4. Borrow 50,000 oINR
await vaultService.borrow(50000);
// User receives 50,000 oINR ✅

// 5. User spends oINR (transfer to merchant)
await vaultService.oinr.transfer(merchantAddress, ethers.utils.parseEther('10000'));

// 6. Later, buy back oINR to repay
await vaultService.buyOINR(10000);
// User pays ~120 USDC, gets 10,000 oINR ✅

// 7. Repay the debt
await vaultService.repay(50000);
// Debt cleared ✅

// 8. Withdraw collateral
await vaultService.withdraw(1000);
// User gets 1000 USDC back ✅
```

---

## ⚡ Key Points for Frontend Developer

### ✅ What Works Out of the Box:
- Login with email (Magic handles this)
- Wallet automatically created
- Sign transactions (Magic provides signer)
- All smart contract functions work

### ⚠️ Important Notes:

1. **Always approve before transfers:**
   ```javascript
   await usdc.approve(vaultManager, amount);  // First
   await vaultManager.deposit(amount);         // Then deposit
   ```

2. **Decimals matter:**
   ```javascript
   USDC: 6 decimals  → ethers.utils.parseUnits(amount, 6)
   oINR: 18 decimals → ethers.utils.parseEther(amount)
   ```

3. **Wait for transactions:**
   ```javascript
   const tx = await vaultManager.deposit(amount);
   await tx.wait();  // ← Don't forget this!
   ```

4. **Handle errors:**
   ```javascript
   try {
     await vaultService.deposit(1000);
   } catch (error) {
     if (error.code === 'INSUFFICIENT_FUNDS') {
       alert('Not enough USDC');
     }
   }
   ```

---

## 🧪 Testing Flow

### Test with Mock USDC:

```javascript
// Mint test USDC to user (only works on testnet)
const mockUSDC = new ethers.Contract(
  CONTRACTS.mockUSDC,
  MockUSDCABI.abi,
  signer
);

await mockUSDC.mint(
  userAddress,
  ethers.utils.parseUnits('10000', 6) // 10,000 USDC
);
```

---

## 📞 Common Issues & Solutions

### Issue 1: "Insufficient funds"
**Solution:** User needs FLOW tokens for gas fees
```javascript
// Check FLOW balance
const balance = await provider.getBalance(userAddress);
console.log('FLOW balance:', ethers.utils.formatEther(balance));
```

### Issue 2: "Transaction failed"
**Solution:** Check if approval was done first
```javascript
// Always approve before deposit/repay
await usdc.approve(vaultManager, amount);
await vaultManager.deposit(amount);
```

### Issue 3: "Insufficient collateralization"
**Solution:** User trying to borrow too much
```javascript
// Check max borrowable first
const capacity = await vaultService.checkBorrowCapacity(address, amount);
if (!capacity.canBorrow) {
  alert(`Max you can borrow: ${capacity.maxBorrowable} oINR`);
}
```

---

## 🚀 Deployment Checklist

- [ ] Install `magic-sdk` and `ethers`
- [ ] Copy contract ABIs to frontend
- [ ] Set Magic publishable key
- [ ] Configure Flow EVM Testnet (chainId: 545)
- [ ] Test login flow
- [ ] Test deposit flow
- [ ] Test borrow flow
- [ ] Test repay flow
- [ ] Add error handling
- [ ] Add loading states

---

## 📚 Resources

- **Contract Addresses:** See `CONTRACT_ADDRESSES.json`
- **Contract ABIs:** In `out/` folder
- **Magic Link Docs:** https://magic.link/docs
- **Ethers.js Docs:** https://docs.ethers.org/v5/
- **Flow EVM Docs:** https://developers.flow.com/evm

---

## 💬 Support

If you have questions:
1. Check `FRONTEND_GUIDE.md` for API details
2. See `TESTING.md` for expected behavior
3. Check smart contract source in `src/`

**The smart contracts are ready. Just plug in Magic Link and you're good to go!** ✨
