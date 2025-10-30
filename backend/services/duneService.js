require('dotenv').config();
const axios = require('axios');

/**
 * Dune Analytics API Service for Oruva
 * Fetch analytics data from Dune dashboards and queries
 */

class DuneService {
    constructor() {
        this.apiKey = process.env.DUNE_API_KEY;
        this.baseUrl = 'https://api.dune.com/api/v1';
    }

    /**
     * Execute a Dune query
     * @param {number} queryId - The Dune query ID
     * @param {object} parameters - Query parameters (optional)
     */
    async executeQuery(queryId, parameters = {}) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/query/${queryId}/execute`,
                {
                    query_parameters: parameters
                },
                {
                    headers: {
                        'X-DUNE-API-KEY': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ Query ${queryId} executed. Execution ID: ${response.data.execution_id}`);
            return response.data.execution_id;
        } catch (error) {
            console.error('Error executing query:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get execution status
     * @param {string} executionId - The execution ID
     */
    async getExecutionStatus(executionId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/execution/${executionId}/status`,
                {
                    headers: {
                        'X-DUNE-API-KEY': this.apiKey
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting execution status:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get query results
     * @param {string} executionId - The execution ID
     */
    async getExecutionResults(executionId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/execution/${executionId}/results`,
                {
                    headers: {
                        'X-DUNE-API-KEY': this.apiKey
                    }
                }
            );

            return response.data.result.rows;
        } catch (error) {
            console.error('Error getting results:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get latest query results (without execution)
     * @param {number} queryId - The Dune query ID
     */
    async getLatestResults(queryId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/query/${queryId}/results`,
                {
                    headers: {
                        'X-DUNE-API-KEY': this.apiKey
                    }
                }
            );

            return response.data.result.rows;
        } catch (error) {
            console.error('Error getting latest results:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Execute query and wait for results
     * @param {number} queryId - The Dune query ID
     * @param {object} parameters - Query parameters (optional)
     * @param {number} maxWaitTime - Max wait time in ms (default: 60000)
     */
    async executeAndWait(queryId, parameters = {}, maxWaitTime = 60000) {
        const executionId = await this.executeQuery(queryId, parameters);

        const startTime = Date.now();
        const pollInterval = 2000; // Poll every 2 seconds

        while (Date.now() - startTime < maxWaitTime) {
            const status = await this.getExecutionStatus(executionId);

            if (status.state === 'QUERY_STATE_COMPLETED') {
                console.log(`✅ Query completed in ${(Date.now() - startTime) / 1000}s`);
                return await this.getExecutionResults(executionId);
            } else if (status.state === 'QUERY_STATE_FAILED') {
                throw new Error(`Query failed: ${status.error}`);
            }

            console.log(`⏳ Query status: ${status.state}, waiting...`);
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Query execution timeout');
    }

    /**
     * Get Oruva protocol metrics
     * Uses pre-created Dune queries for Oruva analytics
     */
    async getProtocolMetrics() {
        // Example query IDs (replace with your actual Dune query IDs)
        const queries = {
            tvl: process.env.DUNE_QUERY_TVL,
            activeUsers: process.env.DUNE_QUERY_ACTIVE_USERS,
            dailyVolume: process.env.DUNE_QUERY_DAILY_VOLUME
        };

        try {
            const results = {};

            if (queries.tvl) {
                results.tvl = await this.getLatestResults(queries.tvl);
            }

            if (queries.activeUsers) {
                results.activeUsers = await this.getLatestResults(queries.activeUsers);
            }

            if (queries.dailyVolume) {
                results.dailyVolume = await this.getLatestResults(queries.dailyVolume);
            }

            return results;
        } catch (error) {
            console.error('Error fetching protocol metrics:', error);
            throw error;
        }
    }

    /**
     * Get user-specific analytics
     * @param {string} userAddress - User wallet address
     */
    async getUserAnalytics(userAddress) {
        const queryId = process.env.DUNE_QUERY_USER_ANALYTICS;

        if (!queryId) {
            throw new Error('User analytics query not configured');
        }

        return await this.executeAndWait(queryId, {
            user_address: userAddress.toLowerCase()
        });
    }

    /**
     * Generate embed URL for a Dune visualization
     * @param {number} queryId - The query ID
     * @param {number} visualizationId - The visualization ID
     * @param {object} parameters - Query parameters
     */
    getEmbedUrl(queryId, visualizationId, parameters = {}) {
        let url = `https://dune.com/embeds/${queryId}/${visualizationId}`;

        if (Object.keys(parameters).length > 0) {
            const params = new URLSearchParams(parameters).toString();
            url += `?${params}`;
        }

        return url;
    }
}

module.exports = new DuneService();
