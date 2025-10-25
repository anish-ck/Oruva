# 📱 Oruva DeFi Bank - React Native (Expo) Frontend

## 🎯 Overview

This is a **React Native mobile app** built with **Expo** for the Oruva DeFi Bank. Users can manage their crypto collateral, borrow oINR stablecoin, and handle repayments directly from their mobile device.

**No Magic Link in this version** - Users connect with their existing Web3 wallet (MetaMask, Trust Wallet, etc.)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- Expo Go app on your phone (or iOS Simulator/Android Emulator)

### Installation

```bash
# Create Expo app
npx create-expo-app oruva-mobile
cd oruva-mobile

# Install dependencies
npm install ethers@5.7.2
npm install @react-native-async-storage/async-storage
npm install react-native-url-polyfill
npm install @walletconnect/web3-provider
npm install react-native-svg
```

---

## 📂 Project Structure

```
oruva-mobile/
├── App.js
├── src/
│   ├── config/
│   │   ├── contracts.js      # Contract addresses & ABIs
│   │   └── network.js        # Flow EVM Testnet config
│   ├── services/
│   │   ├── wallet.js         # Wallet connection
│   │   └── vault.js          # Vault operations
│   ├── screens/
│   │   ├── HomeScreen.js     # Dashboard
│   │   ├── DepositScreen.js  # Deposit flow
│   │   ├── BorrowScreen.js   # Borrow flow
│   │   ├── RepayScreen.js    # Repay flow
│   │   └── WithdrawScreen.js # Withdraw flow
│   ├── components/
│   │   ├── WalletConnect.js  # Wallet connection button
│   │   ├── VaultInfo.js      # Vault status card
│   │   └── TransactionButton.js
│   └── utils/
│       └── formatters.js     # Number formatting
├── assets/
└── package.json
```

---

## 🔧 Configuration

### 1. Network Configuration

```javascript
// src/config/network.js
export const FLOW_EVM_TESTNET = {
  chainId: 545,
  name: 'Flow EVM Testnet',
  rpcUrl: 'https://testnet.evm.nodes.onflow.org',
  blockExplorer: 'https://evm-testnet.flowscan.io',
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18,
  },
};
```

### 2. Contract Configuration

```javascript
// src/config/contracts.js
export const CONTRACTS = {
  vaultManager: '0x22E1AE8A85e76e94683D668c0107b69eF18a62cA',
  vaultEngine: '0x544759a30fD8fbf6E26b2184119F49921BF3c265',
  oinr: '0x883Fa6BE70D11516dC3d9ED851278829a746840F',
  mockUSDC: '0x6BF62E80CaF83847eD57233Ee119673F8fF7aB5c',
  priceOracle: '0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e',
  collateralJoin: '0x248Ed726c497238c1bD8977b1E377559daE1c479',
};

// Import ABIs (copy from smart contract repo)
export const ABIS = {
  vaultManager: require('../abis/VaultManager.json').abi,
  mockUSDC: require('../abis/MockUSDC.json').abi,
  oinr: require('../abis/oINR.json').abi,
};
```

---

## 💼 Wallet Connection (MetaMask Mobile)

### Setup WalletConnect

```javascript
// src/services/wallet.js
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { FLOW_EVM_TESTNET } from '../config/network';

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }

  async connect() {
    try {
      // Create WalletConnect Provider
      const provider = new WalletConnectProvider({
        rpc: {
          [FLOW_EVM_TESTNET.chainId]: FLOW_EVM_TESTNET.rpcUrl,
        },
        chainId: FLOW_EVM_TESTNET.chainId,
      });

      // Enable session (shows QR Code)
      await provider.enable();

      // Create ethers provider
      this.provider = new ethers.providers.Web3Provider(provider);
      this.signer = this.provider.getSigner();
      this.address = await this.signer.getAddress();

      console.log('Wallet connected:', this.address);
      return this.address;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.provider?.provider?.disconnect) {
      await this.provider.provider.disconnect();
    }
    this.provider = null;
    this.signer = null;
    this.address = null;
  }

  isConnected() {
    return this.address !== null;
  }

  getAddress() {
    return this.address;
  }

  getSigner() {
    return this.signer;
  }

  async getBalance() {
    if (!this.address) return '0';
    const balance = await this.provider.getBalance(this.address);
    return ethers.utils.formatEther(balance);
  }
}

export default new WalletService();
```

---

## 🏦 Vault Operations

