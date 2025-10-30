#!/usr/bin/env node
require('dotenv').config();
const ethers = require('ethers');

const VAULT_MANAGER = '0x5F1311808ED97661D5b31F4C67637D8952a54cc0';
const RPC_URL = process.env.FLOW_RPC_URL || 'https://testnet.evm.nodes.onflow.org';

async function findDeploymentBlock() {
    console.log('🔍 Finding exact deployment block for VaultManager...\n');

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const currentBlock = await provider.getBlockNumber();

    console.log(`Current block: ${currentBlock.toLocaleString()}`);

    // Binary search for deployment block
    let low = Math.max(0, currentBlock - 1000000); // Check last 1M blocks max
    let high = currentBlock;
    let deploymentBlock = currentBlock;

    console.log(`Searching between blocks ${low.toLocaleString()} - ${high.toLocaleString()}...\n`);

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        process.stdout.write(`\rChecking block ${mid.toLocaleString()}...`);

        try {
            const code = await provider.getCode(VAULT_MANAGER, mid);

            if (code === '0x' || code === '0x0') {
                // Contract doesn't exist yet at this block
                low = mid + 1;
            } else {
                // Contract exists, try earlier
                deploymentBlock = mid;
                high = mid - 1;
            }
        } catch (error) {
            console.error(`\nError at block ${mid}:`, error.message);
            break;
        }
    }

    console.log(`\n\n✅ Contract deployed at or before block: ${deploymentBlock.toLocaleString()}`);
    console.log(`\n🚀 Run indexer with:\n`);
    console.log(`   node services/duneIndexer.js ${deploymentBlock}\n`);

    // Calculate time saved
    const blocksSaved = deploymentBlock - 0;
    const blocksToScan = currentBlock - deploymentBlock;
    console.log(`📊 Statistics:`);
    console.log(`   - Blocks skipped: ${blocksSaved.toLocaleString()}`);
    console.log(`   - Blocks to scan: ${blocksToScan.toLocaleString()}`);
    console.log(`   - Time saved: ~${Math.floor(blocksSaved / blocksToScan)}x faster\n`);
}

findDeploymentBlock()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
