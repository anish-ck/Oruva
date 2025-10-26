import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Backend API URL - Update this to your backend URL
const BACKEND_URL = 'https://subpermanently-doughy-bonny.ngrok-free.dev/api'; // ngrok URL for testing

/**
 * Create a payment order and get payment session
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Amount in INR
 * @param {string} orderData.customerName - Customer name
 * @param {string} orderData.customerEmail - Customer email
 * @param {string} orderData.customerPhone - Customer phone
 * @param {string} orderData.walletAddress - User's wallet address
 * @returns {Promise<Object>} - Order details with payment session
 */
export async function createPaymentOrder(orderData) {
    try {
        console.log('Creating payment order:', orderData);

        const response = await axios.post(`${BACKEND_URL}/create-order`, orderData);

        if (!response.data.success) {
            throw new Error('Failed to create order');
        }

        return {
            orderId: response.data.orderId,
            paymentSessionId: response.data.paymentSessionId,
            orderAmount: response.data.orderAmount,
            orderCurrency: response.data.orderCurrency,
            checkoutUrl: response.data.checkoutUrl
        };
    } catch (error) {
        console.error('Error creating payment order:', error);
        throw new Error(
            error.response?.data?.message ||
            'Failed to create payment order. Please try again.'
        );
    }
}

/**
 * Open Cashfree payment checkout page
 * @param {string} checkoutUrl - Checkout URL (can be payment link or session URL)
 * @returns {Promise<Object>} - Payment result
 */
export async function openPaymentCheckout(checkoutUrl) {
    try {
        console.log('Opening Cashfree checkout page');
        console.log('Checkout URL:', checkoutUrl);

        if (!checkoutUrl) {
            throw new Error('No checkout URL provided');
        }

        // Open the payment page in a web browser
        const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
            // For better UX on mobile
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });

        console.log('WebBrowser result:', result);

        return result;
    } catch (error) {
        console.error('Error opening checkout:', error);
        throw new Error('Failed to open payment page');
    }
}

/**
 * Get order status from backend
 * @param {string} orderId - Order ID to check
 * @returns {Promise<Object>} - Order status details
 */
export async function getOrderStatus(orderId) {
    try {
        const response = await axios.get(`${BACKEND_URL}/order-status/${orderId}`);

        if (!response.data.success) {
            throw new Error('Failed to get order status');
        }

        return response.data.order;
    } catch (error) {
        console.error('Error getting order status:', error);
        throw new Error('Failed to get order status');
    }
}

/**
 * Get transaction history for a wallet
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<Array>} - List of transactions
 */
export async function getTransactionHistory(walletAddress) {
    try {
        const response = await axios.get(`${BACKEND_URL}/transactions/${walletAddress}`);

        if (!response.data.success) {
            throw new Error('Failed to get transactions');
        }

        return response.data.transactions;
    } catch (error) {
        console.error('Error getting transaction history:', error);
        return [];
    }
}

/**
 * Verify payment and manually trigger minting (fallback)
 * @param {string} orderId - Order ID to verify
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyAndMint(orderId) {
    try {
        const response = await axios.post(`${BACKEND_URL}/verify-and-mint`, { orderId });

        return response.data;
    } catch (error) {
        console.error('Error verifying and minting:', error);
        throw new Error('Failed to verify payment');
    }
}

/**
 * Get oINR balance from backend
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<string>} - Balance in oINR
 */
export async function getOINRBalance(walletAddress) {
    try {
        const response = await axios.get(`${BACKEND_URL}/balance/${walletAddress}`);

        if (!response.data.success) {
            throw new Error('Failed to get balance');
        }

        return response.data.balance;
    } catch (error) {
        console.error('Error getting balance:', error);
        return '0';
    }
}

/**
 * Remove payment callback handlers
 */
export function removePaymentCallbacks() {
    // No callbacks needed for web-based flow
    console.log('No callbacks to remove for web flow');
}
