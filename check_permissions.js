const { ethers } = require('ethers');

const CONTRACTS = {
    vaultManager: '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295',
    vaultEngine: '0x9Bc8A5BF079dd86F7873C44c4D1FF9CC88dDE35e',
    oinr: '0x5E6883b7b37A02381325234ECbf13f0729584aD0',
};

const WALLET = '0xbF924328CB75d64cc4ac7439FBfFDb9BD67BaB1';

async function check() {
    const provider = new ethers.providers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    
    // Check oINR
    const oinrABI = ['function owner() view returns (address)', 'function balanceOf(address) view returns (uint256)'];
    const oinr = new ethers.Contract(CONTRACTS.oinr, oinrABI, provider);
    
    const owner = await oinr.owner();
    const balance = await oinr.balanceOf(WALLET);
    
    // Check VaultEngine
    const veABI = ['function vaults(address) view returns (uint256 collateral, uint256 debt)', 'function vaultManager() view returns (address)'];
    const ve = new ethers.Contract(CONTRACTS.vaultEngine, veABI, provider);
    
    const vault = await ve.vaults(WALLET);
    const manager = await ve.vaultManager();
    
    console.log('\n🔍 PERMISSION CHECK\n');
    console.log('=== oINR Contract ===');
    console.log('Owner:', owner);
    console.log('Expected:', CONTRACTS.vaultManager);
    console.log('Match:', owner.toLowerCase() === CONTRACTS.vaultManager.toLowerCase() ? '✅ YES' : '❌ NO');
    
    console.log('\n=== Your Wallet ===');
    console.log('Address:', WALLET);
    console.log('oINR Balance:', ethers.utils.formatEther(balance), 'oINR');
    
    console.log('\n=== Your Vault ===');
    console.log('Collateral:', ethers.utils.formatUnits(vault.collateral, 6), 'USDC');
    console.log('Debt:', ethers.utils.formatEther(vault.debt), 'oINR');
    
    console.log('\n=== VaultEngine ===');
    console.log('Manager:', manager);
    console.log('Expected:', CONTRACTS.vaultManager);
    console.log('Match:', manager.toLowerCase() === CONTRACTS.vaultManager.toLowerCase() ? '✅ YES' : '❌ NO');
    
    console.log('\n=== DIAGNOSIS ===');
    if (owner.toLowerCase() !== CONTRACTS.vaultManager.toLowerCase()) {
        console.log('❌ PROBLEM: oINR owner is NOT VaultManager!');
        console.log('   This means VaultManager cannot mint oINR tokens.');
        console.log('\n🔧 FIX: Run this command:');
        console.log('   forge script script/TransferOINROwnership.s.sol --rpc-url https://testnet.evm.nodes.onflow.org --broadcast --legacy');
    } else if (parseFloat(ethers.utils.formatEther(vault.debt)) > 0 && parseFloat(ethers.utils.formatEther(balance)) === 0) {
        console.log('❌ MISMATCH: You have debt but no oINR balance!');
        console.log('   Debt:', ethers.utils.formatEther(vault.debt), 'oINR');
        console.log('   Balance:', ethers.utils.formatEther(balance), 'oINR');
        console.log('\n   This confirms the permission issue - tokens were never minted!');
    } else {
        console.log('✅ All permissions look correct!');
    }
    console.log();
}

check().catch(console.error);
