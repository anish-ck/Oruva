# 💸 oINR Repayment Flow - Complete Guide

## 🎯 The Problem

When users borrow oINR and spend it (for payments, trading, etc.), they need a way to **buy back oINR** to repay their debt and unlock their collateral.

---

## ✅ Solution: `buyOINR()` Function

We've added a **direct buyback mechanism** to VaultManager that allows users to purchase oINR with USDC at the oracle price.

---

## 📊 Complete User Journey

### Scenario: User borrows and spends oINR

```
Step 1: Deposit Collateral
├─ User deposits 1000 USDC
└─ Collateral value: 1000 USDC × 83 INR = 83,000 INR

Step 2: Borrow oINR
├─ Max borrowable: 83,000 INR ÷ 1.5 = 55,333 oINR
├─ User borrows: 50,000 oINR
└─ Collateral ratio: 166% ✅ Healthy

Step 3: User Spends oINR
├─ User pays merchant 50,000 oINR for goods/services
├─ OR User trades oINR on DEX
└─ User now has 0 oINR but still owes 50,000 oINR debt

Step 4: Buy Back oINR (New Function!)
├─ User calls buyOINR(50,000 oINR)
├─ Required USDC: 50,000 INR ÷ 83 = 602.41 USDC
├─ User pays 602.41 USDC
└─ User receives 50,000 oINR

Step 5: Repay Debt
├─ User approves VaultManager to spend 50,000 oINR
├─ User calls repay(50,000 oINR)
├─ VaultManager burns the oINR
└─ Debt reduced to 0 oINR

Step 6: Withdraw Collateral
├─ User calls withdraw(1000 USDC)
└─ User gets their collateral back ✅
```

---

## 🔧 Technical Implementation

### New Function: `buyOINR()`

```solidity
/// @notice Buy oINR with USDC (for users who spent their borrowed oINR)
/// @param oinrAmount Amount of oINR to buy (18 decimals)
function buyOINR(uint256 oinrAmount) external nonReentrant {
    require(oinrAmount > 0, "Amount must be > 0");
    require(address(priceOracle) != address(0), "Oracle not set");

    // Get USDC price in INR (e.g., 83 INR per USDC)
    uint256 usdcPriceInINR = priceOracle.getPrice(address(collateralToken));
    
    // Calculate required USDC amount
    // Formula: usdcAmount = (oinrAmount * 1e6) / usdcPriceInINR
    uint256 usdcAmount = (oinrAmount * (10 ** collateralDecimals)) / usdcPriceInINR;
    
    // Transfer USDC from user to contract
    collateralToken.transferFrom(msg.sender, address(this), usdcAmount);
    
    // Mint oINR to user
    oinrToken.mint(msg.sender, oinrAmount);
    
    emit OINRPurchased(msg.sender, oinrAmount, usdcAmount);
}
```

### Key Features:

1. **Oracle-Based Pricing**: Uses SimplePriceOracle for fair market price
2. **Instant Settlement**: No waiting, no slippage
3. **Anyone Can Buy**: Not just vault owners, anyone needing oINR
4. **USDC Collateral Pool**: Contract holds USDC, can be used for future operations

---

## 💡 Use Cases

### 1. **Repaying Debt After Spending**
```javascript
// User spent their 50,000 oINR and needs to repay
await mockUSDC.approve(VAULT_MANAGER, 603e6); // Approve ~603 USDC
await vaultManager.buyOINR(ethers.parseEther("50000")); // Buy 50,000 oINR

await oinr.approve(VAULT_MANAGER, ethers.parseEther("50000"));
await vaultManager.repay(ethers.parseEther("50000")); // Repay debt
```

### 2. **Regular Users Buying oINR** (No vault needed)
```javascript
// Anyone can buy oINR with USDC
await mockUSDC.approve(VAULT_MANAGER, 100e6); // Approve 100 USDC
await vaultManager.buyOINR(ethers.parseEther("8300")); // Buy 8,300 oINR
// Now they have oINR to spend!
```

### 3. **Arbitrage Opportunities**
```javascript
// If oINR trades at discount on DEX
// 1. Buy oINR cheap on DEX
// 2. Sell to VaultManager at oracle price
// (Future feature: Add sellOINR function)
```

---

## 📐 Pricing Formula

### USDC → oINR Conversion

```
Given:
- USDC Price: 83 INR (from oracle)
- USDC Decimals: 6
- oINR Decimals: 18

Formula:
usdcAmount = (oinrAmount × 10^6) / (83 × 10^18)

Examples:
1. Buy 83 oINR
   → Need: (83 × 10^18 × 10^6) / (83 × 10^18) = 1,000,000 (1 USDC)

2. Buy 50,000 oINR
   → Need: (50,000 × 10^18 × 10^6) / (83 × 10^18) = 602,409,638 (602.41 USDC)

3. Buy 1,000 oINR
   → Need: (1,000 × 10^18 × 10^6) / (83 × 10^18) = 12,048,192 (12.05 USDC)
```

