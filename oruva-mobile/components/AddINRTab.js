import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Platform
} from 'react-native';
import {
    createPaymentOrder,
    openPaymentCheckout,
    getOrderStatus,
    getTransactionHistory
} from '../src/services/cashfree';

export default function AddINRTab({ walletAddress, provider, magic, onBack }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Preset amounts
    const presetAmounts = [100, 500, 1000, 5000];

    useEffect(() => {
        // Load transaction history
        loadTransactions();
    }, [walletAddress]);

    const loadTransactions = async () => {
        if (!walletAddress) return;

        try {
            const txHistory = await getTransactionHistory(walletAddress);
            setTransactions(txHistory);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    };

    const handlePaymentVerify = async (orderId) => {
        console.log('Payment completed for order:', orderId);
        setProcessing(true);

        try {
            // Check order status
            const orderStatus = await getOrderStatus(orderId);

            if (orderStatus.status === 'COMPLETED') {
                Alert.alert(
                    '✅ Success!',
                    `${orderStatus.amountMinted} oINR has been minted to your wallet!`,
                    [{
                        text: 'OK',
                        onPress: () => {
                            setAmount('');
                            setCurrentOrderId(null);
                            setProcessing(false);
                            loadTransactions(); // Refresh transaction list
                        }
                    }]
                );
            } else if (orderStatus.status === 'MINT_FAILED') {
                Alert.alert(
                    '⚠️ Payment Received',
                    'Your payment was successful but there was an error minting oINR. Our team will resolve this shortly.',
                    [{ text: 'OK', onPress: () => setProcessing(false) }]
                );
            } else {
                // Still processing
                Alert.alert(
                    '⏳ Processing',
                    'Your payment is being processed. oINR will be minted shortly.',
                    [{ text: 'OK', onPress: () => setProcessing(false) }]
                );
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            Alert.alert(
                'Payment Verification',
                'Payment completed. Please check your wallet in a few minutes.',
                [{ text: 'OK', onPress: () => setProcessing(false) }]
            );
        }
    };

    const handlePaymentError = (error, orderId) => {
        console.error('Payment error:', error);
        setProcessing(false);
        setCurrentOrderId(null);

        Alert.alert(
            'Payment Failed',
            error.message || 'There was an error processing your payment. Please try again.',
            [{ text: 'OK' }]
        );
    };

    const handlePayment = async () => {
        const amountNum = parseFloat(amount);

        if (!amountNum || amountNum <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (amountNum < 10) {
            Alert.alert('Minimum Amount', 'Minimum deposit is ₹10');
            return;
        }

        if (!walletAddress) {
            Alert.alert('Wallet Required', 'Please connect your wallet first');
            return;
        }

        setLoading(true);

        try {
            // Get user info from Magic
            let userInfo;
            try {
                userInfo = await magic.user.getInfo();
            } catch (err) {
                console.log('Could not get user info:', err);
                userInfo = {};
            }

            // Create payment order
            const orderDetails = await createPaymentOrder({
                amount: amountNum,
                customerName: walletAddress.substring(0, 8) + '...',
                customerEmail: userInfo?.email || `${walletAddress.substring(0, 8)}@oruva.app`,
                customerPhone: '9999999999', // Default for test
                walletAddress: walletAddress
            });

            console.log('Order created:', orderDetails);
            setCurrentOrderId(orderDetails.orderId);

            setLoading(false);

            // Show confirmation before opening browser
            Alert.alert(
                'Open Payment Page',
                'You will be redirected to Cashfree to complete the payment. You can use your device back button to return to the app.',
                [
                    {
                        text: 'Open Payment',
                        onPress: async () => {
                            // Open payment checkout page with the checkout URL
                            await openPaymentCheckout(orderDetails.checkoutUrl);

                            // After user returns from payment, show status check option
                            setTimeout(() => {
                                Alert.alert(
                                    'Check Payment Status',
                                    'After completing payment, tap "Check Status" to verify.',
                                    [
                                        {
                                            text: 'Check Status',
                                            onPress: () => handlePaymentVerify(orderDetails.orderId)
                                        },
                                        {
                                            text: 'Later',
                                            style: 'cancel'
                                        }
                                    ]
                                );
                            }, 1000);
                        }
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            setCurrentOrderId(null);
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Payment error:', error);
            setLoading(false);

            Alert.alert(
                'Error',
                error.message || 'Failed to initiate payment. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Add INR</Text>
                    <View style={styles.backButton} />
                </View>
                <Text style={styles.subtitle}>Deposit INR to receive oINR (1:1 ratio)</Text>
            </View>

            {/* Amount Input Section */}
            <View style={styles.section}>
                <Text style={styles.label}>Enter Amount (₹)</Text>

                <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!loading && !processing}
                />

                {/* Preset Amount Buttons */}
                <View style={styles.presetContainer}>
                    {presetAmounts.map((preset) => (
                        <TouchableOpacity
                            key={preset}
                            style={[
                                styles.presetButton,
                                amount === preset.toString() && styles.presetButtonActive
                            ]}
                            onPress={() => setAmount(preset.toString())}
                            disabled={loading || processing}
                        >
                            <Text style={[
                                styles.presetText,
                                amount === preset.toString() && styles.presetTextActive
                            ]}>
                                ₹{preset}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* You Will Receive */}
                {amount && parseFloat(amount) > 0 && (
                    <View style={styles.receiveBox}>
                        <Text style={styles.receiveLabel}>You will receive</Text>
                        <Text style={styles.receiveAmount}>{amount} oINR</Text>
                    </View>
                )}

                {/* Pay Button */}
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        (loading || processing || !amount) && styles.payButtonDisabled
                    ]}
                    onPress={handlePayment}
                    disabled={loading || processing || !amount}
                >
                    {loading || processing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.payButtonText}>
                            {processing ? 'Processing...' : '💳 Pay via UPI'}
                        </Text>
                    )}
                </TouchableOpacity>

                {processing && (
                    <View style={styles.processingBox}>
                        <ActivityIndicator color="#4CAF50" />
                        <Text style={styles.processingText}>
                            Payment in progress... Please complete payment in Cashfree checkout
                        </Text>
                    </View>
                )}

                {/* Test Info for Sandbox */}
                <View style={styles.testInfo}>
                    <Text style={styles.testInfoTitle}>🧪 Test Mode (Sandbox)</Text>
                    <Text style={styles.testInfoText}>
                        Use test UPI VPA: <Text style={styles.bold}>testsuccess@gocash</Text>
                    </Text>
                    <Text style={styles.testInfoTextSmall}>
                        No real money will be charged
                    </Text>
                </View>
            </View>

            {/* Transaction History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>

                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No transactions yet</Text>
                        <Text style={styles.emptySubtext}>
                            Deposit INR to get started with oINR
                        </Text>
                    </View>
                ) : (
                    transactions.map((tx, index) => (
                        <View key={index} style={styles.transactionCard}>
                            <View style={styles.transactionHeader}>
                                <Text style={styles.transactionAmount}>
                                    +{tx.amountMinted} oINR
                                </Text>
                                <View style={[
                                    styles.statusBadge,
                                    tx.status === 'COMPLETED' ? styles.statusSuccess : styles.statusPending
                                ]}>
                                    <Text style={styles.statusText}>
                                        {tx.status === 'COMPLETED' ? '✓ Completed' : '⏳ Processing'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.transactionDate}>
                                {formatDate(tx.completedAt || tx.createdAt)}
                            </Text>

                            {tx.transactionHash && (
                                <Text style={styles.transactionHash} numberOfLines={1}>
                                    TX: {tx.transactionHash}
                                </Text>
                            )}
                        </View>
                    ))
                )}
            </View>

            <View style={styles.spacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    backButton: {
        width: 70,
    },
    backButtonText: {
        fontSize: 16,
        color: '#00BAF2',
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 15,
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        padding: 15,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    presetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    presetButton: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    presetButtonActive: {
        backgroundColor: '#00BAF2',
    },
    presetText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    presetTextActive: {
        color: '#fff',
    },
    receiveBox: {
        backgroundColor: '#E8F4FD',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    receiveLabel: {
        fontSize: 12,
        color: '#00BAF2',
        marginBottom: 5,
    },
    receiveAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#002E6E',
    },
    payButton: {
        backgroundColor: '#00BAF2',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#ccc',
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    processingBox: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#E8F4FD',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    processingText: {
        marginLeft: 10,
        flex: 1,
        fontSize: 13,
        color: '#F57F17',
    },
    testInfo: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#E8F4FD',
        borderRadius: 10,
    },
    testInfoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#002E6E',
        marginBottom: 8,
    },
    testInfoText: {
        fontSize: 13,
        color: '#002E6E',
        marginBottom: 4,
    },
    testInfoTextSmall: {
        fontSize: 11,
        color: '#002E6E',
    },
    bold: {
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#bbb',
    },
    transactionCard: {
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00BAF2',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusSuccess: {
        backgroundColor: '#E8F4FD',
    },
    statusPending: {
        backgroundColor: '#FFF3E0',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    transactionDate: {
        fontSize: 13,
        color: '#666',
        marginBottom: 5,
    },
    transactionHash: {
        fontSize: 11,
        color: '#999',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    spacing: {
        height: 30,
    },
});
