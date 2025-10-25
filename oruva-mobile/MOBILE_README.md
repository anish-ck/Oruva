# Oruva Mobile App - Quick Start Guide

## 🚀 What is This?

Oruva Mobile is a React Native app that lets you interact with the Oruva stablecoin protocol on Flow EVM Testnet. You can:
- Deposit USDC as collateral
- Borrow oINR (Indian Rupee stablecoin)
- Buy back oINR with USDC
- Repay debt and withdraw collateral

## 📱 How to Run

1. **Install Dependencies** (if not already done):
```bash
cd oruva-mobile
npm install
```

2. **Start the App**:
```bash
npx expo start
```

3. **Open on Your Phone**:
   - Install "Expo Go" app from Play Store (Android) or App Store (iOS)
   - Scan the QR code shown in terminal
   - App will load on your phone

## 🔑 First Time Setup

When you first open the app:

1. **Connect Wallet**
   - Tap "Connect Wallet"
   - A new test wallet is automatically created for you
   - Your private key is saved in app storage (this is for TESTING only!)

2. **Get Gas Tokens**
   - Copy your wallet address from the yellow warning card
   - Visit: https://faucet.flow.com/
   - Paste your address and request testnet FLOW tokens
   - Wait 1-2 minutes for tokens to arrive

3. **Mint Test USDC**
   - Use the "Mint Test USDC" card
   - Enter amount (e.g., 1000)
   - Tap "Mint USDC"
   - Wait for transaction to confirm

## 💡 How to Use

### Deposit Collateral
1. Enter USDC amount
2. Tap "Deposit"
3. Wait for 2 transactions (approve + deposit)

### Borrow oINR
1. Enter oINR amount to borrow
2. Must be < 66% of your collateral value
3. Tap "Borrow"

### Buy oINR (for repayment)
If you spent your borrowed oINR:
1. Enter oINR amount to buy
2. Tap "Buy oINR"
3. Cost = amount / 83 USDC (oracle price)

### Repay Debt
1. Enter oINR amount to repay
2. Tap "Repay"
3. Wait for 2 transactions (approve + repay)

### Withdraw Collateral
1. Enter USDC amount to withdraw
2. Must maintain 150% collateralization
3. Tap "Withdraw"

## ⚠️ Important Notes

### Test Wallet Warning
- This app creates a **test wallet** automatically
- Your private key is stored in app storage
- **DO NOT use real money** - testnet only!
- For production, integrate WalletConnect or Magic Link

### Gas Fees
- Every transaction needs FLOW tokens for gas
- Get free testnet FLOW from: https://faucet.flow.com/
- If transactions fail with "insufficient funds", you need more FLOW

### Collateralization
- Minimum ratio: 150%
- If ratio < 150%, vault becomes unhealthy
- Always keep ratio above 150% to avoid liquidation

## 🏗️ Architecture

```
App.js (Main UI)
├── src/services/wallet.js (Wallet management)
├── src/services/vault.js (Smart contract interactions)
├── src/config/contracts.js (Contract addresses & ABIs)
└── src/config/network.js (Flow EVM Testnet config)
```

## 📝 Contract Addresses (Flow EVM Testnet)

- VaultManager: `0x22E1AE8A85e76e94683D668c0107b69eF18a62cA`
- MockUSDC: `0x6Bf62e80CAf83847ED57233ee119673f8fF7Ab5c`
- oINR Token: `0xCf9aAE60ffA5a59d59c5EC6E7277B16AAa8c3bE2`
- Oracle: `0x5D1C7ea7B6d7F50C6c5B4e8ec50b61E22Ea1f46F`

## � Troubleshooting

### App won't load
- Make sure you're in `oruva-mobile` folder
- Run `npm install` again
- Clear cache: `npx expo start --clear`

### "Insufficient funds" error
- Get FLOW tokens from faucet
- Check balance using a block explorer

### Transaction fails
- Check you have enough FLOW for gas
- For deposits/borrows: check collateralization ratio
- For withdrawals: ensure you maintain 150% ratio

### Can't see balances
- Wait a few seconds for data to load
- Pull down to refresh
- Check network connection

## 🔐 Security (Production)

For production deployment:
1. Remove auto-wallet creation
2. Integrate proper wallet (WalletConnect, MetaMask, Magic Link)
3. Add transaction signing confirmations
4. Implement proper key management
5. Add rate limiting and error tracking

## � Testing Flow

1. Connect → Get gas tokens → Mint 1000 USDC
2. Deposit 100 USDC → Vault shows 100 USDC, ₹8300 value
3. Borrow 4000 oINR → Debt shows 4000, ratio ~207%
4. Buy 1000 oINR → Costs 12.05 USDC
5. Repay 1000 oINR → Debt reduces to 3000
6. Withdraw 20 USDC → Collateral reduces to 80

## 🎯 Next Steps

- Add transaction history
- Add price charts
- Implement notifications
- Add dark mode
- Integrate real wallet providers
- Add biometric authentication

---

**Built with**: React Native, Expo, ethers.js, Flow EVM Testnet
