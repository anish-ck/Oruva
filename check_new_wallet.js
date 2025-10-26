const { ethers } = require('ethers');
require('dotenv').config();

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';

const NEW_WALLET = '0x39B0775bbAeEDbb511813C0d59719Eb06Da0390e';

const addresses = {
    vaultManager: '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295',
    oinr: '0x5E6883b7b37A02381325234ECbf13f0729584aD0',
    vaultEngine: '0x9Bc8A5BF079dd86F7873C44c4D1FF9CC88dDE35e',
    usdc: '0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43'
};

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    // oINR ABI
    const oinrAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function owner() view returns (address)'
    ];

    // VaultEngine ABI
    const vaultEngineAbi = [
        'function vaults(address) view returns (uint256 collateral, uint256 debt)',
        'function vaultManager() view returns (address)'
    ];

    const oinrContract = new ethers.Contract(addresses.oinr, oinrAbi, provider);
    const vaultEngineContract = new ethers.Contract(addresses.vaultEngine, vaultEngineAbi, provider);

    console.log('\n🔍 Checking NEW wallet:', NEW_WALLET);
    console.log('================================================\n');

    // Check oINR balance
    const balance = await oinrContract.balanceOf(NEW_WALLET);
    console.log('oINR Balance:', ethers.utils.formatEther(balance), 'oINR');

    // Check vault debt
    const vault = await vaultEngineContract.vaults(NEW_WALLET);
    console.log('Vault Collateral:', ethers.utils.formatUnits(vault.collateral, 6), 'USDC');
    console.log('Vault Debt:', ethers.utils.formatEther(vault.debt), 'oINR');

    console.log('\n📊 Permissions Check:');
    console.log('================================================\n');

    // Check oINR owner
    const oinrOwner = await oinrContract.owner();
    console.log('oINR Owner:', oinrOwner);
    console.log('VaultManager:', addresses.vaultManager);
    console.log('Match:', oinrOwner.toLowerCase() === addresses.vaultManager.toLowerCase() ? '✅' : '❌');

    // Check VaultEngine manager
    const vaultManager = await vaultEngineContract.vaultManager();
    console.log('\nVaultEngine Manager:', vaultManager);
    console.log('Expected:', addresses.vaultManager);
    console.log('Match:', vaultManager.toLowerCase() === addresses.vaultManager.toLowerCase() ? '✅' : '❌');

    console.log('\n💡 Analysis:');
    console.log('================================================\n');

    if (vault.debt.gt(0) && balance.eq(0)) {
        console.log('❌ CRITICAL: Wallet has', ethers.utils.formatEther(vault.debt), 'oINR debt but 0 balance!');
        console.log('   This means buyOINR() is NOT minting tokens properly.');
    } else if (balance.gt(0)) {
        console.log('✅ Balance looks correct!');
    } else {
        console.log('ℹ️  No debt or balance yet.');
    }
}

main().catch(console.error);
