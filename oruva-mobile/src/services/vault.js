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
        if (!signer) {
            throw new Error('Wallet not connected');
        }

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

        try {
            const info = await this.vaultManager.getVaultInfo(address);

            // Handle undefined or zero values for new vaults
            const collateral = info.collateral ? parseFloat(ethers.utils.formatUnits(info.collateral, 6)).toFixed(2) : '0.00';
            const debt = info.debt ? parseFloat(ethers.utils.formatEther(info.debt)).toFixed(2) : '0.00';
            const collateralValueINR = info.collateralValueINR ? parseFloat(ethers.utils.formatEther(info.collateralValueINR)).toFixed(2) : '0.00';
            const ratio = info.ratio ? (info.ratio.toNumber() / 100).toFixed(2) : '0.00';

            return {
                collateral,
                debt,
                collateralValueINR,
                ratio,
                isHealthy: info.isHealthy || false,
            };
        } catch (error) {
            console.error('Get vault info error:', error);
            // Return default values if vault doesn't exist yet
            return {
                collateral: '0.00',
                debt: '0.00',
                collateralValueINR: '0.00',
                ratio: '0.00',
                isHealthy: true,
            };
        }
    }

    async getBalances(address) {
        if (!this.usdc) this.initialize();

        try {
            const usdcBalance = await this.usdc.balanceOf(address);
            const oinrBalance = await this.oinr.balanceOf(address);

            return {
                usdc: parseFloat(ethers.utils.formatUnits(usdcBalance, 6)).toFixed(2),
                oinr: parseFloat(ethers.utils.formatEther(oinrBalance)).toFixed(2),
            };
        } catch (error) {
            console.error('Get balances error:', error);
            throw error;
        }
    }

    async deposit(amountUSDC) {
        if (!this.vaultManager) this.initialize();

        try {
            const amount = ethers.utils.parseUnits(amountUSDC.toString(), 6);

            // Approve
            console.log('Approving USDC...');
            const approveTx = await this.usdc.approve(CONTRACTS.vaultManager, amount);
            await approveTx.wait();

            // Deposit
            console.log('Depositing...');
            const depositTx = await this.vaultManager.deposit(amount);
            return await depositTx.wait();
        } catch (error) {
            console.error('Deposit error:', error);
            throw error;
        }
    }

    async borrow(amountOINR) {
        if (!this.vaultManager) this.initialize();

        try {
            const amount = ethers.utils.parseEther(amountOINR.toString());
            const tx = await this.vaultManager.borrow(amount);
            return await tx.wait();
        } catch (error) {
            console.error('Borrow error:', error);
            throw error;
        }
    }

    async buyOINR(amountOINR) {
        if (!this.vaultManager) this.initialize();

        try {
            const amount = ethers.utils.parseEther(amountOINR.toString());

            // Calculate required USDC (83 INR per USDC)
            const requiredUSDC = ethers.utils.parseUnits(
                (parseFloat(amountOINR) / 83).toFixed(6),
                6
            );

            // Approve USDC
            console.log('Approving USDC for purchase...');
            const approveTx = await this.usdc.approve(CONTRACTS.vaultManager, requiredUSDC);
            await approveTx.wait();

            // Buy oINR
            console.log('Buying oINR...');
            const tx = await this.vaultManager.buyOINR(amount);
            return await tx.wait();
        } catch (error) {
            console.error('Buy oINR error:', error);
            throw error;
        }
    }

    async repay(amountOINR) {
        if (!this.vaultManager) this.initialize();

        try {
            const amount = ethers.utils.parseEther(amountOINR.toString());

            // Approve oINR
            console.log('Approving oINR...');
            const approveTx = await this.oinr.approve(CONTRACTS.vaultManager, amount);
            await approveTx.wait();

            // Repay
            console.log('Repaying debt...');
            const tx = await this.vaultManager.repay(amount);
            return await tx.wait();
        } catch (error) {
            console.error('Repay error:', error);
            throw error;
        }
    }

    async withdraw(amountUSDC) {
        if (!this.vaultManager) this.initialize();

        try {
            const amount = ethers.utils.parseUnits(amountUSDC.toString(), 6);
            const tx = await this.vaultManager.withdraw(amount);
            return await tx.wait();
        } catch (error) {
            console.error('Withdraw error:', error);
            throw error;
        }
    }

    async checkBorrowCapacity(address, borrowAmount) {
        if (!this.vaultManager) this.initialize();

        try {
            const amount = ethers.utils.parseEther(borrowAmount.toString());
            const result = await this.vaultManager.checkBorrowCapacity(address, amount);

            return {
                canBorrow: result.canBorrow,
                maxBorrowable: parseFloat(ethers.utils.formatEther(result.maxBorrowable)).toFixed(2),
            };
        } catch (error) {
            console.error('Check borrow capacity error:', error);
            throw error;
        }
    }

    // Mint test USDC (for testing only)
    async mintTestUSDC(amount) {
        if (!this.usdc) this.initialize();

        try {
            const address = walletService.getAddress();
            const parsedAmount = ethers.utils.parseUnits(amount.toString(), 6);
            const tx = await this.usdc.mint(address, parsedAmount);
            return await tx.wait();
        } catch (error) {
            console.error('Mint USDC error:', error);
            throw error;
        }
    }

    /**
     * Get the oINR contract instance for direct interactions
     * Used for peer-to-peer transfers via QR payments
     */
    getOINRContract() {
        if (!this.oinr) this.initialize();
        return this.oinr;
    }
}

export default new VaultService();
