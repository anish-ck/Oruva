const { ethers } = require('ethers');
async function check() {
    const provider = new ethers.providers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    const oinrABI = ['function owner() view returns (address)'];
    const oinr = new ethers.Contract('0x5E6883b7b37A02381325234ECbf13f0729584aD0', oinrABI, provider);
    const owner = await oinr.owner();
    const expected = '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295';
    
    console.log('\n🔍 Quick oINR Ownership Check\n');
    console.log('oINR Owner:', owner);
    console.log('VaultManager:', expected);
    console.log('\nResult:', owner.toLowerCase() === expected.toLowerCase() ? '✅ CORRECT - VaultManager owns oINR' : '❌ WRONG - VaultManager does NOT own oINR!');
    
    if (owner.toLowerCase() !== expected.toLowerCase()) {
        console.log('\n❌ THIS IS THE PROBLEM!');
        console.log('VaultManager cannot mint oINR because it doesn\'t own the contract.');
        console.log('\n🔧 Run this to fix:');
        console.log('forge script script/TransferOINROwnership.s.sol --rpc-url https://testnet.evm.nodes.onflow.org --broadcast --legacy\n');
    }
}
check().catch(console.error);
