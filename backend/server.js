require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cashfreeRoutes = require('./routes/cashfree');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// For webhook signature verification, we need raw body
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Routes
app.use('/api', cashfreeRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Oruva Backend is running',
        environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Oruva Backend Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.CASHFREE_ENVIRONMENT || 'sandbox'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
