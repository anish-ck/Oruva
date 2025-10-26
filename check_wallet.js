const { ethers } = require('ethers');
const WALLET = '0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1';
const OINR = '0x5E6883b7b37A02381325234ECbf13f0729584aD0';
const VAULT_ENGINE = '0x9Bc8A5BF079dd86F7873C44c4D1FF9CC88dDE35e';

async function check() {
    const provider = new ethers.providers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');
    
    // Check oINR balance
    const oinrABI = ['function balanceOf(address) view returns (uint256)'];
    const oinr = new ethers.Contract(OINR, oinrABI, provider);
    const balance = await oinr.balanceOf(WALLET);
    
    // Check vault debt
    const veABI = ['function vaults(address) view returns (uint256 collateral, uint256 debt)'];
    const ve = new ethers.Contract(VAULT_ENGINE, veABI, provider);
    const vault = await ve.vaults(WALLET);
    
    console.log('\n🔍 Checking wallet:', WALLET);
    console.log('\n=== BLOCKCHAIN DATA ===');
    console.log('oINR Balance:', ethers.utils.formatEther(balance), 'oINR');
    console.log('Vault Debt:', ethers.utils.formatEther(vault.debt), 'oINR');
    console.log('Collateral:', ethers.utils.formatUnits(vault.collateral, 6), 'USDC');
    
    console.log('\n=== PROBLEM ===');
    if (parseFloat(ethers.utils.formatEther(vault.debt)) > 0 && parseFloat(ethers.utils.formatEther(balance)) === 0) {
        console.log('❌ You have', ethers.utils.formatEther(vault.debt), 'oINR debt');
        console.log('❌ But your oINR balance is', ethers.utils.formatEther(balance));
        console.log('\nThis means the borrow transactions FAILED to mint oINR!');
        console.log('The debt was recorded but tokens were never minted.');
        console.log('\n💡 This could happen if:');
        console.log('1. Transactions reverted but debt was still recorded (bug)');
        console.log('2. Gas ran out during minting');
        console.log('3. There was a permission issue at the time of borrowing');
    } else {
        console.log('✅ Balance matches expectations!');
    }
    console.log();
}
check().catch(console.error);
