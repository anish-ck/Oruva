# 🚀 Quick Start - Testing QR Payments

## ⚠️ IMPORTANT: You Need oINR First!

The error you saw is **expected** - you can't send oINR if you don't have any! Here's the correct testing flow:

## 📋 Step-by-Step Testing Guide

### 1️⃣ Get Testnet FLOW (for gas fees)
```
1. Copy your wallet address from the app
2. Visit: https://faucet.flow.com/
3. Paste your address and request FLOW
4. Wait 30 seconds
```

### 2️⃣ Get oINR Tokens
You have 3 options:

**Option A: Mint USDC and Borrow oINR**
```
1. Mint Test USDC: Enter 1000, tap "Mint USDC"
2. Deposit Collateral: Enter 500, tap "Deposit"
3. Borrow oINR: Enter 200, tap "Borrow"
```

**Option B: Buy oINR Directly**
```
1. Mint Test USDC: Enter 1000, tap "Mint USDC"
2. Buy oINR: Enter 100, tap "Buy oINR"
```

**Option C: Someone Sends You oINR via QR**
```
1. Tap "Receive" button
2. Generate QR code
3. Have someone scan and send you oINR
```

### 3️⃣ Now Test QR Payments!

**To Receive Payment:**
```
1. Tap "Receive" button (green)
2. Enter amount (e.g., 10 oINR)
3. Optional: Add note
4. Tap "Generate QR Code"
5. Show QR to payer or scan with test page
```

**To Send Payment:**
```
1. Make sure you have oINR balance > 0
2. Tap "Send" button (blue)
3. Grant camera permission
4. Scan QR code (from test-qr-payment.html on computer)
5. Review payment details
6. Tap "Confirm & Pay"
7. Wait for transaction confirmation
```

## 🧪 Easy Testing with One Phone

### Method 1: Computer + Phone (Recommended)

**Start the app:**
```bash
cd oruva-mobile
npx expo start
```

**Open test page:**
- Open `test-qr-payment.html` in browser
- Paste your wallet address
- Generate QR on computer screen
- Scan with phone app

### Method 2: Two Wallets on Same Phone

**Wallet A (Has oINR):**
```
1. Get FLOW from faucet
2. Mint USDC and buy oINR
3. Tap "Receive" → Generate QR
4. Screenshot the QR code
5. Disconnect wallet
```

**Wallet B (Will receive):**
```
1. Import different wallet (or create new)
2. Get FLOW from faucet
3. Mint USDC and buy oINR
4. Tap "Send" → Scan screenshot
5. Complete payment
6. Disconnect and check Wallet A balance
```

## ✅ Testing Checklist

### Before Testing Payments:
- [ ] Got testnet FLOW from faucet
- [ ] Minted test USDC (minimum 100)
- [ ] Have oINR balance > 0 (buy or borrow)

### Testing Receive:
- [ ] Can generate QR code
- [ ] QR shows correct amount
- [ ] QR shows your address
- [ ] Can create multiple QRs

### Testing Send:
- [ ] Camera permission granted
- [ ] Can scan QR codes
- [ ] Payment details show correctly
- [ ] Can confirm payment
- [ ] Transaction succeeds
- [ ] Balance updates after payment

## 🐛 Common Issues & Solutions

### "Insufficient oINR balance"
✅ **Solution:** You need oINR first!
```
Option 1: Buy oINR
- Mint USDC → Buy oINR

Option 2: Borrow oINR
- Mint USDC → Deposit → Borrow
```

### "Insufficient FLOW for gas fees"
✅ **Solution:** Get testnet FLOW
```
1. Copy wallet address from app
2. Visit: https://faucet.flow.com/
3. Request FLOW tokens
```

### "Camera permission denied"
✅ **Solution:** 
```
1. Go to phone Settings
2. Find Expo Go app
3. Enable Camera permission
4. Restart app
```

### "Invalid QR Code"
✅ **Solution:** QR must be from Oruva app
```
- Generate QR from "Receive" screen, OR
- Use test-qr-payment.html with correct format
```

## 💰 Current Balances Reference

Check your main screen to see:
- **USDC**: Collateral token (get from Mint)
- **oINR**: Stablecoin (get from Buy/Borrow)
- **Collateral**: Deposited USDC amount
- **Debt**: Borrowed oINR amount

## 📱 Test Scenarios

### Scenario 1: Simple Payment
```
1. Alice has 100 oINR
2. Bob generates QR for 10 oINR
3. Alice scans Bob's QR
4. Alice pays 10 oINR
5. Alice: 90 oINR, Bob: 10 oINR ✅
```

### Scenario 2: Payment Request
```
1. Shop generates QR for 50 oINR ("Coffee payment")
2. Customer scans QR
3. Customer sees: "50 oINR - Coffee payment"
4. Customer confirms and pays
5. Transaction complete ✅
```

## 🎯 Success Indicators

You'll know it's working when:
- ✅ QR codes generate instantly
- ✅ Camera scans QR codes
- ✅ Payment confirmation shows correct details
- ✅ Transaction completes (see "Success" alert)
- ✅ Balances update in main screen
- ✅ Can see transaction on blockchain

## 🔗 Useful Links

- **Flow Faucet**: https://faucet.flow.com/
- **Test QR Generator**: Open `test-qr-payment.html` in browser
- **Testing Guide**: See `QR_TESTING_GUIDE.md`

---

**Remember**: You must have oINR tokens before you can send them! 💡
