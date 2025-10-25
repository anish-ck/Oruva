import { ethers } from 'ethers';
import { FLOW_EVM_TESTNET } from '../config/network';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple wallet implementation for testing
// In production, integrate WalletConnect v2 or other mobile wallet solution

class WalletService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.privateKey = null;
    }

    async connect() {
        try {
            // Check if we have a saved wallet
            const savedKey = await AsyncStorage.getItem('wallet_private_key');

            if (savedKey) {
                return this.connectWithPrivateKey(savedKey);
            }

            // Create new random wallet for testing
            const wallet = ethers.Wallet.createRandom();
            this.privateKey = wallet.privateKey;

            // Save for future sessions
            await AsyncStorage.setItem('wallet_private_key', this.privateKey);

            // Connect to Flow EVM
            this.provider = new ethers.providers.JsonRpcProvider(
                FLOW_EVM_TESTNET.rpcUrl,
                {
                    chainId: FLOW_EVM_TESTNET.chainId,
                    name: FLOW_EVM_TESTNET.name
                }
            );

            this.signer = wallet.connect(this.provider);
            this.address = await this.signer.getAddress();

            console.log('Wallet connected:', this.address);
            console.log('⚠️ TEST WALLET - Private key saved in app storage');

            return this.address;
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    }

    async connectWithPrivateKey(privateKey) {
        try {
            const wallet = new ethers.Wallet(privateKey);
            this.privateKey = privateKey;

            // Connect to Flow EVM
            this.provider = new ethers.providers.JsonRpcProvider(
                FLOW_EVM_TESTNET.rpcUrl,
                {
                    chainId: FLOW_EVM_TESTNET.chainId,
                    name: FLOW_EVM_TESTNET.name
                }
            );

            this.signer = wallet.connect(this.provider);
            this.address = await this.signer.getAddress();

            // Save for future sessions
            await AsyncStorage.setItem('wallet_private_key', this.privateKey);

            console.log('Wallet connected:', this.address);
            return this.address;
        } catch (error) {
            console.error('Connect with private key failed:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            // Clear saved key
            await AsyncStorage.removeItem('wallet_private_key');

            this.provider = null;
            this.signer = null;
            this.address = null;
            this.privateKey = null;
        } catch (error) {
            console.error('Disconnect error:', error);
        }
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

    getPrivateKey() {
        return this.privateKey;
    }

    async getBalance() {
        if (!this.address || !this.provider) return '0';
        try {
            const balance = await this.provider.getBalance(this.address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Get balance error:', error);
            return '0';
        }
    }
}

export default new WalletService();
