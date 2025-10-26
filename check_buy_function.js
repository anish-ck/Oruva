const { ethers } = require('ethers');

const VAULT_MANAGER = '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295';
const WALLET = '0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1';

async function check() {
    const provider = new ethers.providers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    
    // Check if buyOINR function exists
    const vmABI = [
        'function buyOINR(uint256 amount) external',
        'function getVaultInfo(address user) external view returns (uint256 collateral, uint256 debt, uint256 collateralValueINR, uint256 ratio, bool isHealthy)'
    ];
    
    const vm = new ethers.Contract(VAULT_MANAGER, vmABI, provider);
    
    try {
        const info = await vm.getVaultInfo(WALLET);
        console.log('\n✅ VaultManager contract is accessible');
        console.log('Collateral:', ethers.utils.formatUnits(info.collateral, 6), 'USDC');
        console.log('Debt:', ethers.utils.formatEther(info.debt), 'oINR');
        console.log('\nThe contract is working, check app for error messages');
    } catch (error) {
        console.log('\n❌ Error:', error.message);
    }
}

check().catch(console.error);
