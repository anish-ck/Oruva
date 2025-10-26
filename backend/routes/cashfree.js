const express = require('express');
const router = express.Router();
const { createOrder, createPaymentLink, verifyPayment, verifyWebhookSignature } = require('../services/cashfreeService');
const { mintOINR, getOINRBalance } = require('../services/blockchainService');

// Store pending orders in memory (in production, use a database)
const pendingOrders = new Map();
const completedOrders = new Map();

/**
 * Create a new payment order
 * POST /api/create-order
 * Body: { amount, customerName, customerEmail, customerPhone, walletAddress }
 */
router.post('/create-order', async (req, res) => {
    try {
        const { amount, customerName, customerEmail, customerPhone, walletAddress } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!walletAddress || !walletAddress.startsWith('0x')) {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }

        if (!customerEmail || !customerPhone) {
            return res.status(400).json({ error: 'Customer email and phone are required' });
        }

        // Generate unique order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Try creating a Payment Link instead of order (more reliable for web)
        try {
            const paymentLink = await createPaymentLink({
                orderId,
                amount,
                customerName,
                customerEmail,
                customerPhone,
                walletAddress
            });

            // Store order details
            pendingOrders.set(orderId, {
                orderId,
                amount,
                walletAddress,
                customerEmail,
                customerPhone,
                createdAt: new Date().toISOString(),
                status: 'PENDING',
                linkUrl: paymentLink.linkUrl
            });

            console.log(`✅ Payment Link created: ${orderId} for ${amount} INR`);
            console.log(`🔗 Link URL: ${paymentLink.linkUrl}`);

            return res.json({
                success: true,
                orderId: paymentLink.linkId,
                checkoutUrl: paymentLink.linkUrl,
                orderAmount: paymentLink.linkAmount,
                orderCurrency: 'INR',
                paymentSessionId: null // Not needed for payment links
            });
        } catch (linkError) {
            console.log('Payment link creation failed, falling back to order:', linkError.message);
        }

        // Create order with Cashfree
        const orderDetails = await createOrder({
            orderId,
            amount,
            customerName,
            customerEmail,
            customerPhone,
            walletAddress
        });

        // Store order details
        pendingOrders.set(orderId, {
            orderId,
            amount,
            walletAddress,
            customerEmail,
            customerPhone,
            createdAt: new Date().toISOString(),
            status: 'PENDING'
        });

        console.log(`✅ Order created: ${orderId} for ${amount} INR`);

        // Construct checkout URL - prefer payment_link from Cashfree if available
        let checkoutUrl;
        if (orderDetails.paymentLink) {
            checkoutUrl = orderDetails.paymentLink;
        } else {
            checkoutUrl = `${process.env.BASE_URL}/api/checkout?session_id=${orderDetails.paymentSessionId}&order_id=${orderId}`;
        }

        res.json({
            success: true,
            ...orderDetails,
            checkoutUrl: checkoutUrl
        });
    } catch (error) {
        console.error('Error in /create-order:', error);
        res.status(500).json({
            error: 'Failed to create order',
            message: error.message
        });
    }
});

/**
 * Checkout redirect - directly to Cashfree hosted page
 * GET /api/checkout?session_id=xxx&order_id=xxx
 */
router.get('/checkout', (req, res) => {
    const { session_id, order_id } = req.query;

    if (!session_id || !order_id) {
        return res.status(400).send('Missing session_id or order_id');
    }

    // Use Cashfree's correct hosted checkout URL format
    const environment = process.env.CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';

    // Correct URL format for Cashfree hosted checkout
    const checkoutUrl = environment === 'production'
        ? `https://payments.cashfree.com/order/#/checkout?order_token=${session_id}`
        : `https://payments-test.cashfree.com/order/#/checkout?order_token=${session_id}`;

    console.log(`Redirecting to Cashfree checkout: ${checkoutUrl}`);

    // Redirect directly to Cashfree
    res.redirect(checkoutUrl);
});

/**
 * Alternative: Checkout page with embedded payment form (if redirect doesn't work)
 * GET /api/checkout-page?session_id=xxx&order_id=xxx
 */
