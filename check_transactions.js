const { ethers } = require('ethers');

const FLOW_TESTNET_RPC = 'https://testnet.evm.nodes.onflow.org';
const NEW_WALLET = '0x39B0775bbAeEDbb511813C0d59719Eb06Da0390e';
const VAULT_MANAGER = '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295';
const USDC = '0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43';

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(FLOW_TESTNET_RPC);

    console.log('\n📋 Checking recent transactions for:', NEW_WALLET);
    console.log('================================================\n');

    try {
        // Get transaction count to determine last few transactions
        const txCount = await provider.getTransactionCount(NEW_WALLET);
        console.log('Total transactions sent:', txCount);

        // Get recent blocks to find transactions
        const currentBlock = await provider.getBlockNumber();
        console.log('Current block:', currentBlock);

        console.log('\n🔍 Searching recent transactions (last 50 blocks)...\n');

        let foundTxs = [];

        // Search last 50 blocks for transactions from this wallet
        for (let i = 0; i < 50; i++) {
            const blockNum = currentBlock - i;
            try {
                const block = await provider.getBlockWithTransactions(blockNum);
                if (block && block.transactions) {
                    for (const tx of block.transactions) {
                        if (tx.from && tx.from.toLowerCase() === NEW_WALLET.toLowerCase()) {
                            foundTxs.push(tx);
                        }
                    }
                }
            } catch (err) {
                // Skip blocks that error
            }
        }

        console.log(`Found ${foundTxs.length} transactions\n`);

        for (const tx of foundTxs.slice(0, 10)) {
            console.log('📤 Transaction:', tx.hash);
            console.log('   To:', tx.to);
            console.log('   Value:', ethers.utils.formatEther(tx.value), 'FLOW');

            // Check if it's to VaultManager or USDC
            if (tx.to && tx.to.toLowerCase() === VAULT_MANAGER.toLowerCase()) {
                console.log('   🎯 TO: VaultManager');

                // Try to decode function call
                try {
                    const iface = new ethers.utils.Interface([
                        'function buyOINR(uint256 oinrAmount)',
                        'function deposit(uint256 amount)',
                        'function borrow(uint256 amount)'
                    ]);
                    const decoded = iface.parseTransaction({ data: tx.data });
                    console.log('   Function:', decoded.name);
                    console.log('   Args:', decoded.args.map(a => a.toString()));
                } catch (err) {
                    console.log('   Data:', tx.data.substring(0, 10) + '...');
                }

                // Get receipt to check if it succeeded
                const receipt = await provider.getTransactionReceipt(tx.hash);
                if (receipt) {
                    console.log('   Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
                    console.log('   Gas used:', receipt.gasUsed.toString());

                    if (receipt.logs && receipt.logs.length > 0) {
                        console.log('   Events:', receipt.logs.length);
                    }
                }
            } else if (tx.to && tx.to.toLowerCase() === USDC.toLowerCase()) {
                console.log('   🪙 TO: USDC (approve/mint)');
            }

            console.log('');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main().catch(console.error);
