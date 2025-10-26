const { Cashfree } = require('cashfree-pg');
const { CFEnvironment } = require('cashfree-pg/dist/configuration');

// Initialize Cashfree SDK (v5.x) - using class instantiation
const cashfree = new Cashfree(
    process.env.CASHFREE_ENVIRONMENT === 'production'
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

/**
 * Create a payment order with Cashfree
 * @param {Object} orderData - Order details
 * @param {string} orderData.orderId - Unique order ID
 * @param {number} orderData.amount - Amount in INR
 * @param {string} orderData.customerName - Customer name
 * @param {string} orderData.customerEmail - Customer email
 * @param {string} orderData.customerPhone - Customer phone
 * @param {string} orderData.walletAddress - User's wallet address for minting oINR
 * @returns {Promise<Object>} - Payment session details
 */
async function createOrder(orderData) {
    try {
        const request = {
            order_id: orderData.orderId,
            order_amount: orderData.amount.toString(),
            order_currency: 'INR',
            customer_details: {
                customer_id: orderData.walletAddress.toLowerCase(),
                customer_name: orderData.customerName || 'User',
                customer_email: orderData.customerEmail,
                customer_phone: orderData.customerPhone
            },
            order_meta: {
                return_url: `${process.env.BASE_URL}/api/payment-return?order_id=${orderData.orderId}`,
                notify_url: `${process.env.BASE_URL}/api/webhook`,
                payment_methods: "upi,nb,card,wallet"
            },
            order_note: `Deposit INR to mint oINR for ${orderData.walletAddress}`,
            order_tags: {
                "wallet": orderData.walletAddress
            }
        };

        console.log('Creating Cashfree order:', request);

        const response = await cashfree.PGCreateOrder(request);

        console.log('Cashfree API Response:', JSON.stringify(response.data, null, 2));

        return {
            success: true,
            orderId: response.data.order_id,
            paymentSessionId: response.data.payment_session_id,
            orderAmount: response.data.order_amount,
            orderCurrency: response.data.order_currency,
            paymentLink: response.data.payment_link || null
        };
    } catch (error) {
        console.error('Error creating Cashfree order:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
}

/**
 * Verify payment status
 * @param {string} orderId - Order ID to verify
 * @returns {Promise<Object>} - Order status details
 */
async function verifyPayment(orderId) {
    try {
        const response = await cashfree.PGFetchOrder(orderId);

        return {
            success: true,
            orderId: response.data.order_id,
            orderStatus: response.data.order_status,
            orderAmount: response.data.order_amount,
            orderCurrency: response.data.order_currency,
            paymentTime: response.data.payment_time,
            customerId: response.data.customer_details?.customer_id
        };
    } catch (error) {
        console.error('Error verifying payment:', error.response?.data || error.message);
        throw new Error('Failed to verify payment status');
    }
}

/**
 * Verify webhook signature
 * @param {string} signature - Webhook signature from header
 * @param {string} rawBody - Raw request body
 * @param {string} timestamp - Timestamp from header
 * @returns {boolean} - Whether signature is valid
 */
function verifyWebhookSignature(signature, rawBody, timestamp) {
    try {
        cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
        return true;
    } catch (error) {
        console.error('Webhook signature verification failed:', error.message);
        return false;
    }
}

/**
 * Create a payment link for an order
 * @param {Object} linkData - Payment link details
 * @returns {Promise<Object>} - Payment link details
 */
async function createPaymentLink(linkData) {
    try {
        const request = {
            link_id: linkData.orderId,
            link_amount: linkData.amount,
            link_currency: 'INR',
            link_purpose: `oINR Purchase for ${linkData.walletAddress}`,
            customer_details: {
                customer_phone: linkData.customerPhone,
                customer_email: linkData.customerEmail,
                customer_name: linkData.customerName
            },
            link_notify: {
                send_sms: false,
                send_email: false
            },
            link_meta: {
                notify_url: `${process.env.BASE_URL}/api/webhook`,
                return_url: `${process.env.BASE_URL}/api/payment-return?order_id=${linkData.orderId}`,
                wallet_address: linkData.walletAddress
            }
        };

        console.log('Creating Cashfree Payment Link:', request);

        const response = await cashfree.PGCreateLink(request);

        console.log('Payment Link Response:', JSON.stringify(response.data, null, 2));

        return {
            success: true,
            linkId: response.data.link_id,
            linkUrl: response.data.link_url,
            linkAmount: response.data.link_amount
        };
    } catch (error) {
        console.error('Error creating payment link:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create payment link');
    }
}

module.exports = {
    createOrder,
    createPaymentLink,
    verifyPayment,
    verifyWebhookSignature
};
