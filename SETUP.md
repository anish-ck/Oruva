# Oruva - Quick Setup Guide

Complete guide for cloning and running the Oruva stablecoin project with Cashfree payment integration.

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Foundry** (for smart contracts)
- **Expo CLI** (for mobile app)
- **ngrok** account (for webhook testing)

## 1. Clone the Repository

```bash
git clone https://github.com/anish-ck/Oruva.git
cd Oruva
```

## 2. Smart Contract Setup (Optional - Already Deployed)

The contracts are already deployed on Flow EVM Testnet. Skip this section unless you need to redeploy.

### Contract Addresses (Flow EVM Testnet)
- **oINR Token**: `0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae`
- **VaultManager**: `0x5F1311808ED97661D5b31F4C67637D8952a54cc0`
- **VaultEngine**: `0xa9255087b8d1B75456eA5d4fc272B884E7A7AE8a`
- **MockUSDC**: `0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43`
- **PriceOracle**: `0x702856d2E290F905f1894E8451cBd80afB8Cf10C`

### To Deploy Contracts (if needed)
```bash
# Install Foundry dependencies
forge install

# Deploy all contracts
forge script script/DeployAll.s.sol --rpc-url https://testnet.evm.nodes.onflow.org --broadcast
```

## 3. Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Cashfree Sandbox Credentials
# Get from: https://merchant.cashfree.com/ > Developers > API Keys
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENVIRONMENT=sandbox

# Server Configuration
PORT=3000
BASE_URL=your_ngrok_url_here

# Flow EVM Configuration
RPC_URL=https://testnet.evm.nodes.onflow.org
CHAIN_ID=545
PRIVATE_KEY=your_private_key_here

# Contract Addresses (Flow EVM Testnet)
VAULT_MANAGER_ADDRESS=0x5F1311808ED97661D5b31F4C67637D8952a54cc0
OINR_ADDRESS=0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae
MOCK_USDC_ADDRESS=0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43
```

### Get Cashfree Credentials

1. Sign up at [Cashfree Merchant Dashboard](https://merchant.cashfree.com/)
2. Go to **Developers** > **API Keys**
3. Copy your **App ID** and **Secret Key**
4. Use **Sandbox** environment for testing

### Setup ngrok for Webhooks

```bash
# Install ngrok (if not installed)
# Download from: https://ngrok.com/download

# Login to ngrok
ngrok authtoken YOUR_NGROK_AUTH_TOKEN

# Start ngrok tunnel (in a separate terminal)
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`) and update:
- `BASE_URL` in `backend/.env`
- Webhook URL in Cashfree dashboard

### Configure Cashfree Webhook

1. Go to [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Navigate to **Developers** > **Webhooks**
3. Click **Add Webhook URL**
4. Enter: `https://your-ngrok-url.ngrok-free.app/api/webhook`
5. Select event: **PAYMENT_SUCCESS_WEBHOOK**
6. Save

### Start Backend Server

```bash
# From backend directory
node server.js
```

You should see:
```
🚀 Oruva Backend Server running on port 3000
📝 Environment: sandbox
🔗 Health check: http://localhost:3000/health
```

## 4. Mobile App Setup

### Install Dependencies

```bash
cd oruva-mobile
npm install
```

### Configure Environment (Optional)

The mobile app uses the backend API at `http://localhost:3000`. If your backend is on a different URL, update `oruva-mobile/src/services/cashfree.js`.

### Start Mobile App

```bash
# From oruva-mobile directory
npm start
```

This will start the Expo development server. You can:
- Press `w` to open in web browser
- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Scan QR code with Expo Go app on your phone

## 5. Testing the Payment Flow

### Complete End-to-End Test

1. **Start all services** (in separate terminals):
   ```bash
   # Terminal 1: ngrok
   ngrok http 3000
   
   # Terminal 2: Backend
   cd backend && node server.js
   
   # Terminal 3: Mobile App
   cd oruva-mobile && npm start
   ```

2. **Open the mobile app** (web/emulator/device)

3. **Navigate to "Add INR" tab**

4. **Enter amount** (e.g., ₹100)

5. **Complete payment** with test UPI ID:
   - UPI ID: `testsuccess@gocash`
   - This will simulate a successful payment in sandbox

6. **Check backend logs** for:
   ```
   💰 Payment successful for link ORDER_xxx
   💰 Minting 100 oINR to 0x...
   ✅ Transaction confirmed in block xxx
   ```

7. **Check mobile app** - Your oINR balance should increase

## 6. Project Structure

