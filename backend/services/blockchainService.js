const { ethers } = require('ethers');

// VaultManager ABI - only the functions we need
const VAULT_MANAGER_ABI = [
    "function buyOINR(uint256 amount) external",
    "function rescueMintOINR(address to, uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function owner() external view returns (address)"
];

// MockUSDC ABI - for approving USDC spending
const USDC_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function mint(address to, uint256 amount) external"
];

// oINR ABI - for minting directly
const OINR_ABI = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)",
    "function owner() external view returns (address)"
];

/**
 * Initialize blockchain provider and contracts
 */
function initializeProvider() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const vaultManager = new ethers.Contract(
        process.env.VAULT_MANAGER_ADDRESS,
        VAULT_MANAGER_ABI,
        wallet
    );

    const usdc = new ethers.Contract(
        process.env.MOCK_USDC_ADDRESS,
        USDC_ABI,
        wallet
    );

    const oinr = new ethers.Contract(
        process.env.OINR_ADDRESS,
        OINR_ABI,
        wallet
    );

    return { provider, wallet, vaultManager, usdc, oinr };
}

/**
 * Mint oINR to user's wallet after successful payment
 * @param {string} userAddress - User's wallet address
 * @param {number} amountInINR - Amount in INR (will be converted to oINR 1:1)
 * @returns {Promise<Object>} - Transaction details
 */
async function mintOINR(userAddress, amountInINR) {
    try {
        const { wallet, vaultManager, oinr } = initializeProvider();

        // Convert INR amount to wei (18 decimals)
        const amountInWei = ethers.utils.parseEther(amountInINR.toString());

        console.log(`💰 Minting ${amountInINR} oINR to ${userAddress}`);
        console.log(`   Amount in wei: ${amountInWei.toString()}`);
        console.log(`   Using VaultManager.rescueMintOINR()`);

        // Use VaultManager's rescueMintOINR function
        // This requires backend wallet to be the owner of VaultManager
        const tx = await vaultManager.rescueMintOINR(userAddress, amountInWei);
        console.log(`   Transaction submitted: ${tx.hash}`);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`);

        // Get updated balance
        const newBalance = await oinr.balanceOf(userAddress);

        return {
            success: true,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
            amountMinted: amountInINR,
            newBalance: ethers.utils.formatEther(newBalance),
            recipient: userAddress
        };
    } catch (error) {
        console.error('Error minting oINR:', error);
        throw new Error(`Failed to mint oINR: ${error.message}`);
    }
}

/**
 * Get oINR balance for an address
 * @param {string} address - Wallet address
 * @returns {Promise<string>} - Balance in oINR
 */
async function getOINRBalance(address) {
    try {
        const { oinr } = initializeProvider();
        const balance = await oinr.balanceOf(address);
        return ethers.utils.formatEther(balance);
    } catch (error) {
        console.error('Error getting oINR balance:', error);
        throw new Error('Failed to get balance');
    }
}

/**
 * Verify that the backend wallet can mint oINR
 * @returns {Promise<boolean>} - Whether minting is authorized
 */
async function verifyMintingPermission() {
    try {
        const { wallet, vaultManager } = initializeProvider();
        const vmOwner = await vaultManager.owner();
        const walletAddress = await wallet.getAddress();

        console.log('Backend wallet:', walletAddress);
        console.log('VaultManager owner:', vmOwner);

        if (vmOwner.toLowerCase() !== walletAddress.toLowerCase()) {
            console.warn('⚠️ WARNING: Backend wallet is not the VaultManager owner!');
            console.warn('   Minting will fail unless backend wallet owns VaultManager');
            return false;
        }

        console.log('✅ Backend wallet is VaultManager owner - can mint via rescueMintOINR()');
        return true;
    } catch (error) {
        console.error('Error verifying minting permission:', error);
        return false;
    }
}

module.exports = {
    mintOINR,
    getOINRBalance,
    verifyMintingPermission
};