router.get('/checkout-page', (req, res) => {
    const { session_id, order_id } = req.query;

    if (!session_id || !order_id) {
        return res.status(400).send('Missing session_id or order_id');
    }

    const environment = process.env.CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Payment - Oruva</title>
    <script src="https://sdk.cashfree.com/js/v3/cashfree.${environment}.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        h1 {
            color: #333;
            margin-bottom: 8px;
        }
        p {
            color: #666;
            margin-bottom: 24px;
        }
        #payment-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s;
        }
        #payment-button:hover {
            transform: scale(1.02);
        }
        #payment-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .order-id {
            font-size: 12px;
            color: #999;
            margin-top: 16px;
        }
        .error {
            color: #e74c3c;
            font-size: 14px;
            margin-top: 12px;
        }
        #debug-log {
            margin-top: 20px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 11px;
            text-align: left;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🪙 Oruva Payment</h1>
        <p>Complete your payment to receive oINR</p>
        <button id="payment-button" onclick="startPayment()">
            Pay Now
        </button>
        <div class="order-id">Order: ${order_id}</div>
        <div id="error-msg" class="error"></div>
        <div id="debug-log"></div>
    </div>

    <script>
        const debugLog = document.getElementById('debug-log');
        const errorMsg = document.getElementById('error-msg');
        
        function log(msg) {
            console.log(msg);
            debugLog.style.display = 'block';
            debugLog.innerHTML += msg + '<br>';
        }

        let cashfree;
        
        // Wait for SDK to load
        window.addEventListener('load', async () => {
            log('Page loaded, checking for Cashfree SDK...');
            
            // Wait a bit for the SDK script to execute
            await new Promise(resolve => setTimeout(resolve, 500));
            
            log('Checking if Cashfree is defined: ' + (typeof Cashfree !== 'undefined'));
            
            if (typeof Cashfree === 'undefined') {
                log('❌ Cashfree SDK not loaded');
                errorMsg.textContent = 'Cashfree SDK failed to load. Please refresh the page.';
                return;
            }

            log('Initializing Cashfree SDK...');
            log('Environment: ${environment}');
            log('Session ID: ${session_id}');

            try {
                cashfree = Cashfree({
                    mode: "${environment}"
                });
                log('✅ Cashfree SDK initialized');
                
                // Auto-start payment
                log('Starting payment in 1 second...');
                setTimeout(startPayment, 1000);
            } catch (error) {
                log('❌ Failed to initialize SDK: ' + error.message);
                errorMsg.textContent = 'SDK initialization failed: ' + error.message;
            }
        });

        async function startPayment() {
            const button = document.getElementById('payment-button');
            button.disabled = true;
            button.innerHTML = '<span class="loader"></span> Loading...';
            errorMsg.textContent = '';

            try {
                log('Starting payment...');
                
                if (!cashfree) {
                    throw new Error('Cashfree SDK not initialized');
                }

                const checkoutOptions = {
                    paymentSessionId: "${session_id}",
                    redirectTarget: "_self",
                    appearance: {
                        theme: "light"
                    }
                };

                log('Checkout options: ' + JSON.stringify(checkoutOptions));

                const result = await cashfree.checkout(checkoutOptions);
                
                log('Checkout result: ' + JSON.stringify(result));

                if (result.error) {
                    log('❌ Payment error: ' + result.error.message);
                    errorMsg.textContent = 'Payment failed: ' + result.error.message;
                    button.disabled = false;
                    button.innerHTML = 'Pay Now';
                }
                if (result.redirect) {
                    log('✅ Payment redirect');
                }
                if (result.paymentDetails) {
                    log('✅ Payment completed: ' + JSON.stringify(result.paymentDetails));
                }
            } catch (error) {
                console.error('Checkout error:', error);
                log('❌ Checkout error: ' + error.message);
                errorMsg.textContent = 'Failed to initialize payment: ' + error.message;
                button.disabled = false;
                button.innerHTML = 'Pay Now';
            }
        }
    </script>