```
Oruva/
├── backend/                    # Node.js backend server
│   ├── routes/                 # API routes
│   │   └── cashfree.js        # Payment & webhook routes
│   ├── services/               # Business logic
│   │   ├── cashfreeService.js # Cashfree integration
│   │   └── blockchainService.js # Blockchain minting
│   ├── server.js              # Main server file
│   └── .env                   # Environment variables
├── oruva-mobile/              # Expo mobile app
│   ├── components/            # React components
│   │   ├── AddINRTab.js      # Add INR screen
│   │   └── ProfileTab.js     # Profile screen
│   ├── src/services/          # Service layer
│   │   └── cashfree.js       # Payment integration
│   └── App.js                # Main app component
├── src/                       # Smart contracts
│   ├── oINR.sol              # oINR stablecoin token
│   ├── VaultManager.sol      # Vault management
│   └── ...
└── script/                    # Deployment scripts
```

## 7. Important Notes

### For Development

- **ngrok URL changes** every time you restart ngrok (free tier)
  - Update `BASE_URL` in `backend/.env`
  - Update webhook URL in Cashfree dashboard

- **Sandbox Environment**
  - Use test UPI ID: `testsuccess@gocash` for successful payments
  - Use test UPI ID: `testfail@gocash` for failed payments
  - No real money is charged

### For Production

1. **Deploy Backend** to cloud server (AWS, Heroku, DigitalOcean)
2. **Update Environment**:
   - Change `CASHFREE_ENVIRONMENT` to `production`
   - Use production API keys
   - Update `BASE_URL` to your production domain
3. **Update Webhook** in Cashfree dashboard with production URL
4. **Enable Signature Verification** in webhook handler
5. **Build Mobile App** for production:
   ```bash
   cd oruva-mobile
   expo build:android  # or expo build:ios
   ```

## 8. Troubleshooting

### Backend won't start
- Check if port 3000 is already in use: `lsof -i :3000`
- Verify `.env` file exists with all required variables
- Run `npm install` to ensure dependencies are installed

### Webhook not receiving events
- Ensure ngrok is running: `ngrok http 3000`
- Check ngrok URL matches `BASE_URL` in `.env`
- Verify webhook URL is configured in Cashfree dashboard
- Check ngrok console at `http://localhost:4040` for incoming requests

### Payment page won't open
- Check backend logs for errors
- Verify Cashfree credentials are correct
- Ensure `CASHFREE_ENVIRONMENT=sandbox`
- Check mobile app console for error messages

### oINR not minting
- Check backend logs for transaction errors
- Verify backend wallet owns VaultManager contract
- Check Flow EVM Testnet is accessible
- Verify contract addresses are correct

### Mobile app can't connect to backend
- Ensure backend is running on port 3000
- If using physical device, use your computer's IP instead of localhost
- Check CORS is enabled in backend

## 9. Useful Commands

```bash
# Check backend configuration
cd backend && node check-config.js

# View backend logs in real-time
cd backend && node server.js | tee backend.log

# Check contract owner
cast call 0x5F1311808ED97661D5b31F4C67637D8952a54cc0 "owner()(address)" --rpc-url https://testnet.evm.nodes.onflow.org

# Check oINR balance
cast call 0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae "balanceOf(address)(uint256)" YOUR_WALLET_ADDRESS --rpc-url https://testnet.evm.nodes.onflow.org

# Clear Expo cache (if mobile app has issues)
cd oruva-mobile && expo start -c
```

## 10. Support & Documentation

- **Cashfree Docs**: https://docs.cashfree.com/
- **Flow EVM Docs**: https://developers.flow.com/evm/
- **Expo Docs**: https://docs.expo.dev/

## 11. Team Collaboration

### For New Team Members

1. **Get Access**:
   - GitHub repository access
   - Cashfree sandbox account (optional - can share credentials)
   - ngrok account

2. **Follow Setup Steps** (1-4 above)

3. **Use Shared Backend** (alternative):
   - If backend is already deployed, just update mobile app's API URL
   - Skip ngrok and backend setup

### Sharing Credentials

- **Never commit** `.env` files to git
- Use a secure password manager to share credentials
- Each developer should have their own ngrok account

---

## Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/anish-ck/Oruva.git && cd Oruva

# 2. Backend Setup
cd backend && npm install
cp .env.example .env
# Edit .env with your credentials
node server.js

# 3. Start ngrok (separate terminal)
ngrok http 3000

# 4. Mobile App (separate terminal)
cd oruva-mobile && npm install
npm start

# 5. Test payment with testsuccess@gocash
```

---

**Happy Coding! 🚀**
