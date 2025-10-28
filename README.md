# Oruva - Decentralized INR Stablecoin Platform

![Oruva](https://img.shields.io/badge/Oruva-DeFi%20Platform-blue)
![Flow EVM](https://img.shields.io/badge/Flow-EVM%20Testnet-green)
![React Native](https://img.shields.io/badge/React%20Native-Expo-purple)
![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-orange)

Oruva is a decentralized platform for minting and managing INR-backed stablecoins (oINR) on the Flow EVM blockchain. The platform combines DeFi primitives with traditional payment rails to enable seamless INR transactions in the crypto ecosystem.

## 🌟 Features

### Core Platform
- **oINR Stablecoin**: 1:1 INR-pegged stablecoin with USDC collateral
- **Collateralized Debt Positions (CDP)**: Over-collateralized vault system
- **Yield Vaults**: Earn 5% APY on USDC & oINR deposits
- **Magic Link Authentication**: Passwordless email login
- **Cashfree Integration**: Instant INR deposits via UPI/Cards
- **QR Code Payments**: Send/receive payments via QR scanning

### Mobile App (Oruva Mobile)
- **Modern PayTM-style UI**: Professional gradient design with vector icons
- **Multi-screen Architecture**: Home, Balances, Vault, Profile screens
- **Vault Management**: Deposit, borrow, repay, and manage collateral
- **Transaction History**: Track all vault and payment activities
- **Real-time Balance Updates**: Live USDC and oINR balances

### Smart Contracts
- **VaultEngine**: Core CDP management system
- **VaultManager**: User-facing vault operations
- **OINRToken**: ERC20 stablecoin implementation
- **CollateralJoin**: USDC collateral management
- **Oracle**: Price feed integration
- **YieldVaults**: USDC and oINR yield generation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Oruva Mobile App                    │
│  (React Native + Expo + Magic Link + Cashfree)     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─── Magic SDK (Authentication)
                   │
                   ├─── Cashfree API (INR Deposits)
                   │
                   ├─── Backend API (Node.js + Express)
                   │
                   └─── Flow EVM Testnet
                        │
                        ├─── VaultEngine Contract
                        ├─── VaultManager Contract
                        ├─── OINRToken Contract
                        ├─── CollateralJoin Contract
                        ├─── Oracle Contract
                        └─── YieldVault Contracts
```

## 📱 Screenshots

### Mobile App
- **Home Screen**: Money transfer, vault services, promotional cards
- **Balances Screen**: USDC/oINR balances, vault health status
- **Vault Screen**: Mint, deposit, borrow, buy oINR, repay
- **Profile Screen**: Wallet info, transaction history, network details
- **Add INR Screen**: Cashfree payment integration

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- Expo CLI
- Foundry (for smart contracts)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/anish-ck/Oruva.git
cd Oruva
```

### 2. Install Dependencies

**Smart Contracts:**
```bash
forge install
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Mobile App:**
```bash
cd oruva-mobile
npm install
```

### 3. Environment Setup

**Backend (.env):**
```env
PORT=3000
FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
PRIVATE_KEY=your_private_key
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=TEST
OINR_TOKEN_ADDRESS=deployed_oinr_address
VAULT_MANAGER_ADDRESS=deployed_vault_manager_address
```

**Mobile App (.env):**
```env
EXPO_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_key
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:3000
EXPO_PUBLIC_FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
EXPO_PUBLIC_CHAIN_ID=545
```

### 4. Deploy Smart Contracts
```bash
# Deploy all contracts
forge script script/DeployAll.s.sol --rpc-url flow-testnet --broadcast

# Or use the complete deployment script
forge script script/CompleteDeployment.s.sol --rpc-url flow-testnet --broadcast
```

### 5. Run Backend
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

### 6. Run Mobile App
```bash
cd oruva-mobile
npm start
# Scan QR code with Expo Go app
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[Backend README](backend/README.md)** - Backend API documentation
- **[Mobile README](oruva-mobile/README.md)** - Mobile app guide
- **[Smart Contracts](src/)** - Contract source code and documentation

## 🛠️ Technology Stack

### Blockchain & Smart Contracts
- **Flow EVM Testnet** - Layer 1 blockchain
- **Solidity 0.8.20** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Contract libraries
- **Ethers.js v6** - Blockchain interaction

### Backend
- **Node.js + Express** - API server
- **Cashfree SDK** - Payment processing
- **ethers.js** - Contract interactions

### Mobile App
- **React Native** - Cross-platform framework
- **Expo SDK 54** - Development platform
- **Magic SDK** - Passwordless authentication
- **@expo/vector-icons** - Icon library
- **expo-linear-gradient** - Gradient backgrounds
- **expo-barcode-scanner** - QR code scanning

### UI/UX
- **PayTM-inspired Design** - Modern fintech UI
- **Blue Gradient Themes** - Professional color palette
- **Vector Icons** - MaterialIcons, Ionicons, FontAwesome5
- **Card-based Layout** - Clean component structure

## 📋 Contract Addresses (Flow EVM Testnet)

Update `CONTRACT_ADDRESSES.json` with your deployed addresses:

```json
{
  "OINRToken": "0x...",
  "VaultEngine": "0x...",
  "VaultManager": "0x...",
  "CollateralJoin": "0x...",
  "Oracle": "0x...",
  "USDCYieldVault": "0x...",
  "OINRYieldVault": "0x..."
}
```

## 🔐 Security

- **Over-collateralization**: 150% minimum collateral ratio
- **Liquidation Protection**: Automatic health monitoring
- **Role-based Access Control**: Admin/minter separation
- **Audited Libraries**: OpenZeppelin contracts
- **Magic Link Security**: Non-custodial wallet management

## 🧪 Testing

### Smart Contracts
```bash
forge test
forge test -vvv  # Verbose output
```

### Backend
```bash
cd backend
npm test
```

### Mobile App
```bash
cd oruva-mobile
npm test
```

## 📊 Key Metrics

- **Collateral Ratio**: 150% minimum
- **Liquidation Threshold**: Below 150%
- **Yield APY**: 5% on USDC & oINR
- **Stability Fee**: 0% (currently)
- **oINR Peg**: 1:1 INR

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Anish** - Lead Developer
- GitHub: [@anish-ck](https://github.com/anish-ck)

## 🔗 Links

- **GitHub**: [https://github.com/anish-ck/Oruva](https://github.com/anish-ck/Oruva)
- **Flow EVM Testnet**: [https://evm-testnet.flowscan.io/](https://evm-testnet.flowscan.io/)
- **Magic Link**: [https://magic.link/](https://magic.link/)
- **Cashfree**: [https://www.cashfree.com/](https://www.cashfree.com/)

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Contact: [Your contact information]

## 🗺️ Roadmap

### Phase 1 (Completed) ✅
- Core smart contracts deployment
- Mobile app with Magic Link auth
- Cashfree payment integration
- Vault management UI
- Yield vaults implementation

### Phase 2 (In Progress) 🚧
- Mainnet deployment
- Advanced analytics dashboard
- Multi-collateral support
- Governance token

### Phase 3 (Planned) 📋
- Cross-chain bridges
- Advanced DeFi strategies
- Institutional features
- Mobile app on App Store/Play Store

---

**Built with ❤️ for the Flow ecosystem**
