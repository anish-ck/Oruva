require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');

/**
 * Dune Analytics Data Indexer for Oruva
 * Indexes Flow EVM contract data and uploads to Dune via Table Upload API
 */

class DuneIndexer {
    constructor() {
        this.duneApiKey = process.env.DUNE_API_KEY;
        this.duneApiUrl = 'https://api.dune.com/api/v1';
        this.provider = new ethers.providers.JsonRpcProvider(process.env.FLOW_RPC_URL);

        // Contract addresses
        this.contracts = {
            vaultManager: process.env.VAULT_MANAGER_ADDRESS,
            vaultEngine: process.env.VAULT_ENGINE_ADDRESS,
            oinr: process.env.OINR_TOKEN_ADDRESS,
            usdc: process.env.USDC_ADDRESS,
            usdcYieldVault: process.env.USDC_YIELD_VAULT_ADDRESS,
            oinrYieldVault: process.env.OINR_YIELD_VAULT_ADDRESS
        };

        // Dune table namespace (your username)
        this.namespace = process.env.DUNE_NAMESPACE || 'oruva';
    }

    /**
     * Create or update a table in Dune
     */
    async createTable(tableName, schema) {
        try {
            const response = await axios.post(
                `${this.duneApiUrl}/table/create`,
                {
                    namespace: this.namespace,
                    table_name: tableName,
                    schema: schema,
                    description: `Oruva ${tableName} data from Flow EVM Testnet`,
                    is_private: false
                },
                {
                    headers: {
                        'X-DUNE-API-KEY': this.duneApiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ Table created: ${tableName}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                console.log(`ℹ️  Table already exists: ${tableName}`);
            } else {
                console.error(`❌ Error creating table ${tableName}:`, error.response?.data || error.message);
            }
        }
    }

    /**
     * Upload data to Dune table
     * Dune requires newline-delimited JSON (NDJSON) format
     */
    async uploadData(tableName, data) {
        try {
            // Convert to NDJSON format (one JSON object per line)
            const ndjson = data.map(row => JSON.stringify(row)).join('\n');

            const response = await axios.post(
                `${this.duneApiUrl}/table/${this.namespace}/${tableName}/insert`,
                ndjson,
                {
                    headers: {
                        'X-DUNE-API-KEY': this.duneApiKey,
                        'Content-Type': 'application/x-ndjson'
                    }
                }
            );

            console.log(`✅ Uploaded ${data.length} rows to ${tableName}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error uploading to ${tableName}:`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Index vault deposits from VaultManager contract
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

        // Get actual toBlock number
        const latestBlock = toBlock === 'latest' ? await this.provider.getBlockNumber() : toBlock;

        // Flow EVM has 10k block limit, so chunk requests
        const CHUNK_SIZE = 9999;
        const allEvents = [];

        for (let start = fromBlock; start <= latestBlock; start += CHUNK_SIZE) {
            const end = Math.min(start + CHUNK_SIZE - 1, latestBlock);
            console.log(`  Scanning blocks ${start} to ${end}...`);

            const filter = contract.filters.Deposited();
            const events = await contract.queryFilter(filter, start, end);
            allEvents.push(...events);

            if (events.length > 0) {
                console.log(`  Found ${events.length} deposits`);
            }
        }

        const events = allEvents;

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

        console.log(`Found ${deposits.length} deposits`);
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

        // Get actual toBlock number
        const latestBlock = toBlock === 'latest' ? await this.provider.getBlockNumber() : toBlock;

        // Flow EVM has 10k block limit, so chunk requests
        const CHUNK_SIZE = 9999;
        const allEvents = [];

        for (let start = fromBlock; start <= latestBlock; start += CHUNK_SIZE) {
            const end = Math.min(start + CHUNK_SIZE - 1, latestBlock);
            console.log(`  Scanning blocks ${start} to ${end}...`);

            const filter = contract.filters.Borrowed();
            const events = await contract.queryFilter(filter, start, end);
            allEvents.push(...events);

            if (events.length > 0) {
                console.log(`  Found ${events.length} borrows`);
            }
        }

        const events = allEvents;

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

        console.log(`Found ${borrows.length} borrows`);
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

        // Get actual toBlock number
        const latestBlock = toBlock === 'latest' ? await this.provider.getBlockNumber() : toBlock;

        // Flow EVM has 10k block limit, so chunk requests
        const CHUNK_SIZE = 9999;
        const allEvents = [];

        for (let start = fromBlock; start <= latestBlock; start += CHUNK_SIZE) {
            const end = Math.min(start + CHUNK_SIZE - 1, latestBlock);
            console.log(`  Scanning blocks ${start} to ${end}...`);

            const filter = contract.filters.Transfer();
            const events = await contract.queryFilter(filter, start, end);
            allEvents.push(...events);

            if (events.length > 0) {
                console.log(`  Found ${events.length} transfers`);
            }
        }

        const events = allEvents;

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

        console.log(`Found ${transfers.length} transfers`);
        return transfers;
    }

    /**
     * Calculate protocol metrics
     */
    async calculateMetrics() {
        console.log('📊 Calculating protocol metrics...');

        const vaultManagerABI = [
            'function getVaultInfo(address user) external view returns (uint256 collateral, uint256 debt, uint256 collateralValueINR, uint256 collateralizationRatio, bool isHealthy)'
        ];

        const oinrABI = [
            'function totalSupply() external view returns (uint256)'
        ];

        const vaultManager = new ethers.Contract(
            this.contracts.vaultManager,
            vaultManagerABI,
            this.provider
        );

        const oinr = new ethers.Contract(
            this.contracts.oinr,
            oinrABI,
            this.provider
        );

        const totalSupply = await oinr.totalSupply();
        const block = await this.provider.getBlock('latest');

        return [{
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            block_number: block.number,
            total_oinr_supply: ethers.utils.formatUnits(totalSupply, 18),
            total_oinr_supply_raw: totalSupply.toString(),
            // Add more metrics as needed
        }];
    }

    /**
     * Initialize all tables
     */
    async initializeTables() {
        console.log('🚀 Initializing Dune tables...');

        // Vault Transactions Table
        await this.createTable('vault_transactions', [
            { name: 'block_number', type: 'bigint' },
            { name: 'block_time', type: 'timestamp' },
            { name: 'tx_hash', type: 'varchar' },
            { name: 'user_address', type: 'varchar' },
            { name: 'amount_usdc', type: 'double' },
            { name: 'amount_usdc_raw', type: 'varchar' },
            { name: 'amount_oinr', type: 'double' },
            { name: 'amount_oinr_raw', type: 'varchar' },
            { name: 'event_type', type: 'varchar' }
        ]);

        // oINR Transfers Table
        await this.createTable('oinr_transfers', [
            { name: 'block_number', type: 'bigint' },
            { name: 'block_time', type: 'timestamp' },
            { name: 'tx_hash', type: 'varchar' },
            { name: 'from_address', type: 'varchar' },
            { name: 'to_address', type: 'varchar' },
            { name: 'amount_oinr', type: 'double' },
            { name: 'amount_oinr_raw', type: 'varchar' }
        ]);

        // Protocol Metrics Table
        await this.createTable('protocol_metrics', [
            { name: 'timestamp', type: 'timestamp' },
            { name: 'block_number', type: 'bigint' },
            { name: 'total_oinr_supply', type: 'double' },
            { name: 'total_oinr_supply_raw', type: 'varchar' }
        ]);

        console.log('✅ All tables initialized');
    }

    /**
     * Run full indexing job
     */
    async runIndexing(fromBlock = 0) {
        console.log('🚀 Starting full indexing job...\n');

        try {
            // Initialize tables
            await this.initializeTables();

            // Index deposits
            const deposits = await this.indexVaultDeposits(fromBlock);
            if (deposits.length > 0) {
                await this.uploadData('vault_transactions',
                    deposits.map(d => ({ ...d, amount_oinr: null, amount_oinr_raw: null }))
                );
            }

            // Index borrows
            const borrows = await this.indexVaultBorrows(fromBlock);
            if (borrows.length > 0) {
                await this.uploadData('vault_transactions',
                    borrows.map(b => ({ ...b, amount_usdc: null, amount_usdc_raw: null }))
                );
            }

            // Index transfers
            const transfers = await this.indexOINRTransfers(fromBlock);
            if (transfers.length > 0) {
                await this.uploadData('oinr_transfers', transfers);
            }

            // Calculate and upload metrics
            const metrics = await this.calculateMetrics();
            await this.uploadData('protocol_metrics', metrics);

            console.log('\n✅ Indexing complete!');
        } catch (error) {
            console.error('❌ Indexing failed:', error);
            throw error;
        }
    }
}

module.exports = DuneIndexer;

// CLI usage
if (require.main === module) {
    const indexer = new DuneIndexer();

    const args = process.argv.slice(2);
    const fromBlock = args[0] ? parseInt(args[0]) : 0;

    indexer.runIndexing(fromBlock)
        .then(() => {
            console.log('✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}