```javascript
// src/services/vault.js
import { ethers } from 'ethers';
import walletService from './wallet';
import { CONTRACTS, ABIS } from '../config/contracts';

class VaultService {
  constructor() {
    this.vaultManager = null;
    this.usdc = null;
    this.oinr = null;
  }

  initialize() {
    const signer = walletService.getSigner();
    
    this.vaultManager = new ethers.Contract(
      CONTRACTS.vaultManager,
      ABIS.vaultManager,
      signer
    );
    
    this.usdc = new ethers.Contract(
      CONTRACTS.mockUSDC,
      ABIS.mockUSDC,
      signer
    );
    
    this.oinr = new ethers.Contract(
      CONTRACTS.oinr,
      ABIS.oinr,
      signer
    );
  }

  async getVaultInfo(address) {
    if (!this.vaultManager) this.initialize();
    
    const info = await this.vaultManager.getVaultInfo(address);
    
    return {
      collateral: ethers.utils.formatUnits(info.collateral, 6),
      debt: ethers.utils.formatEther(info.debt),
      collateralValueINR: ethers.utils.formatEther(info.collateralValueINR),
      ratio: info.ratio.toNumber() / 100,
      isHealthy: info.isHealthy,
    };
  }

  async getBalances(address) {
    if (!this.usdc) this.initialize();
    
    const usdcBalance = await this.usdc.balanceOf(address);
    const oinrBalance = await this.oinr.balanceOf(address);
    
    return {
      usdc: ethers.utils.formatUnits(usdcBalance, 6),
      oinr: ethers.utils.formatEther(oinrBalance),
    };
  }

  async deposit(amountUSDC) {
    if (!this.vaultManager) this.initialize();
    
    const amount = ethers.utils.parseUnits(amountUSDC.toString(), 6);
    
    // Approve
    const approveTx = await this.usdc.approve(CONTRACTS.vaultManager, amount);
    await approveTx.wait();
    
    // Deposit
    const depositTx = await this.vaultManager.deposit(amount);
    return await depositTx.wait();
  }

  async borrow(amountOINR) {
    if (!this.vaultManager) this.initialize();
    
    const amount = ethers.utils.parseEther(amountOINR.toString());
    const tx = await this.vaultManager.borrow(amount);
    return await tx.wait();
  }

  async buyOINR(amountOINR) {
    if (!this.vaultManager) this.initialize();
    
    const amount = ethers.utils.parseEther(amountOINR.toString());
    
    // Calculate required USDC
    const requiredUSDC = ethers.utils.parseUnits(
      (amountOINR / 83).toFixed(6),
      6
    );
    
    // Approve USDC
    const approveTx = await this.usdc.approve(CONTRACTS.vaultManager, requiredUSDC);
    await approveTx.wait();
    
    // Buy oINR
    const tx = await this.vaultManager.buyOINR(amount);
    return await tx.wait();
  }

  async repay(amountOINR) {
    if (!this.vaultManager) this.initialize();
    
    const amount = ethers.utils.parseEther(amountOINR.toString());
    
    // Approve oINR
    const approveTx = await this.oinr.approve(CONTRACTS.vaultManager, amount);
    await approveTx.wait();
    
    // Repay
    const tx = await this.vaultManager.repay(amount);
    return await tx.wait();
  }

  async withdraw(amountUSDC) {
    if (!this.vaultManager) this.initialize();
    
    const amount = ethers.utils.parseUnits(amountUSDC.toString(), 6);
    const tx = await this.vaultManager.withdraw(amount);
    return await tx.wait();
  }

  async checkBorrowCapacity(address, borrowAmount) {
    if (!this.vaultManager) this.initialize();
    
    const amount = ethers.utils.parseEther(borrowAmount.toString());
    const result = await this.vaultManager.checkBorrowCapacity(address, amount);
    
    return {
      canBorrow: result.canBorrow,
      maxBorrowable: ethers.utils.formatEther(result.maxBorrowable),
    };
  }
}

export default new VaultService();
```

---

## 📱 Main App Component

