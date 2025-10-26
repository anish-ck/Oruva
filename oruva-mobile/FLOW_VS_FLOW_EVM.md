# Flow vs Flow EVM: Understanding the Difference

## Overview

There are **TWO different Flow blockchains**, and it's important to understand which one we're using for the Oruva project.

## Flow (Cadence) - Non-EVM Blockchain

### What it is:
- Original Flow blockchain
- Uses **Cadence** as the smart contract language
- Uses **Flow Client Library (FCL)** for blockchain interaction
- Multi-role architecture with distinct node types
- Resource-oriented programming model

### Technology Stack:
- **Smart Contracts**: Cadence language
- **SDK**: `@onflow/fcl` (Flow Client Library)
- **Magic Integration**: `@magic-ext/flow` extension
- **RPC Endpoint**: `https://rest-testnet.onflow.org`

### Use Cases:
- NFT platforms (NBA Top Shot, etc.)
- Gaming applications
- Native Flow dApps

### Example Code:
```javascript
import { Magic } from 'magic-sdk';
import { FlowExtension } from '@magic-ext/flow';
import * as fcl from '@onflow/fcl';

const magic = new Magic('API_KEY', {
  extensions: [
    new FlowExtension({
      rpcUrl: 'https://rest-testnet.onflow.org',
      network: 'testnet'
    })
  ]
});

// Use FCL for transactions
await fcl.mutate({
  cadence: `transaction { ... }`,
  authorizations: [magic.flow.authorization]
});
```

## Flow EVM - Ethereum Virtual Machine on Flow

### What it is:
- **Ethereum Virtual Machine** running on Flow blockchain
- Uses **Solidity** for smart contracts (same as Ethereum)
- Uses **ethers.js** or **web3.js** for blockchain interaction
- Fully Ethereum-compatible
- Allows deploying existing Ethereum contracts to Flow

### Technology Stack:
- **Smart Contracts**: Solidity language (same as Ethereum)
- **SDK**: ethers.js or web3.js (standard Ethereum libraries)
- **Magic Integration**: Standard Magic SDK (no special extension)
- **RPC Endpoint**: `https://testnet.evm.nodes.onflow.org`
- **Chain ID**: 545 (testnet)

### Use Cases:
- DeFi applications
- Porting Ethereum dApps to Flow
- Our Oruva stablecoin project ✅

### Example Code:
```javascript
import { Magic } from '@magic-sdk/react-native-expo';
import { ethers } from 'ethers';

const magic = new Magic('API_KEY', {
  network: {
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    chainId: 545
  }
});

// Use ethers.js for transactions
const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
const signer = provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);
await contract.someMethod();
```

## Which One Are We Using?

### ✅ We are using: **Flow EVM**

**Reasons:**
1. Our smart contracts are written in **Solidity** (Ethereum language)
2. We use **ethers.js** to interact with contracts
3. Our contracts: VaultManager, VaultEngine, oINR, CollateralJoin
4. Deployed on Flow EVM Testnet (Chain ID 545)
5. RPC: `https://testnet.evm.nodes.onflow.org`

**This means:**
- ✅ Use standard Magic SDK: `@magic-sdk/react-native-expo`
- ✅ Use ethers.js: Already installed
- ✅ Configure custom network with Flow EVM RPC
- ❌ DO NOT use `@magic-ext/flow` extension
- ❌ DO NOT use FCL (Flow Client Library)
- ❌ DO NOT use Cadence

## Quick Comparison Table

| Feature | Flow (Cadence) | Flow EVM |
|---------|---------------|----------|
| **Smart Contract Language** | Cadence | Solidity |
| **Blockchain SDK** | FCL (@onflow/fcl) | ethers.js / web3.js |
| **Magic Extension** | @magic-ext/flow | Standard (no extension) |
| **RPC Endpoint** | rest-testnet.onflow.org | testnet.evm.nodes.onflow.org |
| **Chain ID** | N/A | 545 (testnet) |
| **Account Format** | Flow address (0x...) | Ethereum address (0x...) |
| **Compatible With** | Flow ecosystem | Ethereum ecosystem |
| **Our Project Uses** | ❌ No | ✅ Yes |

## Documentation References

### Flow (Cadence):
- Magic Docs: https://docs.magic.link/embedded-wallets/blockchains/non-evm/flow
- Flow Docs: https://developers.flow.com/
- FCL Docs: https://developers.flow.com/tools/clients/fcl-js

### Flow EVM:
- Magic Docs: https://docs.magic.link/embedded-wallets/sdk/client-side/react-native (standard EVM)
- Flow EVM Docs: https://developers.flow.com/evm/about
- ethers.js Docs: https://docs.ethers.io/v5/

## Summary

**Flow (Cadence)** and **Flow EVM** are completely different environments:
- **Flow (Cadence)**: Custom blockchain with unique features, requires special Magic extension
- **Flow EVM**: Ethereum-compatible environment, uses standard Magic SDK and ethers.js

**For Oruva, we use Flow EVM** because:
1. Our contracts are already in Solidity
2. We use ethers.js for blockchain interaction
3. No need to learn Cadence or FCL
4. Standard Ethereum development workflow
5. Easy to port to other EVM chains if needed

When reading Magic Link documentation:
- ✅ Follow the **React Native SDK Reference** guide
- ✅ Use standard EVM configuration
- ❌ Ignore the **Flow (non-EVM)** blockchain guide
