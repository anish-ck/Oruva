const { ethers } = require('ethers');

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';
const VAULT_MANAGER = '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n🔍 Getting deployed contract bytecode\n');

    // Get the bytecode of the deployed contract
    const code = await provider.getCode(VAULT_MANAGER);

    console.log('Bytecode length:', code.length, 'characters');
    console.log('Bytecode (first 200 chars):', code.substring(0, 200));

    // Check if the bytecode contains function signatures we expect
    const buyOINRSig = ethers.utils.id('buyOINR(uint256)').substring(0, 10);
    const mintSig = ethers.utils.id('mint(address,uint256)').substring(0, 10);

    console.log('\n📊 Searching for function signatures in bytecode:');
    console.log('buyOINR(uint256):', buyOINRSig);
    console.log('Found in bytecode:', code.includes(buyOINRSig.substring(2)) ? '✅' : '❌');

    console.log('\nmint(address,uint256):', mintSig);
    console.log('Found in bytecode:', code.includes(mintSig.substring(2)) ? '✅' : '❌');

    // Try to call buyOINR with callStatic to see what happens
    console.log('\n🧪 Testing actual contract call...');

    const vaultManagerAbi = [
        'function buyOINR(uint256 oinrAmount) external'
    ];

    const vaultManager = new ethers.Contract(VAULT_MANAGER, vaultManagerAbi, provider);

    try {
        // Try with a test wallet that has USDC
        const testWallet = '0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1';
        const amount = ethers.utils.parseEther('100');

        await vaultManager.callStatic.buyOINR(amount, { from: testWallet });
        console.log('✅ Function exists and can be called');
    } catch (error) {
        console.log('❌ Error calling function:');
        console.log('   Message:', error.message.substring(0, 200));
        if (error.error && error.error.data) {
            console.log('   Error data:', error.error.data);
        }
        if (error.data) {
            console.log('   Data:', error.data.substring(0, 200));
        }
    }
}

main().catch(console.error);