```javascript
// App.js
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import walletService from './src/services/wallet';
import vaultService from './src/services/vault';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [vaultInfo, setVaultInfo] = useState(null);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Input states
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  useEffect(() => {
    if (connected && address) {
      loadData();
    }
  }, [connected, address]);

  async function handleConnect() {
    setLoading(true);
    try {
      const addr = await walletService.connect();
      setAddress(addr);
      setConnected(true);
      vaultService.initialize();
    } catch (error) {
      Alert.alert('Error', 'Failed to connect wallet');
    }
    setLoading(false);
  }

  async function handleDisconnect() {
    await walletService.disconnect();
    setConnected(false);
    setAddress('');
    setVaultInfo(null);
    setBalances(null);
  }

  async function loadData() {
    try {
      const info = await vaultService.getVaultInfo(address);
      const bal = await vaultService.getBalances(address);
      setVaultInfo(info);
      setBalances(bal);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function handleDeposit() {
    if (!depositAmount) return;
    
    setLoading(true);
    try {
      await vaultService.deposit(parseFloat(depositAmount));
      Alert.alert('Success', 'Deposit successful!');
      setDepositAmount('');
      await loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  }

  async function handleBorrow() {
    if (!borrowAmount) return;
    
    setLoading(true);
    try {
      await vaultService.borrow(parseFloat(borrowAmount));
      Alert.alert('Success', 'Borrow successful!');
      setBorrowAmount('');
      await loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  }

  async function handleRepay() {
    if (!repayAmount) return;
    
    setLoading(true);
    try {
      await vaultService.repay(parseFloat(repayAmount));
      Alert.alert('Success', 'Repayment successful!');
      setRepayAmount('');
      await loadData();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  }

  if (!connected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oruva DeFi Bank</Text>
        <Text style={styles.subtitle}>Borrow INR Stablecoin</Text>
        
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleConnect}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Vault</Text>
        <Text style={styles.address}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </Text>
        <TouchableOpacity onPress={handleDisconnect}>
          <Text style={styles.disconnect}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Balances */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Balances</Text>
        <Text style={styles.balanceText}>USDC: {balances?.usdc || '0'}</Text>
        <Text style={styles.balanceText}>oINR: {balances?.oinr || '0'}</Text>
      </View>

      {/* Vault Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vault Status</Text>
        <Text style={styles.infoText}>
          Collateral: {vaultInfo?.collateral || '0'} USDC
        </Text>
        <Text style={styles.infoText}>
          Debt: {vaultInfo?.debt || '0'} oINR
        </Text>
        <Text style={styles.infoText}>
          Value: ₹{vaultInfo?.collateralValueINR || '0'}
        </Text>
        <Text style={styles.infoText}>
          Ratio: {vaultInfo?.ratio || '0'}%
        </Text>
        <Text
          style={[
            styles.healthStatus,
            { color: vaultInfo?.isHealthy ? '#10b981' : '#ef4444' },
          ]}
        >
          {vaultInfo?.isHealthy ? '✅ Healthy' : '⚠️ Undercollateralized'}
        </Text>
      </View>

      {/* Deposit */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Deposit Collateral</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount (USDC)"
          keyboardType="numeric"
          value={depositAmount}
          onChangeText={setDepositAmount}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeposit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* Borrow */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Borrow oINR</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount (oINR)"
          keyboardType="numeric"
          value={borrowAmount}
          onChangeText={setBorrowAmount}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleBorrow}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Borrow</Text>
        </TouchableOpacity>
      </View>

      {/* Repay */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Repay Debt</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount (oINR)"
          keyboardType="numeric"
          value={repayAmount}
          onChangeText={setRepayAmount}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRepay}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Repay</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  address: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  disconnect: {
    fontSize: 14,
    color: '#ef4444',
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  balanceText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  connectButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
});
```

---

## 🧪 Testing on Expo Go

### Run the app:

```bash
# Start Expo
npx expo start

# Scan QR code with Expo Go app
# Or press 'i' for iOS Simulator
# Or press 'a' for Android Emulator
```

### Test Flow:

1. **Connect Wallet** - Scan QR with MetaMask Mobile
2. **Mint Test USDC** - Get test tokens
3. **Deposit** - Add collateral
4. **Borrow** - Get oINR
5. **Repay** - Pay back debt

---

## 📋 Features Included

- ✅ Wallet connection (WalletConnect)
- ✅ View vault status
- ✅ Deposit USDC collateral
- ✅ Borrow oINR
- ✅ Repay debt
- ✅ Withdraw collateral
- ✅ Real-time balance updates
- ✅ Health ratio indicator

---

## 🚀 Next Steps

1. **Add Buy oINR screen**
2. **Add transaction history**
3. **Add notifications**
4. **Improve UI/UX**
5. **Add Dark mode**

---

## 📚 Resources

- Expo Docs: https://docs.expo.dev
- WalletConnect: https://docs.walletconnect.com
- Ethers.js: https://docs.ethers.org/v5/

---

**Start building your mobile DeFi bank!** 📱✨
