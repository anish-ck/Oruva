/**
 * Yield Vault Service
 * Manages deposits to yield vaults and earning passive interest
 */

import { ethers } from 'ethers';
import contractAddresses from '../../../CONTRACT_ADDRESSES.json';

// YieldVault ABI (simplified)
const YIELD_VAULT_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function claimYield() external',
  'function calculateYield(address user) external view returns (uint256)',
  'function getUserInfo(address user) external view returns (uint256 depositAmount, uint256 depositTime, uint256 totalClaimed)',
  'function apy() external view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
  'event YieldClaimed(address indexed user, uint256 amount)'
];

class YieldService {
  constructor() {
    this.usdcVault = null;
    this.oinrVault = null;
    this.signer = null;
    this.userAddress = null;
  }

  /**
   * Initialize yield service with wallet
   */
  async initialize(signer, userAddress) {
    this.signer = signer;
    this.userAddress = userAddress;

    // Initialize vault contracts
    this.usdcVault = new ethers.Contract(
      contractAddresses.contracts.USDCYieldVault.address,
      YIELD_VAULT_ABI,
      signer
    );

    this.oinrVault = new ethers.Contract(
      contractAddresses.contracts.oINRYieldVault.address,
      YIELD_VAULT_ABI,
      signer
    );

    console.log('YieldService initialized');
    console.log('USDC Vault:', contractAddresses.contracts.USDCYieldVault.address);
    console.log('oINR Vault:', contractAddresses.contracts.oINRYieldVault.address);
  }

  /**
   * Get user's deposit info for a vault
   */
  async getUserInfo(vaultType) {
    const vault = vaultType === 'USDC' ? this.usdcVault : this.oinrVault;
    
    try {
      const [depositAmount, depositTime, totalClaimed] = await vault.getUserInfo(this.userAddress);
      const pendingYield = await vault.calculateYield(this.userAddress);
      
      return {
        depositAmount: ethers.utils.formatUnits(
          depositAmount,
          vaultType === 'USDC' ? 6 : 18
        ),
        depositTime: depositTime.toString(),
        totalClaimed: ethers.utils.formatUnits(
          totalClaimed,
          vaultType === 'USDC' ? 6 : 18
        ),
        pendingYield: ethers.utils.formatUnits(
          pendingYield,
          vaultType === 'USDC' ? 6 : 18
        )
      };
    } catch (error) {
      console.error(`Error getting ${vaultType} vault info:`, error);
      return {
        depositAmount: '0',
        depositTime: '0',
        totalClaimed: '0',
        pendingYield: '0'
      };
    }
  }

  /**
   * Deposit tokens to earn yield
   */
  async deposit(vaultType, amount) {
    const vault = vaultType === 'USDC' ? this.usdcVault : this.oinrVault;
    const decimals = vaultType === 'USDC' ? 6 : 18;
    const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);

    try {
      console.log(`Depositing ${amount} ${vaultType} to yield vault...`);
      const tx = await vault.deposit(amountWei);
      console.log('Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Deposit successful!');
      return receipt;
    } catch (error) {
      console.error('Deposit failed:', error);
      throw new Error(error.message || 'Failed to deposit to yield vault');
    }
  }

  /**
   * Withdraw tokens (auto-claims yield)
   */
  async withdraw(vaultType, amount) {
    const vault = vaultType === 'USDC' ? this.usdcVault : this.oinrVault;
    const decimals = vaultType === 'USDC' ? 6 : 18;
    const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);

    try {
      console.log(`Withdrawing ${amount} ${vaultType} from yield vault...`);
      const tx = await vault.withdraw(amountWei);
      console.log('Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Withdrawal successful!');
      return receipt;
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw new Error(error.message || 'Failed to withdraw from yield vault');
    }
  }

  /**
   * Claim earned yield without withdrawing principal
   */
  async claimYield(vaultType) {
    const vault = vaultType === 'USDC' ? this.usdcVault : this.oinrVault;

    try {
      console.log(`Claiming ${vaultType} yield...`);
      const tx = await vault.claimYield();
      console.log('Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Yield claimed successfully!');
      return receipt;
    } catch (error) {
      console.error('Claim yield failed:', error);
      throw new Error(error.message || 'Failed to claim yield');
    }
  }

  /**
   * Get APY for a vault
   */
  async getAPY(vaultType) {
    const vault = vaultType === 'USDC' ? this.usdcVault : this.oinrVault;
    
    try {
      const apyBps = await vault.apy();
      return apyBps.toNumber() / 100; // Convert basis points to percentage
    } catch (error) {
      console.error(`Error getting ${vaultType} APY:`, error);
      return 5.0; // Default 5%
    }
  }

  /**
   * Get all vault information for user
   */
  async getAllVaultInfo() {
    const [usdcInfo, oinrInfo, usdcAPY, oinrAPY] = await Promise.all([
      this.getUserInfo('USDC'),
      this.getUserInfo('oINR'),
      this.getAPY('USDC'),
      this.getAPY('oINR')
    ]);

    return {
      usdc: {
        ...usdcInfo,
        apy: usdcAPY
      },
      oinr: {
        ...oinrInfo,
        apy: oinrAPY
      }
    };
  }
}

export default new YieldService();
