const { ethers } = require('ethers');

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';
const TX_HASH = '0xb906aa7052cb9fd90011aaf021abc485ce10d44806492619b6f5bdd188a0aeec';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n🔍 Analyzing buyOINR transaction\n');
    console.log('TX:', TX_HASH);
    console.log('================================================\n');

    const receipt = await provider.getTransactionReceipt(TX_HASH);
    
    console.log('Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('\n📜 Events (logs):', receipt.logs.length, 'total');
    
    receipt.logs.forEach((log, i) => {
        console.log(`\nLog ${i}: ${log.address}`);
        
        // Try to decode Transfer event
        if (log.topics[0] === ethers.utils.id('Transfer(address,address,uint256)')) {
            const from = '0x' + log.topics[1].substring(26);
            const to = '0x' + log.topics[2].substring(26);
            const value = ethers.BigNumber.from(log.data);
            
            console.log('  🔄 Transfer Event:');
            console.log('     From:', from);
            console.log('     To:', to);
            
            if (log.address.toLowerCase() === '0x5fda84f0d0985e346ff0fe13dfd7760a9ff1ed43') {
                console.log('     Token: USDC');
                console.log('     Amount:', ethers.utils.formatUnits(value, 6), 'USDC');
            } else if (log.address.toLowerCase() === '0x5e6883b7b37a02381325234ecbf13f0729584ad0') {
                console.log('     Token: oINR');
                console.log('     Amount:', ethers.utils.formatEther(value), 'oINR');
            }
        }
    });
    
    const oinrAddr = '0x5e6883b7b37a02381325234ecbf13f0729584ad0';
    const oinrTransfers = receipt.logs.filter(log => log.address.toLowerCase() === oinrAddr.toLowerCase());
    
    console.log('\n\n🔍 RESULT:');
    console.log('oINR Transfer events:', oinrTransfers.length);
    
    if (oinrTransfers.length === 0) {
        console.log('\n❌ BUG CONFIRMED: buyOINR succeeded but did NOT mint oINR!');
        console.log('   The deployed contract is broken.');
        console.log('   SOLUTION: Redeploy VaultManager.');
    }
}

main().catch(console.error);