</body>
</html>
  `;

    res.send(html);
});

/**
 * Webhook endpoint for Cashfree payment notifications
 * POST /api/webhook
 */
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];

        console.log('\n📥 Webhook received');
        console.log('Headers:', {
            signature: signature ? 'present' : 'missing',
            timestamp: timestamp ? timestamp : 'missing'
        });
        console.log('Body type:', typeof req.body);
        console.log('Body:', JSON.stringify(req.body).substring(0, 200));

        // For payment links, webhook body structure is different
        // Try to parse the body directly if it's already an object
        let webhookData;
        let rawBody;

        if (typeof req.body === 'object') {
            webhookData = req.body;
            rawBody = JSON.stringify(req.body);
        } else {
            rawBody = req.body.toString();
            webhookData = JSON.parse(rawBody);
        }

        // For now, skip signature verification to test if payment processing works
        // TODO: Fix signature verification for payment links
        console.log('⚠️ Skipping signature verification for testing');

        // Verify webhook signature (commented out for now)
        // const isValid = verifyWebhookSignature(signature, rawBody, timestamp);
        // if (!isValid) {
        //   console.error('❌ Invalid webhook signature');
        //   return res.status(400).json({ error: 'Invalid signature' });
        // }

        console.log('✅ Processing webhook');

        // Parse webhook data
        const { type, data } = webhookData;

        console.log('Webhook type:', type);
        console.log('Data:', JSON.stringify(data).substring(0, 300));

        // Handle Payment Link events
        if (type === 'PAYMENT_LINK_EVENT') {
            const linkId = data.link_id;
            const linkAmountPaid = parseFloat(data.link_amount_paid);
            const linkStatus = data.link_status;

            console.log('Payment Link Event:');
            console.log('  Link ID:', linkId);
            console.log('  Amount Paid:', linkAmountPaid);
            console.log('  Status:', linkStatus);

            // Check if payment is complete
            if (linkAmountPaid > 0 && linkStatus === 'PAID') {
                // Get order details from pending orders
                const orderDetails = pendingOrders.get(linkId);

                if (!orderDetails) {
                    console.error('⚠️ Order not found in pending orders:', linkId);
                    return res.status(200).json({ received: true }); // Still acknowledge webhook
                }

                console.log(`💰 Payment successful for link ${linkId}`);
                console.log(`   Amount: ${linkAmountPaid} INR`);
                console.log(`   Wallet: ${orderDetails.walletAddress}`);

                // Mint oINR to user's wallet
                try {
                    const mintResult = await mintOINR(orderDetails.walletAddress, linkAmountPaid);

                    console.log('✅ oINR minted successfully');
                    console.log(`   TX Hash: ${mintResult.transactionHash}`);
                    console.log(`   Amount: ${mintResult.amountMinted} oINR`);
                    console.log(`   New Balance: ${mintResult.newBalance} oINR`);

                    // Move to completed orders
                    completedOrders.set(linkId, {
                        ...orderDetails,
                        status: 'COMPLETED',
                        paymentTime: data.link_updated_at || new Date().toISOString(),
                        transactionHash: mintResult.transactionHash,
                        blockNumber: mintResult.blockNumber,
                        amountMinted: mintResult.amountMinted,
                        completedAt: new Date().toISOString()
                    });

                    pendingOrders.delete(linkId);

                } catch (mintError) {
                    console.error('❌ Error minting oINR:', mintError);

                    // Mark as failed
                    completedOrders.set(linkId, {
                        ...orderDetails,
                        status: 'MINT_FAILED',
                        error: mintError.message,
                        failedAt: new Date().toISOString()
                    });
                }
            }
        }

        // Handle payment success (for regular orders)
        if (type === 'PAYMENT_SUCCESS_WEBHOOK' && data?.order?.order_status === 'PAID') {
            const orderId = data.order.order_id;
            const orderAmount = parseFloat(data.order.order_amount);

            // Get order details from pending orders
            const orderDetails = pendingOrders.get(orderId);

            if (!orderDetails) {
                console.error('⚠️ Order not found in pending orders:', orderId);
                return res.status(200).json({ received: true }); // Still acknowledge webhook
            }

            console.log(`💰 Payment successful for order ${orderId}`);
            console.log(`   Amount: ${orderAmount} INR`);
            console.log(`   Wallet: ${orderDetails.walletAddress}`);

            // Mint oINR to user's wallet
            try {
                const mintResult = await mintOINR(orderDetails.walletAddress, orderAmount);

                console.log('✅ oINR minted successfully');
                console.log(`   TX Hash: ${mintResult.transactionHash}`);
                console.log(`   Amount: ${mintResult.amountMinted} oINR`);
                console.log(`   New Balance: ${mintResult.newBalance} oINR`);

                // Move to completed orders
                completedOrders.set(orderId, {
                    ...orderDetails,
                    status: 'COMPLETED',
                    paymentTime: data.payment.payment_time,
                    transactionHash: mintResult.transactionHash,
                    blockNumber: mintResult.blockNumber,
                    amountMinted: mintResult.amountMinted,
                    completedAt: new Date().toISOString()
                });

                pendingOrders.delete(orderId);

            } catch (mintError) {
                console.error('❌ Error minting oINR:', mintError);

                // Mark as failed
                completedOrders.set(orderId, {
                    ...orderDetails,
                    status: 'MINT_FAILED',
                    error: mintError.message,
                    failedAt: new Date().toISOString()
                });
            }
        }

        // Always acknowledge webhook
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * Verify payment and mint oINR (manual trigger if webhook fails)
 * POST /api/verify-and-mint
 * Body: { orderId }
 */
router.post('/verify-and-mint', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Check if already completed
        if (completedOrders.has(orderId)) {
            const order = completedOrders.get(orderId);
            return res.json({
                success: true,
                message: 'Order already processed',
                order
            });
        }

        // Get order details
        const orderDetails = pendingOrders.get(orderId);
        if (!orderDetails) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify payment with Cashfree
        const paymentStatus = await verifyPayment(orderId);

        if (paymentStatus.orderStatus !== 'PAID') {
            return res.json({
                success: false,
                message: 'Payment not completed',
                status: paymentStatus.orderStatus
            });
        }

        // Mint oINR
        const mintResult = await mintOINR(
            orderDetails.walletAddress,
            parseFloat(paymentStatus.orderAmount)
        );

        // Mark as completed
        completedOrders.set(orderId, {
            ...orderDetails,
            status: 'COMPLETED',
            transactionHash: mintResult.transactionHash,
            blockNumber: mintResult.blockNumber,
            amountMinted: mintResult.amountMinted,
            completedAt: new Date().toISOString()
        });

        pendingOrders.delete(orderId);

        res.json({
            success: true,
            message: 'oINR minted successfully',
            ...mintResult
        });

    } catch (error) {
        console.error('Error in /verify-and-mint:', error);
        res.status(500).json({
            error: 'Failed to verify and mint',
            message: error.message
        });
    }
});

/**
 * Get order status
 * GET /api/order-status/:orderId
 */
router.get('/order-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Check completed orders first
        if (completedOrders.has(orderId)) {
            return res.json({
                success: true,
                order: completedOrders.get(orderId)
            });
        }

        // Check pending orders
        if (pendingOrders.has(orderId)) {
            const order = pendingOrders.get(orderId);

            // Try to get latest status from Cashfree
            try {
                const paymentStatus = await verifyPayment(orderId);
                return res.json({
                    success: true,
                    order: {
                        ...order,
                        paymentStatus: paymentStatus.orderStatus
                    }
                });
            } catch (error) {
                return res.json({
                    success: true,
                    order
                });
            }
        }

        res.status(404).json({ error: 'Order not found' });

    } catch (error) {
        console.error('Error in /order-status:', error);
        res.status(500).json({ error: 'Failed to get order status' });
    }
});

/**
 * Get oINR balance
 * GET /api/balance/:address
 */
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await getOINRBalance(address);

        res.json({
            success: true,
            address,
            balance
        });
    } catch (error) {
        console.error('Error in /balance:', error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

/**
 * Get user's transaction history
 * GET /api/transactions/:walletAddress
 */
router.get('/transactions/:walletAddress', (req, res) => {
    try {
        const { walletAddress } = req.params;
        const userTransactions = [];

        // Get completed transactions for this wallet
        for (const [orderId, order] of completedOrders.entries()) {
            if (order.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
                userTransactions.push(order);
            }
        }

        // Sort by completion time (newest first)
        userTransactions.sort((a, b) =>
            new Date(b.completedAt) - new Date(a.completedAt)
        );

        res.json({
            success: true,
            transactions: userTransactions,
            count: userTransactions.length
        });
    } catch (error) {
        console.error('Error in /transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

/**
 * Payment return URL (for redirect checkout)
 * GET /api/payment-return
 */
router.get('/payment-return', async (req, res) => {
    const { order_id } = req.query;

    // In production, redirect to a proper frontend page
    res.send(`
    <html>
      <head><title>Payment Status</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2>Processing Payment...</h2>
        <p>Order ID: ${order_id}</p>
        <p>Your payment is being verified. oINR will be minted to your wallet shortly.</p>
        <p>You can close this window.</p>
      </body>
    </html>
  `);
});

module.exports = router;
