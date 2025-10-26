# 🏦 Oruva DeFi Bank - MVP Hackathon Project## Foundry



## Overview**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Oruva DeFi Bank is a **decentralized lending protocol** that enables users to deposit crypto collateral and borrow **oINR** (a stablecoin pegged to Indian Rupee). Built on Flow EVM Testnet.

Foundry consists of:

**Live on Flow EVM Testnet (Chain ID: 545)**

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).

---- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.

- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.

## 🎯 Problem Statement- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

India has limited access to DeFi infrastructure with INR-denominated assets. Oruva solves this by creating an over-collateralized stablecoin system specifically for the Indian market.

## Documentation

---

https://book.getfoundry.sh/

## ✨ Key Features

## Usage

- ✅ **Over-collateralized Lending** - 150% minimum collateral ratio ensures system stability

- ✅ **Real-time Price Oracle** - USDC/INR pricing (1 USDC = 83 INR)### Build

- ✅ **INR-Pegged Stablecoin** - oINR maintains 1:1 peg with Indian Rupee

- ✅ **Permissionless** - Anyone can deposit and borrow```shell

- ✅ **Transparent** - All transactions on-chain$ forge build

```

---

### Test

## 📋 Deployed Contracts

```shell

| Contract | Address | Purpose |$ forge test

|----------|---------|---------|```

| **VaultManager** | `0x22E1AE8A85e76e94683D668c0107b69eF18a62cA` | Main user interface |

| **VaultEngine** | `0x544759a30fD8fbf6E26b2184119F49921BF3c265` | Accounting system |### Format

| **oINR Token** | `0x883Fa6BE70D11516dC3d9ED851278829a746840F` | INR stablecoin |

| **PriceOracle** | `0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e` | USDC/INR pricing |```shell

| **MockUSDC** | `0x6BF62E80CaF83847eD57233Ee119673F8fF7aB5c` | Test collateral |$ forge fmt

| **CollateralJoin** | `0x248Ed726c497238c1bD8977b1E377559daE1c479` | Collateral gateway |```



**Explorer**: https://evm-testnet.flowscan.io### Gas Snapshots



---```shell

$ forge snapshot

## 🔄 How It Works```



### 1. **Deposit Collateral**### Anvil

```solidity

VaultManager.deposit(1000 * 10**6) // Deposit 1000 USDC```shell

```$ anvil

- User deposits MockUSDC as collateral```

- Collateral value calculated: 1000 USDC × 83 INR = **83,000 INR**

### Deploy

### 2. **Borrow oINR**

```solidity```shell

VaultManager.borrow(55000 * 10**18) // Borrow 55,000 oINR$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>

``````

- Maximum borrowable: 83,000 / 1.5 = **55,333 oINR**

- System checks 150% collateralization ratio### Cast

- oINR tokens minted to user

```shell

### 3. **Repay Debt**$ cast <subcommand>

```solidity```

VaultManager.repay(55000 * 10**18) // Repay 55,000 oINR

```### Help

- User repays borrowed oINR

- oINR tokens burned```shell

- Debt reduced in system$ forge --help

$ anvil --help

### 4. **Withdraw Collateral**$ cast --help

```solidity```

VaultManager.withdraw(1000 * 10**6) // Withdraw 1000 USDC
```
- After debt is repaid, withdraw original collateral
- System ensures safe collateralization ratio

---

## 💡 Example Scenario

```
User Flow:
1. Deposit 5000 USDC → Collateral value: 415,000 INR
2. Borrow 200,000 oINR → Ratio: 207% ✅ (> 150%)
3. Use oINR for payments/trading in India
4. Repay 200,000 oINR → Debt cleared
5. Withdraw 5000 USDC → Get back collateral
```

---

## 🛠 Technology Stack

- **Solidity 0.8.20** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Security libraries
- **Flow EVM** - Blockchain platform

---

## 📊 Key Parameters

- **Min Collateralization Ratio**: 150%
- **USDC Price**: 83 INR (set in oracle)
- **oINR Decimals**: 18
- **USDC Decimals**: 6

---

## 🚀 Future Enhancements

### Production Roadmap:
1. **Chainlink Oracle Integration** - Real-time USD/INR pricing
2. **Liquidation Engine** - Auto-liquidate risky positions
3. **Multi-collateral Support** - BTC, ETH, MATIC
4. **Stability Fee** - Interest on borrowed oINR
5. **Governance Token** - Community-driven protocol
6. **Mobile App** - Easy access for Indian users

---

## 🧪 Testing

### View Vault Information:
```solidity
VaultManager.getVaultInfo(userAddress)
// Returns: collateral, debt, valueINR, ratio, isHealthy
```

### Check Borrow Capacity:
```solidity
VaultManager.checkBorrowCapacity(userAddress, amount)
// Returns: canBorrow, maxBorrowable
```

---

## 📝 Smart Contract Architecture

```
VaultManager (User Interface)
    ↓
├── VaultEngine (Tracks collateral & debt)
├── PriceOracle (USDC/INR pricing)
└── oINR Token (Stablecoin)
```

### Core Functions:
- `deposit(amount)` - Deposit collateral
- `borrow(amount)` - Borrow oINR
- `repay(amount)` - Repay debt
- `withdraw(amount)` - Withdraw collateral

---

## 🎓 For Judges

### Innovation:
- First INR-focused DeFi protocol on Flow
- Addresses India's $3T economy with crypto-native solution
- Over-collateralized design ensures stability

### Technical Excellence:
- Clean, modular architecture
- Price oracle integration
- Real-time collateral valuation
- Secure permission system

### Market Potential:
- India has 1.4B population
- Growing crypto adoption
- Need for stable, INR-denominated DeFi

---

## 📜 License
MIT

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
