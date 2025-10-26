# Yield Vaults Feature

## Overview
Oruva now features **Yield Vaults** - a DeFi savings account where users can deposit USDC or oINR and earn **5% APY** passive income.

## Smart Contracts

### YieldVault.sol
Located at: `src/YieldVault.sol`

**Key Features:**
- Deposit tokens to earn continuous interest
- Withdraw anytime (auto-claims pending yield)
- Claim yield without withdrawing principal
- 5% APY (500 basis points)
- Simple interest calculation: `yield = (amount × APY × time) / (365 days × 10000)`
- ReentrancyGuard protection
- Ownable for admin functions

**Main Functions:**
```solidity
function deposit(uint256 amount) external
function withdraw(uint256 amount) external
function claimYield() external
function calculateYield(address user) external view returns (uint256)
function getUserInfo(address user) external view returns (depositAmount, depositTime, totalClaimed)
```

### Deployed Contracts (Flow EVM Testnet)

**USDC Yield Vault:**
- Address: `0x0009f72e3c176163037807f6365695DCeED2a09B`
- Token: Mock USDC (6 decimals)
- Funded with: 10,000 USDC

**oINR Yield Vault:**
- Address: `0x5923227b1E40fEbDA88B5231a573069F9669Fb9a`
- Token: oINR (18 decimals)
- Funded with: 100,000 oINR

## Mobile App Integration

### New Files

**1. src/services/yield.js**
- YieldService class for interacting with vaults
- Methods: `deposit()`, `withdraw()`, `claimYield()`, `getUserInfo()`, `getAPY()`

**2. components/EarnTab.js**
- Full UI for yield vaults
- Vault selector (USDC / oINR)
- Displays: APY, deposits, pending yield, total claimed
- Actions: Deposit, Withdraw, Claim Yield

### Updated Files

**App.js:**
- Imported `yieldService` and `EarnTab`
- Initialize yieldService on wallet connection
- Added "Earn" screen navigation
- New button: "💰 Earn Passive Income"

**CONTRACT_ADDRESSES.json:**
- Added `USDCYieldVault` entry
- Added `oINRYieldVault` entry

## User Flow

### How to Earn Yield

1. **Connect Wallet**
   - Login with Magic Link / Create Wallet / Import MetaMask

2. **Navigate to Earn Tab**
   - Click "💰 Open Earn Tab" button

3. **Select Vault**
   - Choose USDC Vault or oINR Vault

4. **Deposit Tokens**
   - Enter amount to deposit
   - Approve transaction
   - Confirm deposit
   - Start earning 5% APY immediately!

5. **Monitor Earnings**
   - View real-time pending yield
   - See total claimed yield
   - Track deposit amount and time

6. **Claim Yield**
   - Click "Claim" to receive earned interest
   - Principal remains deposited
   - Continue earning on full balance

7. **Withdraw**
   - Enter amount to withdraw
   - Automatically claims all pending yield
   - Receive principal + interest

## Technical Details

### Interest Calculation

**Formula:**
```
yield = (depositAmount × APY × timeElapsed) / (365 days × 10000)
```

**Example:**
- Deposit: 1000 USDC
- APY: 5% (500 basis points)
- Time: 30 days

```
yield = (1000 × 500 × 30 days) / (365 days × 10000)
     = 15,000,000 / 3,650,000
     = 4.11 USDC
```

### Security Features

1. **ReentrancyGuard**
   - Prevents reentrancy attacks on deposit/withdraw

2. **Ownable**
   - Only owner can fund vault
   - Only owner can update APY

3. **Safe Math**
   - Uses Solidity 0.8+ built-in overflow protection

4. **Auto-claim on Withdraw**
   - User never loses earned yield

## Deployment Scripts

### DeployYieldVaults.s.sol
```bash
forge script script/DeployYieldVaults.s.sol --rpc-url $FLOW_EVM_RPC --broadcast
```

Deploys both USDC and oINR yield vaults.

### FundYieldVaults.s.sol
```bash
forge script script/FundYieldVaults.s.sol --rpc-url $FLOW_EVM_RPC --broadcast
```

Funds vaults with tokens for yield distribution:
- Mints USDC
- Buys oINR using VaultManager
- Approves vaults
- Funds 10,000 USDC and 100,000 oINR

## Testing

### Manual Testing Checklist

- [x] Deploy YieldVault contracts
- [x] Fund vaults with tokens
- [x] Update CONTRACT_ADDRESSES.json
- [x] Create yield service
- [x] Create Earn tab UI
- [x] Integrate with App.js
- [ ] Test deposit USDC
- [ ] Test deposit oINR
- [ ] Wait and verify yield calculation
- [ ] Test claim yield
- [ ] Test withdraw with auto-claim
- [ ] Test vault switching

### Expected Behavior

**After 1 day with 1000 USDC deposit:**
- Pending Yield: ~0.137 USDC
- Total: 1000.137 USDC available

**After 1 year with 1000 USDC deposit:**
- Pending Yield: ~50 USDC
- Total: 1050 USDC available

## UI Features

### Earn Tab Components

1. **Header**
   - "💰 Earn Passive Income"
   - "Deposit tokens and earn 5% APY"

2. **Vault Selector**
   - Toggle between USDC and oINR
   - Active vault highlighted

3. **Stats Cards**
   - APY: 5%
   - Your Deposit: Amount deposited
   - Pending Yield: Real-time interest (green)
   - Total Claimed: Lifetime earnings

4. **Wallet Balance**
   - Shows available balance for deposits

5. **Deposit Section**
   - Input amount
   - "Deposit" button
   - Approval + deposit flow

6. **Withdraw Section** (if has deposits)
   - Input amount
   - "Withdraw" button
   - Auto-claims yield

7. **Claim Yield Button** (if has pending yield)
   - One-click claim
   - Shows exact amount to claim

8. **Info Card**
   - How it works
   - Key features
   - Instructions

## Future Enhancements

### Possible Improvements

1. **Variable APY**
   - Based on vault utilization
   - Market conditions

2. **Compound Interest**
   - Auto-reinvest claimed yield
   - Maximize returns

3. **Multiple Vaults**
   - Different risk/reward profiles
   - USDC-oINR LP tokens
   - Other collateral types

4. **Yield History**
   - Graph of earnings over time
   - Export CSV

5. **Notifications**
   - Alert when yield reaches threshold
   - Weekly/monthly summaries

6. **Referral Program**
   - Earn bonus APY for referrals

## Comparison with Competitors

| Feature | Oruva | Aave | Compound |
|---------|-------|------|----------|
| APY | 5% | ~2-4% | ~2-3% |
| Withdraw Anytime | ✅ | ✅ | ✅ |
| Auto-claim | ✅ | Manual | Manual |
| Mobile App | ✅ | Limited | No |
| Magic Link Login | ✅ | ❌ | ❌ |
| UPI-style QR | ✅ | ❌ | ❌ |

## Support

For issues or questions:
1. Check console logs in mobile app
2. Verify wallet has tokens to deposit
3. Ensure allowance is set before deposit
4. Check vault balances on-chain

## License

MIT License - See LICENSE file
