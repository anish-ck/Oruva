# QR Payment Testing Guide

## 🧪 How to Test Without Two Phones

### Method 1: Web QR Generator + Mobile App (Recommended)

1. **Open the test HTML file:**
   ```bash
   cd oruva-mobile
   # Open test-qr-payment.html in your browser
   xdg-open test-qr-payment.html
   ```

2. **Get your wallet address from the mobile app:**
   - Start the Expo app: `npx expo start`
   - Open on your phone
   - Copy your wallet address (shows as "0x1234...5678" in the header)

3. **Generate test QR code:**
   - Paste your wallet address in the web form
   - Enter amount (e.g., 5 oINR)
   - Click "Generate QR Code"

4. **Scan from mobile app:**
   - In the Oruva app, tap "Send" button
   - Grant camera permission
   - Point camera at the QR code on your computer screen
   - Confirm payment

### Method 2: Two Separate Wallets on Same Phone

1. **Create first wallet:**
   ```bash
   npx expo start
   ```
   - Open app, create wallet
   - Note the address (Wallet A)
   - Add some USDC, borrow oINR

2. **Create second wallet:**
   - Disconnect from app
   - Import a different wallet using MetaMask private key
   - OR clear app data and create new wallet (Wallet B)

3. **Test the flow:**
   - Wallet A: Tap "Receive", generate QR for 10 oINR
   - Take screenshot of QR
   - Disconnect, connect as Wallet B
   - Tap "Send", scan the screenshot
   - Complete payment

### Method 3: Screenshot Testing

1. **Generate payment request:**
   - Create wallet in app
   - Tap "Receive"
   - Enter amount
   - Generate QR code
   - Take screenshot

2. **Display and scan:**
   - Send screenshot to computer
   - Display on another screen/device
   - Use same phone to scan it

### Method 4: Expo on Multiple Devices

If you have access to another device (friend's phone, tablet, emulator):

1. **Device 1 (Receiver):**
   ```bash
   npx expo start
   ```
   - Scan QR with Expo Go
   - Create/import wallet
   - Get some oINR
   - Tap "Receive" → Generate payment QR

2. **Device 2 (Sender):**
   - Scan same Expo QR code
   - Create different wallet
   - Get USDC and oINR
   - Tap "Send" → Scan payment QR from Device 1

## 🔥 Quick Test Script

Here's a simple test flow:

```bash
# Terminal 1: Start Expo
cd oruva-mobile
npx expo start

# Terminal 2: Open test HTML
xdg-open test-qr-payment.html
```

Then:
1. ✅ Get wallet address from mobile app
2. ✅ Paste in web form
3. ✅ Generate QR on computer screen
4. ✅ Scan from mobile app
5. ✅ Confirm payment

## 📱 Testing Checklist

- [ ] Camera permission granted
- [ ] QR code generates correctly (Receive screen)
- [ ] QR scanner detects code
- [ ] Payment details display correctly
- [ ] Invalid QR codes are rejected
- [ ] Insufficient balance error works
- [ ] Successful payment updates balances
- [ ] Transaction shows on blockchain

## 🐛 Common Issues

**"Camera permission denied"**
- Grant permission in phone settings
- Restart the app

**"Invalid QR Code"**
- Ensure QR contains valid JSON
- Check format matches: `{"type":"oINR_PAYMENT","receiver":"0x...","amount":"10","note":"..."}`

**"Insufficient oINR balance"**
- Buy or borrow oINR first
- Check balance in main screen

**"Insufficient FLOW for gas fees"**
- Get testnet FLOW from https://faucet.flow.com/
- Paste your wallet address

## 💡 Pro Tip

The easiest way is to use the web QR generator (test-qr-payment.html) on your computer and scan it with your phone!
