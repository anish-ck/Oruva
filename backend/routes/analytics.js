const express = require('express');
const router = express.Router();
const duneService = require('../services/duneService');

/**
 * GET /api/analytics/protocol
 * Get overall protocol metrics
 */
router.get('/protocol', async (req, res) => {
    try {
        const metrics = await duneService.getProtocolMetrics();

        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching protocol metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch protocol metrics',
            message: error.message
        });
    }
});

/**
 * GET /api/analytics/user/:address
 * Get user-specific analytics
 */
router.get('/user/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!address || !address.startsWith('0x')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address'
            });
        }

        const analytics = await duneService.getUserAnalytics(address);

        res.json({
            success: true,
            address,
            data: analytics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user analytics',
            message: error.message
        });
    }
});

/**
 * GET /api/analytics/embed/:queryId/:visualizationId
 * Get embed URL for a visualization
 */
router.get('/embed/:queryId/:visualizationId', (req, res) => {
    try {
        const { queryId, visualizationId } = req.params;
        const parameters = req.query;

        const embedUrl = duneService.getEmbedUrl(
            parseInt(queryId),
            parseInt(visualizationId),
            parameters
        );

        res.json({
            success: true,
            embedUrl,
            iframeHtml: `<iframe src="${embedUrl}" height="500" width="100%" title="Oruva Analytics"></iframe>`
        });
    } catch (error) {
        console.error('Error generating embed URL:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate embed URL',
            message: error.message
        });
    }
});

/**
 * POST /api/analytics/execute/:queryId
 * Execute a specific query with parameters
 */
router.post('/execute/:queryId', async (req, res) => {
    try {
        const { queryId } = req.params;
        const parameters = req.body.parameters || {};

        const results = await duneService.executeAndWait(
            parseInt(queryId),
            parameters,
            60000 // 60 second timeout
        );

        res.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to execute query',
            message: error.message
        });
    }
});

/**
 * GET /api/analytics/latest/:queryId
 * Get latest cached results for a query
 */
router.get('/latest/:queryId', async (req, res) => {
    try {
        const { queryId } = req.params;

        const results = await duneService.getLatestResults(parseInt(queryId));

        res.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching latest results:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch latest results',
            message: error.message
        });
    }
});

module.exports = router;
