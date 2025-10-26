const { ethers } = require('ethers');
require('dotenv').config();

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';
const NEW_WALLET = '0x39B0775bbAeEDbb511813C0d59719Eb06Da0390e';

const addresses = {
    vaultManager: '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295',
    oinr: '0x5E6883b7b37A02381325234ECbf13f0729584aD0',
    usdc: '0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43'
};

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n🧪 Deep dive into buyOINR transaction\n');
    console.log('Wallet:', NEW_WALLET);
    console.log('================================================\n');

    // Check USDC balance and allowance
    const usdcAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function decimals() view returns (uint8)'
    ];

    const usdc = new ethers.Contract(addresses.usdc, usdcAbi, provider);

    const usdcBalance = await usdc.balanceOf(NEW_WALLET);
    const usdcAllowance = await usdc.allowance(NEW_WALLET, addresses.vaultManager);

    console.log('📊 USDC Status:');
    console.log('Balance:', ethers.utils.formatUnits(usdcBalance, 6), 'USDC');
    console.log('Allowance to VaultManager:', ethers.utils.formatUnits(usdcAllowance, 6), 'USDC');

    // Try to buy 100 oINR
    const oinrAmount = ethers.utils.parseEther('100'); // 100 oINR
    const requiredUSDC = oinrAmount.div(83); // 100/83 = ~1.20 USDC (but in wei)
    const requiredUSDCFormatted = ethers.utils.parseUnits((100 / 83).toFixed(6), 6);

    console.log('\n📝 Buy 100 oINR calculation:');
    console.log('oINR amount:', ethers.utils.formatEther(oinrAmount), 'oINR');
    console.log('Required USDC (raw):', requiredUSDC.toString());
    console.log('Required USDC (formatted):', ethers.utils.formatUnits(requiredUSDCFormatted, 6), 'USDC');

    console.log('\n🔍 Checking if wallet can afford it:');
    console.log('Has enough USDC:', usdcBalance.gte(requiredUSDCFormatted) ? '✅' : '❌');
    console.log('Has enough allowance:', usdcAllowance.gte(requiredUSDCFormatted) ? '✅' : '❌');

    // Try to simulate the call
    console.log('\n🧪 Simulating buyOINR call...');

    const vaultManagerAbi = [
        'function buyOINR(uint256 oinrAmount) external'
    ];

    const vaultManager = new ethers.Contract(addresses.vaultManager, vaultManagerAbi, provider);

    try {
        await vaultManager.callStatic.buyOINR(oinrAmount, {
            from: NEW_WALLET,
            gasLimit: 500000
        });
        console.log('✅ Call would SUCCEED!');
    } catch (error) {
        console.log('❌ Call would FAIL');
        console.log('\nError message:', error.message.substring(0, 200));

        if (error.data) {
            console.log('\nError data:', error.data);

            // Decode the error
            try {
                const iface = new ethers.utils.Interface([
                    'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
                    'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)'
                ]);

                const decoded = iface.parseError(error.data);
                console.log('\n🔓 Decoded error:', decoded.name);
                console.log('Arguments:');
                decoded.args.forEach((arg, i) => {
                    console.log(`  [${i}]:`, arg.toString());
                });
            } catch (decodeErr) {
                console.log('Could not decode error');
            }
        }
    }
}

main().catch(console.error);
