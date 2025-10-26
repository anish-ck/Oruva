# Cashfree Integration - Quick Start

Get the INR on-ramp running in 5 minutes!

## Prerequisites

- Node.js installed
- Cashfree merchant account (sandbox)
- ngrok installed (for webhook testing)

## Step 1: Get Cashfree Credentials (2 min)

1. Go to https://merchant.cashfree.com/
2. Sign up / Login
3. Navigate to **Developers** > **API Keys**
4. Switch to **Test** environment
5. Copy **App ID** and **Secret Key**

## Step 2: Backend Setup (1 min)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
PRIVATE_KEY=your_wallet_private_key_here
```

⚠️ **Important:** Use the private key of the wallet that deployed/owns the oINR contract!

Start backend:
```bash
npm run dev
```

You should see:
```
🚀 Oruva Backend Server running on port 3000
📝 Environment: sandbox
```

## Step 3: Webhook Setup (1 min)

Open new terminal:

```bash
# Install ngrok
npm install -g ngrok

# Create tunnel
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

Update `backend/.env`:
```env
BASE_URL=https://abc123.ngrok.io
```

Restart backend (Ctrl+C and `npm run dev` again)

## Step 4: Configure Cashfree Webhook (30 sec)

1. Go to Cashfree Dashboard → Developers → Webhooks
2. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`
3. Select event: **Payment Success**
4. Save

## Step 5: Mobile App Setup (30 sec)

```bash
# Navigate to mobile app
cd oruva-mobile

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..
```

Edit `oruva-mobile/src/services/cashfree.js`:
```javascript
const BACKEND_URL = 'https://your-ngrok-url.ngrok.io/api';
```

Start app:
```bash
npm run ios
# or
npm run android
```

## Step 6: Test! (30 sec)

1. Open the app
2. Login with Magic Link or create wallet
3. Tap **💰** (Add INR button in header)
4. Enter amount: **100**
5. Tap **Pay via UPI**
6. Use test UPI: `testsuccess@gocash`
7. Complete payment
8. Wait 2-3 seconds
9. Check your wallet - you should have +100 oINR!

## Verify It Worked

**Backend logs should show:**
```
✅ Order created: ORDER_1234567890_xxx
📥 Webhook received
✅ Webhook signature verified
💰 Payment successful for order ORDER_1234567890_xxx
💰 Minting 100 oINR to 0x...
✅ oINR minted successfully
   TX Hash: 0x...
   Amount: 100 oINR
```

**Mobile app should show:**
- Success alert: "100 oINR has been minted to your wallet!"
- Transaction in history
- Updated balance

## Common Issues

### "Webhook not received"
- Check ngrok is still running
- Verify webhook URL in Cashfree dashboard matches ngrok URL
- Check `BASE_URL` in `.env`

### "Minting failed"
- Backend wallet must be oINR owner
- Check backend wallet has Flow testnet tokens for gas
- Verify `PRIVATE_KEY` in `.env` is correct

### "Failed to create order"
- Check backend is running
- Verify `BACKEND_URL` in mobile app matches ngrok URL
- Check CORS (should work by default)

### "Insufficient funds for gas"
- Get Flow testnet tokens: https://testnet-faucet.onflow.org/
- Send to your backend wallet address

## Test UPI VPAs

- ✅ `testsuccess@gocash` - Always succeeds
- ❌ `testfailure@gocash` - Always fails
- ⚠️ `testinvalid@gocash` - Invalid VPA error

## What's Next?

- Read full guide: `CASHFREE_INTEGRATION.md`
- Check backend API docs: `backend/README.md`
- Test different payment amounts
- Try test cards (see docs)
- Monitor transactions in Flow block explorer

## Need Help?

1. Check backend logs for errors
2. Check mobile app console (Expo/Metro)
3. Verify all environment variables
4. Read `CASHFREE_INTEGRATION.md` for detailed troubleshooting

---

**You're all set!** 🎉 Your users can now deposit INR and receive oINR instantly.
