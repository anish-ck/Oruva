# 🏦 Oruva - DeFi Stablecoin Bank on Flow# 🏦 Oruva DeFi Bank - MVP Hackathon Project## Foundry



Borrow INR-pegged stablecoin (oINR) using USDC as collateral. Built on Flow EVM Testnet with UPI-style QR payments.



## 🌟 Key Features## Overview**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**



- ✅ **Walletless Onboarding** - No MetaMask required, wallet auto-generatedOruva DeFi Bank is a **decentralized lending protocol** that enables users to deposit crypto collateral and borrow **oINR** (a stablecoin pegged to Indian Rupee). Built on Flow EVM Testnet.

- ✅ **Borrow oINR** - Use USDC as collateral (150% collateralization)

- ✅ **Buy oINR** - Direct purchase with USDC at oracle priceFoundry consists of:

- ✅ **QR Code Payments** - UPI-style instant peer-to-peer transfers

- ✅ **Mobile App** - Built with React Native & Expo**Live on Flow EVM Testnet (Chain ID: 545)**



## 📱 Quick Start - Mobile App- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).



### Prerequisites---- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.



- Node.js 18.x or 20.x- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.

- [Expo Go](https://expo.dev/client) app on your phone

- FLOW testnet tokens from [faucet.flow.com](https://faucet.flow.com/)## 🎯 Problem Statement- **Chisel**: Fast, utilitarian, and verbose solidity REPL.



### InstallationIndia has limited access to DeFi infrastructure with INR-denominated assets. Oruva solves this by creating an over-collateralized stablecoin system specifically for the Indian market.



```bash## Documentation

# Clone repository

git clone https://github.com/anish-ck/Oruva.git---

cd Oruva/oruva-mobile

https://book.getfoundry.sh/

# Install dependencies

npm install## ✨ Key Features



# Start development server## Usage

npx expo start

```- ✅ **Over-collateralized Lending** - 150% minimum collateral ratio ensures system stability



### Running on Your Phone- ✅ **Real-time Price Oracle** - USDC/INR pricing (1 USDC = 83 INR)### Build



1. Download **Expo Go** from Play Store (Android) or App Store (iOS)- ✅ **INR-Pegged Stablecoin** - oINR maintains 1:1 peg with Indian Rupee

2. Make sure your phone and laptop are on the **same WiFi**

3. In Expo Go, scan the QR code from terminal- ✅ **Permissionless** - Anyone can deposit and borrow```shell

4. App will load automatically!

- ✅ **Transparent** - All transactions on-chain$ forge build

## 🎯 How to Use

```

### 1️⃣ Create Wallet

- App auto-generates a wallet on first launch---

- Save your private key securely!

- Get FLOW tokens from [faucet.flow.com](https://faucet.flow.com/)### Test



### 2️⃣ Get Test USDC## 📋 Deployed Contracts

- Tap "Mint USDC" button

- Enter amount (e.g., 1000)```shell

- Confirm transaction

| Contract | Address | Purpose |$ forge test

### 3️⃣ Get oINR (Two Methods)

|----------|---------|---------|```

**Method A: Buy oINR**

- Tap "Buy oINR"| **VaultManager** | `0x22E1AE8A85e76e94683D668c0107b69eF18a62cA` | Main user interface |

- Enter amount (e.g., 100)

- Confirm purchase| **VaultEngine** | `0x544759a30fD8fbf6E26b2184119F49921BF3c265` | Accounting system |### Format

- Instantly receive oINR!

| **oINR Token** | `0x883Fa6BE70D11516dC3d9ED851278829a746840F` | INR stablecoin |

**Method B: Borrow oINR**

- Tap "Deposit" → Enter USDC amount| **PriceOracle** | `0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e` | USDC/INR pricing |```shell

- Tap "Borrow" → Enter oINR amount (max 66% of collateral value)

- Confirm transaction| **MockUSDC** | `0x6BF62E80CaF83847eD57233Ee119673F8fF7aB5c` | Test collateral |$ forge fmt



### 4️⃣ Send/Receive oINR with QR Codes| **CollateralJoin** | `0x248Ed726c497238c1bD8977b1E377559daE1c479` | Collateral gateway |```



**To Receive:**

1. Tap **📥 Receive** button

2. Enter amount you want to receive**Explorer**: https://evm-testnet.flowscan.io### Gas Snapshots

3. (Optional) Add a note

4. Tap "Generate QR Code"

5. Show QR code to sender

---```shell

**To Send:**

1. Tap **📤 Send** button$ forge snapshot

2. Allow camera permission

3. Scan receiver's QR code## 🔄 How It Works```

4. Review payment details

5. Tap "Confirm & Pay"

6. Done! ✅

### 1. **Deposit Collateral**### Anvil

## 📋 Contract Addresses (Flow EVM Testnet)

```solidity

```

VaultManager:   0x5F1311808ED97661D5b31F4C67637D8952a54cc0VaultManager.deposit(1000 * 10**6) // Deposit 1000 USDC```shell

VaultEngine:    0xa9255087b8d1B75456eA5d4fc272B884E7A7AE8a

oINR Token:     0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae```$ anvil

CollateralJoin: 0x0b54a6bf84108d7C8d5a2296Df4a2264b1f7Fd66

MockUSDC:       0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43- User deposits MockUSDC as collateral```

PriceOracle:    0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99

```- Collateral value calculated: 1000 USDC × 83 INR = **83,000 INR**



**Network:** Flow EVM Testnet (Chain ID: 545)  ### Deploy

**RPC:** https://testnet.evm.nodes.onflow.org  

**Explorer:** https://evm-testnet.flowscan.io### 2. **Borrow oINR**



## 🔧 Smart Contracts```solidity```shell



### ArchitectureVaultManager.borrow(55000 * 10**18) // Borrow 55,000 oINR$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>



`````````

User → VaultManager → VaultEngine → Collateral/Debt Tracking

                  ↓- Maximum borrowable: 83,000 / 1.5 = **55,333 oINR**

               oINR Token (Mint/Burn)

                  ↓- System checks 150% collateralization ratio### Cast

            Price Oracle (USDC/INR rate)

```- oINR tokens minted to user



### Key Contracts```shell



**VaultManager** - Main user interface### 3. **Repay Debt**$ cast <subcommand>

- `deposit()` - Lock USDC collateral

- `borrow()` - Mint oINR against collateral```solidity```

- `buyOINR()` - Direct purchase with USDC

- `repay()` - Burn oINR to reduce debtVaultManager.repay(55000 * 10**18) // Repay 55,000 oINR

- `withdraw()` - Remove collateral

```### Help

**oINR** - ERC20 stablecoin token

- 1 oINR = 1 INR (pegged)- User repays borrowed oINR

- Mintable only by VaultManager

- 18 decimals- oINR tokens burned```shell



**VaultEngine** - Accounting system- Debt reduced in system$ forge --help

- Tracks collateral and debt per user

- Enforces 150% collateralization ratio$ anvil --help



## 🛠️ Development### 4. **Withdraw Collateral**$ cast --help



### Build & Deploy Contracts```solidity```



```bashVaultManager.withdraw(1000 * 10**6) // Withdraw 1000 USDC

# Install Foundry```

curl -L https://foundry.paradigm.xyz | bash- After debt is repaid, withdraw original collateral

foundryup- System ensures safe collateralization ratio



# Build contracts---

forge build

## 💡 Example Scenario

# Deploy fresh contracts

forge script script/FreshDeploy.s.sol \```

  --rpc-url https://testnet.evm.nodes.onflow.org \User Flow:

  --private-key $PRIVATE_KEY \1. Deposit 5000 USDC → Collateral value: 415,000 INR

  --broadcast --legacy2. Borrow 200,000 oINR → Ratio: 207% ✅ (> 150%)

```3. Use oINR for payments/trading in India

4. Repay 200,000 oINR → Debt cleared

### Run Tests5. Withdraw 5000 USDC → Get back collateral

```

```bash

# Run contract tests---

forge test -vv

## 🛠 Technology Stack

# Run specific test

forge test --match-test testBorrow -vvv- **Solidity 0.8.20** - Smart contract language

```- **Foundry** - Development framework

- **OpenZeppelin** - Security libraries

### Mobile App Development- **Flow EVM** - Blockchain platform



```bash---

cd oruva-mobile

## 📊 Key Parameters

# Install dependencies

npm install- **Min Collateralization Ratio**: 150%

- **USDC Price**: 83 INR (set in oracle)

# Start with cache clear- **oINR Decimals**: 18

npx expo start -c- **USDC Decimals**: 6



# Run on specific platform---

npx expo start --ios

npx expo start --android## 🚀 Future Enhancements

```

### Production Roadmap:

## 📚 Documentation1. **Chainlink Oracle Integration** - Real-time USD/INR pricing

2. **Liquidation Engine** - Auto-liquidate risky positions

- [Mobile App Guide](oruva-mobile/README.md)3. **Multi-collateral Support** - BTC, ETH, MATIC

- [QR Payment Testing](oruva-mobile/QR_TESTING_GUIDE.md)4. **Stability Fee** - Interest on borrowed oINR

- [Quick Start Guide](oruva-mobile/QUICK_START.md)5. **Governance Token** - Community-driven protocol

- [Troubleshooting](oruva-mobile/BALANCE_DEBUG.md)6. **Mobile App** - Easy access for Indian users

- [Expo Frontend Guide](EXPO_FRONTEND_GUIDE.md)

---

## 🧪 Testing on Multiple Devices

## 🧪 Testing

You can test P2P payments using two phones:

### View Vault Information:

1. Run `npx expo start` on your laptop```solidity

2. Both phones scan the **same QR code**VaultManager.getVaultInfo(userAddress)

3. Each phone gets a different wallet// Returns: collateral, debt, valueINR, ratio, isHealthy

4. Send oINR between them using QR payments!```



[Detailed guide here](oruva-mobile/QR_TESTING_GUIDE.md)### Check Borrow Capacity:

```solidity

## 🔒 Security NotesVaultManager.checkBorrowCapacity(userAddress, amount)

// Returns: canBorrow, maxBorrowable

⚠️ **This is a testnet demo project**```

- Do NOT use on mainnet

- Private keys stored in app for demo purposes only---

- Not audited - use at your own risk

- For educational purposes only## 📝 Smart Contract Architecture



## 🗺️ Roadmap```

VaultManager (User Interface)

- [x] Basic vault operations (deposit, borrow, repay, withdraw)    ↓

- [x] QR code payment system├── VaultEngine (Tracks collateral & debt)

- [x] Mobile app with Expo├── PriceOracle (USDC/INR pricing)

- [x] Walletless onboarding└── oINR Token (Stablecoin)

- [ ] Magic Link integration```

- [ ] Production deployment

- [ ] Security audit### Core Functions:

- [ ] Mainnet launch- `deposit(amount)` - Deposit collateral

- `borrow(amount)` - Borrow oINR

## 📄 License- `repay(amount)` - Repay debt

- `withdraw(amount)` - Withdraw collateral

MIT License - see LICENSE file

---

## 🤝 Contributing

## 🎓 For Judges

Contributions welcome! Please:

1. Fork the repository### Innovation:

2. Create a feature branch- First INR-focused DeFi protocol on Flow

3. Make your changes- Addresses India's $3T economy with crypto-native solution

4. Submit a pull request- Over-collateralized design ensures stability



## 📞 Support### Technical Excellence:

- Clean, modular architecture

- GitHub Issues: [Create an issue](https://github.com/anish-ck/Oruva/issues)- Price oracle integration

- Documentation: Check `/oruva-mobile/` folder for guides- Real-time collateral valuation

- Secure permission system

## 🙏 Acknowledgments

### Market Potential:

- Built on [Flow EVM](https://flow.com/)- India has 1.4B population

- Uses [OpenZeppelin](https://openzeppelin.com/) contracts- Growing crypto adoption

- Mobile app with [Expo](https://expo.dev/)- Need for stable, INR-denominated DeFi

- Smart contracts with [Foundry](https://getfoundry.sh/)

---

---

## 📜 License

**Made with ❤️ for the Flow ecosystem**MIT


---

## 👥 Team
Built for hackathon by Anish

---

## 🔗 Links

- **VaultManager Contract**: https://evm-testnet.flowscan.io/address/0x22E1AE8A85e76e94683D668c0107b69eF18a62cA
- **oINR Token**: https://evm-testnet.flowscan.io/address/0x883Fa6BE70D11516dC3d9ED851278829a746840F
- **Flow EVM Docs**: https://developers.flow.com/evm/about

---

**Status**: ✅ MVP Complete - Ready for Demo
