const { ethers } = require('ethers');

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';
const NEW_WALLET = '0x39B0775bbAeEDbb511813C0d59719Eb06Da0390e';
const VAULT_MANAGER = '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295';
const OINR = '0x5E6883b7b37A02381325234ECbf13f0729584aD0';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n🧪 Testing buyOINR function call\n');

    const vaultManagerAbi = [
        'function buyOINR(uint256 oinrAmount) external'
    ];

    const oinrAbi = [
        'function owner() view returns (address)',
        'function balanceOf(address) view returns (uint256)'
    ];

    const vaultManager = new ethers.Contract(VAULT_MANAGER, vaultManagerAbi, provider);
    const oinr = new ethers.Contract(OINR, oinrAbi, provider);

    // Check oINR ownership
    console.log('📊 Current State:');
    const owner = await oinr.owner();
    console.log('oINR Owner:', owner);
    console.log('VaultManager:', VAULT_MANAGER);
    console.log('Match:', owner.toLowerCase() === VAULT_MANAGER.toLowerCase() ? '✅' : '❌');

    const balance = await oinr.balanceOf(NEW_WALLET);
    console.log('\nNew Wallet oINR Balance:', ethers.utils.formatEther(balance));

    // Try to simulate a buyOINR call
    console.log('\n🔬 Testing buyOINR call simulation...');

    try {
        const amount = ethers.utils.parseEther('100'); // Try to buy 100 oINR

        // This won't actually execute, just simulate
        const result = await vaultManager.callStatic.buyOINR(amount, {
            from: NEW_WALLET,
            gasLimit: 500000
        });

        console.log('✅ Call would succeed');
        console.log('Result:', result);
    } catch (error) {
        console.log('❌ Call would fail');
        console.log('Error:', error.message);
        if (error.error && error.error.message) {
            console.log('Details:', error.error.message);
        }
    }
}

main().catch(err => {
    console.error('\n❌ Script error:', err.message);
});