---

## 🎨 Frontend Integration

### Buy oINR Component

```javascript
async function buyAndRepay(debtAmount) {
  // 1. Calculate required USDC
  const usdcPrice = await priceOracle.getPrice(MOCK_USDC);
  const requiredUSDC = (debtAmount * 1e6n) / usdcPrice;
  
  // 2. Check user has enough USDC
  const usdcBalance = await mockUSDC.balanceOf(userAddress);
  if (usdcBalance < requiredUSDC) {
    alert("Insufficient USDC balance");
    return;
  }
  
  // 3. Approve and buy oINR
  await mockUSDC.approve(VAULT_MANAGER, requiredUSDC);
  await vaultManager.buyOINR(debtAmount);
  
  // 4. Approve and repay debt
  await oinr.approve(VAULT_MANAGER, debtAmount);
  await vaultManager.repay(debtAmount);
  
  alert("Debt repaid successfully!");
}
```

### UI Flow Recommendation

```
┌─────────────────────────────────────┐
│  Your Vault                         │
├─────────────────────────────────────┤
│  Collateral: 1000 USDC              │
│  Debt: 50,000 oINR                  │
│  oINR Balance: 0 oINR ❌            │
├─────────────────────────────────────┤
│  💡 Need oINR to repay?             │
│                                     │
│  Buy 50,000 oINR for 602.41 USDC    │
│  [Buy & Repay] Button               │
└─────────────────────────────────────┘
```

---

## 🔄 Alternative Repayment Methods

### Option 1: Direct Buyback (Current Implementation)
✅ Instant
✅ No slippage
✅ Fair oracle price
❌ Requires USDC

### Option 2: DEX Trading (Future)
✅ Can use any token
✅ Market-driven price
❌ Slippage risk
❌ Liquidity needed

### Option 3: Receive oINR from Others
✅ No cost
✅ Direct transfer
❌ Requires someone to send you oINR

---

## 📊 Contract Balance Management

### Where Does USDC Go?

When users call `buyOINR()`:
```
User Pays: 602.41 USDC
    ↓
VaultManager Balance: +602.41 USDC
    ↓
Can be used for:
- Future protocol operations
- Emergency reserves
- Admin withdrawal (if needed)
```

### Tracking Contract Balance

```javascript
// Check how much USDC the contract holds
const contractUSDC = await mockUSDC.balanceOf(VAULT_MANAGER);
console.log("Protocol USDC reserves:", contractUSDC);
```

---

## 🚀 Deployment Update

### Re-deploy VaultManager with buyOINR():

```bash
# Deploy new VaultManager
forge script script/DeployVaultManager.s.sol:DeployVaultManager \
  --rpc-url https://testnet.evm.nodes.onflow.org \
  --private-key $PRIVATE_KEY \
  --broadcast

# Update permissions
forge script script/SetupPermissions.s.sol:SetupPermissions \
  --rpc-url https://testnet.evm.nodes.onflow.org \
  --private-key $PRIVATE_KEY \
  --broadcast
```

---

## 🎯 Summary

| Action | Function | Who Pays | What They Get |
|--------|----------|----------|---------------|
| Buy oINR | `buyOINR(amount)` | USDC | oINR |
| Repay Debt | `repay(amount)` | oINR (burned) | Reduced debt |
| Full Flow | Buy + Repay | USDC | Debt cleared ✅ |

---

## ⚠️ Important Notes

1. **Oracle Price is Final**: No negotiation, price is from SimplePriceOracle
2. **Minting Permission**: VaultManager must be oINR owner/minter
3. **Approval Required**: Users must approve USDC before buying oINR
4. **No Reverse Function**: Currently no `sellOINR()` - users can only buy
5. **Contract Holds USDC**: Protocol accumulates USDC reserves

---

## 🔮 Future Enhancements

### 1. Sell oINR Back
```solidity
function sellOINR(uint256 oinrAmount) external {
    // Burn user's oINR
    // Transfer USDC to user at oracle price
}
```

### 2. DEX Integration
```solidity
function buyOINRFromDEX(uint256 oinrAmount, uint256 maxUSDC) external {
    // Swap on Uniswap/SushiSwap
    // Better price discovery
}
```

### 3. Flash Loan Repayment
```solidity
function flashRepay(uint256 amount) external {
    // Borrow USDC via flash loan
    // Buy oINR
    // Repay debt
    // Withdraw collateral
    // Repay flash loan
}
```

---

**Your users can now spend oINR freely and always have a way to buy back and repay!** 🎉
