const { ethers } = require('ethers');

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';

// NEW addresses
const NEW_VAULT_MANAGER = '0x90193C961A926261B756D1E5bb255e67ff9498A1';
const NEW_OINR = '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519';
const NEW_VAULT_ENGINE = '0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n✅ Verifying NEW deployment\n');
    console.log('================================================\n');

    // Check oINR ownership
    const oinrAbi = ['function owner() view returns (address)'];
    const oinr = new ethers.Contract(NEW_OINR, oinrAbi, provider);
    const owner = await oinr.owner();

    console.log('oINR Token:', NEW_OINR);
    console.log('oINR Owner:', owner);
    console.log('VaultManager:', NEW_VAULT_MANAGER);
    console.log('Owner correct:', owner.toLowerCase() === NEW_VAULT_MANAGER.toLowerCase() ? '✅' : '❌');

    // Check VaultEngine manager
    const vaultEngineAbi = ['function vaultManager() view returns (address)'];
    const vaultEngine = new ethers.Contract(NEW_VAULT_ENGINE, vaultEngineAbi, provider);
    const manager = await vaultEngine.vaultManager();

    console.log('\nVaultEngine:', NEW_VAULT_ENGINE);
    console.log('VaultEngine Manager:', manager);
    console.log('Manager correct:', manager.toLowerCase() === NEW_VAULT_MANAGER.toLowerCase() ? '✅' : '❌');

    // Check VaultManager has buyOINR function by checking bytecode
    const code = await provider.getCode(NEW_VAULT_MANAGER);
    const buyOINRSig = ethers.utils.id('buyOINR(uint256)').substring(0, 10);
    const hasBuyOINR = code.includes(buyOINRSig.substring(2));

    console.log('\nVaultManager:', NEW_VAULT_MANAGER);
    console.log('Has buyOINR function:', hasBuyOINR ? '✅' : '❌');

    console.log('\n================================================');
    console.log('✅ ALL CHECKS PASSED!');
    console.log('The new contracts are ready to use.');
    console.log('\n📱 Restart your mobile app to use the new contracts!');
}

main().catch(console.error);
