# Cashfree INR On-Ramp Integration

Complete guide for the Cashfree Payments integration that allows users to deposit INR and receive oINR stablecoins (1:1 ratio).

## 📋 Overview

This integration enables users to:
1. Deposit INR via UPI/Card/Net Banking
2. Automatically receive oINR stablecoins in their wallet
3. Track transaction history
4. Test in sandbox mode (no real money)

**Flow:**
```
User deposits ₹100 via UPI
    ↓
Cashfree processes payment
    ↓
Webhook notifies backend
    ↓
Backend mints 100 oINR
    ↓
User receives oINR in wallet
```

## 🚀 Setup Instructions

### 1. Backend Setup

#### Get Cashfree Credentials

1. Sign up at [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Go to **Developers** > **API Keys**
3. Switch to **Test** environment
4. Copy **App ID** and **Secret Key**

#### Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Update `.env`:
```env
# Cashfree Sandbox
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENVIRONMENT=sandbox

# Server
PORT=3000
BASE_URL=http://localhost:3000  # Change to ngrok URL for webhook testing

# Flow EVM
RPC_URL=https://testnet.evm.nodes.onflow.org
PRIVATE_KEY=your_deployer_private_key  # Must be oINR owner

# Contract Addresses
VAULT_MANAGER_ADDRESS=0x5F1311808ED97661D5b31F4C67637D8952a54cc0
OINR_ADDRESS=0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae
MOCK_USDC_ADDRESS=0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43
```

⚠️ **IMPORTANT:** The `PRIVATE_KEY` must belong to the wallet that owns the oINR contract, otherwise minting will fail.

#### Start Backend

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3000`

Test health check:
```bash
curl http://localhost:3000/health
```

### 2. Webhook Setup (For Testing)

#### Option A: Using ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Start backend
cd backend
npm run dev

# In new terminal, create tunnel
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

Update `.env`:
```env
BASE_URL=https://abc123.ngrok.io
```

Restart backend for changes to take effect.

#### Option B: Using webhook.site

For quick testing without local setup:
1. Go to [webhook.site](https://webhook.site)
2. Copy your unique URL
3. Use it as `BASE_URL` in `.env`

#### Configure Webhook in Cashfree

1. Go to [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Navigate to **Developers** > **Webhooks**
3. Switch to **Test** environment
4. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`
5. Select events: **Payment Success**
6. Save

### 3. Mobile App Setup

#### Install Dependencies

```bash
cd oruva-mobile

# Install packages
npm install

# For iOS (Mac only)
cd ios
pod install
cd ..
```

#### Update Backend URL

Edit `oruva-mobile/src/services/cashfree.js`:

```javascript
const BACKEND_URL = 'https://your-ngrok-url.ngrok.io/api';
```

For production, use your actual API URL.

#### iOS Configuration

Add to `oruva-mobile/ios/oruva-mobile/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>phonepe</string>
  <string>tez</string>
  <string>paytmmp</string>
  <string>bhim</string>
  <string>amazonpay</string>
  <string>credpay</string>
</array>
```

Then run:
```bash
cd ios && pod install && cd ..
```

#### Start App

```bash
# iOS
npm run ios

# Android
npm run android

# Expo
npm start
```

## 🧪 Testing

### Test Payment Flow

1. Open mobile app
2. Login with Magic Link or wallet
3. Tap **💰** button (Add INR)
4. Enter amount (e.g., ₹100)
5. Tap **Pay via UPI**
6. Cashfree checkout opens
7. Use test UPI VPA: `testsuccess@gocash`
8. Complete payment
9. Wait for confirmation
10. Check wallet balance - you should see +100 oINR

### Test UPI VPAs

- `testsuccess@gocash` → ✅ Payment Success
- `testfailure@gocash` → ❌ Payment Failed
- `testinvalid@gocash` → ⚠️ Invalid VPA

### Test Cards

- Card Number: `4111111111111111`
- CVV: `123`
- Expiry: `03/2028`
- OTP: `111000`

### Monitor Backend

Watch backend logs for:
```
✅ Order created: ORDER_...
📥 Webhook received
✅ Webhook signature verified
💰 Payment successful for order ORDER_...
💰 Minting 100 oINR to 0x...
✅ oINR minted successfully
   TX Hash: 0x...
```

### Verify Transaction

Check Flow EVM block explorer:
```
https://evm-testnet.flowscan.io/tx/{transactionHash}
```

## 📱 Mobile App Features

### Add INR Screen

- **Amount Input**: Enter custom amount or use presets (₹100, ₹500, ₹1000, ₹5000)
- **Preview**: Shows how much oINR you'll receive
- **Payment Button**: Opens Cashfree checkout
- **Transaction History**: See all your deposits
- **Test Mode Indicator**: Shows sandbox credentials

### Transaction Card

- Amount minted
- Status (Completed/Processing)
- Timestamp
- Transaction hash (tappable)

## 🔧 API Endpoints

### Create Order
```http
POST /api/create-order
Content-Type: application/json

{
  "amount": 100,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9999999999",
  "walletAddress": "0x1234..."
}

Response:
{
  "success": true,
  "orderId": "ORDER_...",
  "paymentSessionId": "session_...",
  "orderAmount": "100",
  "orderCurrency": "INR"
}
```

### Webhook (Cashfree → Backend)
```http
POST /api/webhook
Headers:
  x-webhook-signature: ...
  x-webhook-timestamp: ...

Body: Cashfree payment notification
```

### Get Order Status
```http
GET /api/order-status/:orderId

Response:
{
  "success": true,
  "order": {
    "orderId": "ORDER_...",
    "amount": 100,
    "status": "COMPLETED",
    "transactionHash": "0x...",
    "amountMinted": 100
  }
}
```

### Get Transaction History
```http
GET /api/transactions/:walletAddress

Response:
{
  "success": true,
  "transactions": [...],
  "count": 5
}
```

## 🐛 Troubleshooting

### Webhook Not Received

**Issue:** Payment successful but no oINR minted

**Solutions:**
1. Check ngrok is running: `curl https://your-url.ngrok.io/health`
2. Verify webhook URL in Cashfree dashboard
3. Check `BASE_URL` in `.env` matches ngrok URL
4. Look for webhook in backend logs
5. Manually trigger: `POST /api/verify-and-mint` with `orderId`

### Minting Fails

**Issue:** Payment received but minting error

**Check:**
```bash
# Verify backend wallet is oINR owner
node -e "
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
const oinr = new ethers.Contract(
  '0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae',
  ['function owner() view returns (address)'],
  provider
);
oinr.owner().then(owner => {
  console.log('oINR owner:', owner);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log('Backend wallet:', wallet.address);
  console.log('Match:', owner.toLowerCase() === wallet.address.toLowerCase());
});
"
```

**Fix:** Transfer ownership to backend wallet:
```bash
cd ..  # Go to stable_coin root
forge script script/TransferOINROwnership.s.sol --rpc-url $RPC_URL --broadcast
```

### Payment Stuck

**Issue:** Payment processing forever

**Manual verification:**
```bash
curl -X POST http://localhost:3000/api/verify-and-mint \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_..."}'
```

### RPC Errors

**Issue:** "insufficient funds for gas"

**Solution:** Fund backend wallet with Flow testnet tokens:
```
Faucet: https://testnet-faucet.onflow.org/
Send to: <your_backend_wallet_address>
```

### Mobile App Errors

**Issue:** "Failed to create payment order"

**Check:**
1. Backend is running
2. `BACKEND_URL` in `cashfree.js` is correct
3. CORS is enabled (it is by default)
4. Network connectivity

**Issue:** Payment page doesn't open

**Check:**
1. iOS `Info.plist` has URL schemes
2. Pods are installed: `cd ios && pod install`
3. App has internet permission

## 🔐 Security Notes

### Sandbox vs Production

**Current Setup:** Sandbox (test mode)
- No real money
- Test credentials
- Test UPI VPAs

**For Production:**
1. Get production credentials from Cashfree
2. Update `.env`:
   ```env
   CASHFREE_ENVIRONMENT=production
   CASHFREE_APP_ID=prod_app_id
   CASHFREE_SECRET_KEY=prod_secret
   ```
3. Update mobile app:
   ```javascript
   CFEnvironment.PRODUCTION // in cashfree.js
   ```
4. Deploy backend to production server (Heroku, AWS, etc.)
5. Use production contract addresses
6. Set up proper SSL/HTTPS
7. Implement rate limiting
8. Use production database

### Best Practices

✅ Always verify webhook signatures
✅ Never expose secret keys in frontend
✅ Use environment variables for all secrets
✅ Validate all user inputs
✅ Check payment status before minting
✅ Log all transactions
✅ Monitor for suspicious activity

## 📊 Production Checklist

Before going live:

- [ ] Get production Cashfree credentials
- [ ] Deploy backend to production server
- [ ] Set up production database (PostgreSQL/MongoDB)
- [ ] Configure production RPC URL
- [ ] Use production contract addresses
- [ ] Set up SSL/HTTPS
- [ ] Configure production webhook URL
- [ ] Implement proper error logging (Sentry, etc.)
- [ ] Add rate limiting
- [ ] Set up monitoring/alerts
- [ ] Test entire flow with real small amounts
- [ ] Prepare customer support for issues
- [ ] Document recovery procedures
- [ ] Set up backup/redundancy

## 🎯 Next Steps

Potential enhancements:
1. Add INR withdrawal (off-ramp)
2. Support more payment methods
3. Implement transaction receipts (PDF/email)
4. Add payment limits and KYC
5. Multi-currency support
6. Subscription/recurring payments
7. Referral program
8. Analytics dashboard

## 📝 Files Structure

```
backend/
  ├── server.js                 # Express server
  ├── routes/cashfree.js        # API endpoints
  ├── services/
  │   ├── cashfreeService.js   # Cashfree SDK wrapper
  │   └── blockchainService.js # Smart contract interactions
  ├── package.json
  ├── .env                      # Environment variables (gitignored)
  └── .env.example             # Template

oruva-mobile/
  ├── src/services/cashfree.js  # Mobile Cashfree service
  ├── components/AddINRTab.js   # Add INR screen
  ├── App.js                    # Updated with AddINR navigation
  └── package.json              # Updated with Cashfree SDKs
```

## 🆘 Support

- **Cashfree Docs**: https://www.cashfree.com/docs
- **Flow EVM Docs**: https://developers.flow.com/evm
- **GitHub Issues**: [Your repo]

## 📜 License

MIT

---

**Built with** ❤️ **for Oruva DeFi Bank**
