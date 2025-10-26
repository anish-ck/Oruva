const { ethers } = require('ethers');

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';
const OINR = '0x5E6883b7b37A02381325234ECbf13f0729584aD0';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n🔍 Checking oINR contract\n');

    // Get the bytecode
    const code = await provider.getCode(OINR);

    console.log('Bytecode length:', code.length, 'characters');

    // Check for function signatures
    const mintSig = ethers.utils.id('mint(address,uint256)').substring(0, 10);
    const burnSig = ethers.utils.id('burn(address,uint256)').substring(0, 10);
    const ownerSig = ethers.utils.id('owner()').substring(0, 10);

    console.log('\n📊 Function signatures:');
    console.log('mint(address,uint256):', mintSig);
    console.log('Found in bytecode:', code.includes(mintSig.substring(2)) ? '✅' : '❌');

    console.log('\nburn(address,uint256):', burnSig);
    console.log('Found in bytecode:', code.includes(burnSig.substring(2)) ? '✅' : '❌');

    console.log('\nowner():', ownerSig);
    console.log('Found in bytecode:', code.includes(ownerSig.substring(2)) ? '✅' : '❌');

    // Try to call the contract
    const oinrAbi = [
        'function owner() view returns (address)',
        'function mint(address to, uint256 amount) external',
        'function name() view returns (string)',
        'function symbol() view returns (string)'
    ];

    const oinr = new ethers.Contract(OINR, oinrAbi, provider);

    console.log('\n📖 Contract info:');
    const name = await oinr.name();
    const symbol = await oinr.symbol();
    const owner = await oinr.owner();

    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Owner:', owner);

    // Try to simulate a mint call FROM the VaultManager
    console.log('\n🧪 Testing mint() call simulation...');
    const vaultManager = '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295';
    const testAddress = '0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1';
    const amount = ethers.utils.parseEther('100');

    try {
        await oinr.callStatic.mint(testAddress, amount, { from: vaultManager });
        console.log('✅ Mint would succeed');
    } catch (error) {
        console.log('❌ Mint would fail');
        console.log('   Error:', error.message.substring(0, 300));
        if (error.data) {
            console.log('   Data:', error.data);
        }
    }
}

main().catch(console.error);
