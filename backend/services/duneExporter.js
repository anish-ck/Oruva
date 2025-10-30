require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

/**
 * FREE TIER Alternative: Export data to JSON for manual upload to Dune
 * Works without table upload API (which requires paid plan)
 */

class DuneDataExporter {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.FLOW_RPC_URL);

        this.contracts = {
            vaultManager: process.env.VAULT_MANAGER_ADDRESS,
            vaultEngine: process.env.VAULT_ENGINE_ADDRESS,
            oinr: process.env.OINR_ADDRESS,
            usdc: process.env.USDC_ADDRESS,
        };

        this.exportDir = path.join(__dirname, '../dune-exports');
    }

    async ensureExportDir() {
        try {
            await fs.mkdir(this.exportDir, { recursive: true });
        } catch (error) {
            // Directory exists
        }
    }

    /**
     * Export data to CSV format for manual Dune upload
     */
    async exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            console.log(`⚠️  No data to export for ${filename}`);
            return;
        }

        // Convert to CSV
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    const value = row[h];
                    // Escape commas and quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const filepath = path.join(this.exportDir, filename);
        await fs.writeFile(filepath, csv);
        console.log(`✅ Exported ${data.length} rows to: ${filepath}`);
    }

    /**
     * Export data to JSON format
     */
    async exportToJSON(data, filename) {
        const filepath = path.join(this.exportDir, filename);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Exported ${data.length} rows to: ${filepath}`);
    }

    /**
     * Get current block number
     */
    async getCurrentBlock() {
        const block = await this.provider.getBlockNumber();
        return block;
    }

    /**
     * Query events in chunks to avoid RPC limit (10,000 blocks)
     */
    async queryEventsInChunks(contract, filter, fromBlock, toBlock, chunkSize = 9999) {
        const allEvents = [];
        let currentFrom = fromBlock;

        // If toBlock is 'latest', get actual block number
        const actualToBlock = toBlock === 'latest' ? await this.getCurrentBlock() : toBlock;

        while (currentFrom <= actualToBlock) {
            const currentTo = Math.min(currentFrom + chunkSize, actualToBlock);
            console.log(`  Fetching blocks ${currentFrom} to ${currentTo}...`);

            try {
                const events = await contract.queryFilter(filter, currentFrom, currentTo);
                allEvents.push(...events);
                console.log(`  Found ${events.length} events in this chunk`);
            } catch (error) {
                console.error(`  Error fetching blocks ${currentFrom}-${currentTo}:`, error.message);
            }

            currentFrom = currentTo + 1;
        }

        return allEvents;
    }

    /**
     * Index vault deposits
     */
    async indexVaultDeposits(fromBlock = 0, toBlock = 'latest') {
        console.log('📊 Indexing vault deposits...');

        const vaultManagerABI = [
            'event Deposited(address indexed user, uint256 amount)'
        ];

        const contract = new ethers.Contract(
            this.contracts.vaultManager,
            vaultManagerABI,
            this.provider
        );

        const filter = contract.filters.Deposited();
        const events = await this.queryEventsInChunks(contract, filter, fromBlock, toBlock);

        const deposits = await Promise.all(events.map(async (event) => {
            const block = await event.getBlock();
            return {
                block_number: event.blockNumber,
                block_time: new Date(block.timestamp * 1000).toISOString(),
                tx_hash: event.transactionHash,
                user_address: event.args.user.toLowerCase(),
                amount_usdc: ethers.utils.formatUnits(event.args.amount, 6),
                amount_usdc_raw: event.args.amount.toString(),
                event_type: 'deposit'
            };
        }));

        console.log(`Found ${deposits.length} deposits total`);
        return deposits;
    }

    /**
     * Index vault borrows
     */
    async indexVaultBorrows(fromBlock = 0, toBlock = 'latest') {
        console.log('📊 Indexing vault borrows...');

        const vaultManagerABI = [
            'event Borrowed(address indexed user, uint256 amount)'
        ];

        const contract = new ethers.Contract(
            this.contracts.vaultManager,
            vaultManagerABI,
            this.provider
        );

        const filter = contract.filters.Borrowed();
        const events = await this.queryEventsInChunks(contract, filter, fromBlock, toBlock);

        const borrows = await Promise.all(events.map(async (event) => {
            const block = await event.getBlock();
            return {
                block_number: event.blockNumber,
                block_time: new Date(block.timestamp * 1000).toISOString(),
                tx_hash: event.transactionHash,
                user_address: event.args.user.toLowerCase(),
                amount_oinr: ethers.utils.formatUnits(event.args.amount, 18),
                amount_oinr_raw: event.args.amount.toString(),
                event_type: 'borrow'
            };
        }));

        console.log(`Found ${borrows.length} borrows total`);
        return borrows;
    }

    /**
     * Index oINR transfers
     */
    async indexOINRTransfers(fromBlock = 0, toBlock = 'latest') {
        console.log('📊 Indexing oINR transfers...');

        const erc20ABI = [
            'event Transfer(address indexed from, address indexed to, uint256 value)'
        ];

        const contract = new ethers.Contract(
            this.contracts.oinr,
            erc20ABI,
            this.provider
        );

        const filter = contract.filters.Transfer();
        const events = await this.queryEventsInChunks(contract, filter, fromBlock, toBlock);

        const transfers = await Promise.all(events.map(async (event) => {
            const block = await event.getBlock();
            return {
                block_number: event.blockNumber,
                block_time: new Date(block.timestamp * 1000).toISOString(),
                tx_hash: event.transactionHash,
                from_address: event.args.from.toLowerCase(),
                to_address: event.args.to.toLowerCase(),
                amount_oinr: ethers.utils.formatUnits(event.args.value, 18),
                amount_oinr_raw: event.args.value.toString()
            };
        }));

        console.log(`Found ${transfers.length} transfers total`);
        return transfers;
    }

    /**
     * Run export job
     */
    async runExport(fromBlock = 0) {
        console.log('🚀 Starting data export for Dune...\n');

        try {
            await this.ensureExportDir();

            // Index and export deposits
            const deposits = await this.indexVaultDeposits(fromBlock);
            if (deposits.length > 0) {
                await this.exportToCSV(deposits, 'vault_deposits.csv');
                await this.exportToJSON(deposits, 'vault_deposits.json');
            }

            // Index and export borrows
            const borrows = await this.indexVaultBorrows(fromBlock);
            if (borrows.length > 0) {
                await this.exportToCSV(borrows, 'vault_borrows.csv');
                await this.exportToJSON(borrows, 'vault_borrows.json');
            }

            // Combine deposits and borrows for vault_transactions table
            const allTransactions = [...deposits, ...borrows];
            if (allTransactions.length > 0) {
                await this.exportToCSV(allTransactions, 'vault_transactions.csv');
            }

            // Index and export transfers
            const transfers = await this.indexOINRTransfers(fromBlock);
            if (transfers.length > 0) {
                await this.exportToCSV(transfers, 'oinr_transfers.csv');
                await this.exportToJSON(transfers, 'oinr_transfers.json');
            }

            console.log('\n✅ Export complete!');
            console.log(`📁 Files saved to: ${this.exportDir}`);
            console.log('\n📋 Next steps:');
            console.log('1. Go to https://dune.com/upload');
            console.log('2. Upload the CSV files manually');
            console.log('3. Tables will be available at: dune.oruva.[table_name]');
            console.log('4. Create queries using these tables');
            console.log('\nAlternatively, upgrade to Dune Plus for automated uploads.');

        } catch (error) {
            console.error('❌ Export failed:', error);
            throw error;
        }
    }
}

module.exports = DuneDataExporter;

// CLI usage
if (require.main === module) {
    const exporter = new DuneDataExporter();

    const args = process.argv.slice(2);
    const fromBlock = args[0] ? parseInt(args[0]) : 0;

    exporter.runExport(fromBlock)
        .then(() => {
            console.log('\n✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error:', error.message);
            process.exit(1);
        });
}
