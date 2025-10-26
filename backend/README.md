# Oruva Backend API

Backend API for Oruva DeFi Bank - Handles INR on-ramp via Cashfree Payments and mints oINR stablecoins.

## Features

- 💳 **Cashfree Integration**: Create payment orders and process UPI payments
- 🔐 **Webhook Verification**: Secure webhook signature verification
- 🪙 **Auto-Minting**: Automatically mints oINR after successful payment (1 INR = 1 oINR)
- 📊 **Transaction History**: Track all deposit transactions
- ⚡ **Flow EVM**: Interacts with smart contracts on Flow EVM Testnet

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Cashfree Sandbox Credentials
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENVIRONMENT=sandbox

# Server
PORT=3000
BASE_URL=http://localhost:3000

# Flow EVM
RPC_URL=https://testnet.evm.nodes.onflow.org
CHAIN_ID=545
PRIVATE_KEY=your_deployer_private_key

# Contract Addresses
VAULT_MANAGER_ADDRESS=0x5F1311808ED97661D5b31F4C67637D8952a54cc0
OINR_ADDRESS=0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae
MOCK_USDC_ADDRESS=0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43
```

### 3. Get Cashfree Sandbox Credentials

1. Sign up at [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Navigate to Developers > API Keys
3. Switch to "Test" environment
4. Copy App ID and Secret Key

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Create Payment Order
```
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

### Webhook (Cashfree)
```
POST /api/webhook
```
Automatically called by Cashfree when payment is completed. Verifies signature and mints oINR.

### Verify and Mint (Manual)
```
POST /api/verify-and-mint
Content-Type: application/json

{
  "orderId": "ORDER_..."
}
```
Manually verify payment and mint oINR (fallback if webhook fails).

### Get Order Status
```
GET /api/order-status/:orderId
```

### Get oINR Balance
```
GET /api/balance/:walletAddress
```

### Get Transaction History
```
GET /api/transactions/:walletAddress
```

## Testing

### Using Cashfree Sandbox

**Test UPI VPAs:**
- `testsuccess@gocash` → Successful payment
- `testfailure@gocash` → Failed payment
- `testinvalid@gocash` → Invalid VPA

**Test Cards:**
- Card Number: `4111111111111111`
- CVV: `123`
- Expiry: `03/2028`
- OTP: `111000`

### Testing Webhooks Locally

Use ngrok to expose local server:

```bash
# Install ngrok
npm install -g ngrok

# Start server
npm run dev

# In another terminal, create tunnel
ngrok http 3000
```

Update `.env`:
```
BASE_URL=https://your-ngrok-url.ngrok.io
```

Configure webhook URL in Cashfree Dashboard:
```
https://your-ngrok-url.ngrok.io/api/webhook
```

## Flow

1. **User initiates deposit** → Frontend calls `/api/create-order`
2. **Backend creates Cashfree order** → Returns `paymentSessionId`
3. **User completes payment** → Cashfree checkout (UPI/Card/Net Banking)
4. **Cashfree sends webhook** → Backend verifies signature
5. **Backend mints oINR** → Calls smart contract on Flow EVM
6. **User receives oINR** → 1:1 ratio (1 INR = 1 oINR)

## Security

- ✅ Webhook signature verification using HMAC-SHA256
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for frontend access
- ✅ Input validation on all endpoints
- ✅ Private key stored securely (never committed)

## Important Notes

⚠️ **Backend Wallet Must Own oINR Contract**

The backend private key must be the owner of the oINR contract to mint tokens. If not, you'll get minting errors.

**To transfer ownership:**
```bash
# In the stable_coin directory
forge script script/TransferOINROwnership.s.sol --rpc-url $RPC_URL --broadcast
```

⚠️ **Sandbox Mode Only**

This is configured for Cashfree sandbox. No real money is involved. All payments are simulated.

⚠️ **Production Considerations**

Before going to production:
- Use a proper database (PostgreSQL/MongoDB) instead of in-memory storage
- Implement proper error logging and monitoring
- Set up HTTPS for all endpoints
- Add rate limiting
- Implement proper authentication
- Use production Cashfree credentials
- Set up proper webhook retry logic

## Troubleshooting

**Webhook not received:**
- Check ngrok is running
- Verify BASE_URL in .env
- Check Cashfree webhook logs in dashboard
- Ensure webhook URL is configured correctly

**Minting fails:**
- Verify backend wallet is oINR owner
- Check RPC_URL is accessible
- Verify contract addresses are correct
- Check backend wallet has enough gas (Flow tokens)

**Order not found:**
- Orders are stored in memory (cleared on restart)
- Use database in production

## Development

```bash
# Install dev dependencies
npm install

# Run with auto-reload
npm run dev

# Check logs
# Server logs all activities to console
```

## License

MIT
