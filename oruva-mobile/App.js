import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import walletService from './src/services/wallet';
import vaultService from './src/services/vault';
import ReceivePayment from './app/ReceivePayment';
import SendPayment from './app/SendPayment';

export default function App() {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState('');
    const [vaultInfo, setVaultInfo] = useState(null);
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(false);

    // Screen navigation
    const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'receive', 'send'

    // Input states
    const [depositAmount, setDepositAmount] = useState('');
    const [borrowAmount, setBorrowAmount] = useState('');
    const [repayAmount, setRepayAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState('');
    const [mintAmount, setMintAmount] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [importMode, setImportMode] = useState(false);

    useEffect(() => {
        if (connected && address) {
            loadData();
        }
    }, [connected, address]);

    async function handleConnect() {
        setLoading(true);
        try {
            let addr;
            if (importMode && privateKey) {
                // Import existing wallet with private key
                const result = await walletService.connectWithPrivateKey(privateKey);
                addr = result.address;
            } else {
                // Create new wallet
                addr = await walletService.connect();
            }
            setAddress(addr);
            setConnected(true);
            vaultService.initialize();
            Alert.alert('Success', 'Wallet connected!');
        } catch (error) {
            Alert.alert('Error', 'Failed to connect wallet: ' + error.message);
        }
        setLoading(false);
    }

    async function handleDisconnect() {
        await walletService.disconnect();
        setConnected(false);
        setAddress('');
        setVaultInfo(null);
        setBalances(null);
    }

    async function loadData() {
        try {
            const info = await vaultService.getVaultInfo(address);
            const bal = await vaultService.getBalances(address);
            setVaultInfo(info);
            setBalances(bal);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    async function handleMintUSDC() {
        if (!mintAmount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setLoading(true);
        try {
            await vaultService.mintTestUSDC(parseFloat(mintAmount));
            Alert.alert('Success', `Minted ${mintAmount} test USDC!`);
            setMintAmount('');
            await loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    }

    async function handleDeposit() {
        if (!depositAmount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setLoading(true);
        try {
            await vaultService.deposit(parseFloat(depositAmount));
            Alert.alert('Success', 'Deposit successful!');
            setDepositAmount('');
            await loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    }

    async function handleBorrow() {
        if (!borrowAmount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setLoading(true);
        try {
            await vaultService.borrow(parseFloat(borrowAmount));
            Alert.alert('Success', 'Borrow successful!');
            setBorrowAmount('');
            await loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    }

    async function handleBuyOINR() {
        if (!buyAmount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setLoading(true);
        try {
            await vaultService.buyOINR(parseFloat(buyAmount));
            Alert.alert('Success', `Bought ${buyAmount} oINR!`);
            setBuyAmount('');
            await loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    }

    async function handleRepay() {
        if (!repayAmount) {
            Alert.alert('Error', 'Please enter amount');
            return;
        }

        setLoading(true);
        try {
            await vaultService.repay(parseFloat(repayAmount));
            Alert.alert('Success', 'Repayment successful!');
            setRepayAmount('');
            await loadData();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    }

    async function handleQRPayment(toAddress, amount) {
        setLoading(true);
        try {
            const oINRContract = vaultService.getOINRContract();
            await walletService.transferOINR(toAddress, amount, oINRContract);
            await loadData();
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // Handle screen navigation
    if (currentScreen === 'receive' && connected) {
        return (
            <ReceivePayment
                walletAddress={address}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'send' && connected) {
        return (
            <SendPayment
                wallet={walletService}
                onBack={() => setCurrentScreen('home')}
                onPaymentSuccess={handleQRPayment}
            />
        );
    }

    if (!connected) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContainer}>
                    <Text style={styles.logo}>🏦</Text>
                    <Text style={styles.title}>Oruva DeFi Bank</Text>
                    <Text style={styles.subtitle}>Borrow INR Stablecoin</Text>
                    <Text style={styles.network}>Flow EVM Testnet</Text>

                    {!importMode ? (
                        <>
                            <TouchableOpacity
                                style={styles.connectButton}
                                onPress={handleConnect}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Create New Wallet</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.connectButton, { backgroundColor: '#10b981', marginTop: 12 }]}
                                onPress={() => setImportMode(true)}
                            >
                                <Text style={styles.buttonText}>Import MetaMask Wallet</Text>
                            </TouchableOpacity>

                            <Text style={styles.hint}>Choose to create new or import existing</Text>
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={styles.privateKeyInput}
                                placeholder="Paste your private key (0x...)"
                                placeholderTextColor="#9ca3af"
                                value={privateKey}
                                onChangeText={setPrivateKey}
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                style={styles.connectButton}
                                onPress={handleConnect}
                                disabled={loading || !privateKey}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Import Wallet</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.connectButton, { backgroundColor: '#6b7280', marginTop: 12 }]}
                                onPress={() => {
                                    setImportMode(false);
                                    setPrivateKey('');
                                }}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>

                            <Text style={styles.hint}>⚠️ Your private key is stored securely in app storage</Text>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Your Vault</Text>
                    <Text style={styles.address}>
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </Text>
                    <TouchableOpacity onPress={handleDisconnect}>
                        <Text style={styles.disconnect}>Disconnect</Text>
                    </TouchableOpacity>
                </View>

                {/* Gas Fee Info */}
                <View style={[styles.card, { backgroundColor: '#fef3c7' }]}>
                    <Text style={styles.cardTitle}>⚠️ Need Gas Fees</Text>
                    <Text style={styles.warningText}>
                        To make transactions, you need FLOW tokens for gas fees.
                    </Text>
                    <Text style={styles.warningText}>
                        Get free testnet FLOW from: https://faucet.flow.com/
                    </Text>
                    <Text style={[styles.warningText, { fontWeight: 'bold', marginTop: 5 }]}>
                        Your address: {address}
                    </Text>
                </View>

                {/* Balances */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💰 Your Balances</Text>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>USDC:</Text>
                        <Text style={styles.balanceValue}>{balances?.usdc || '0'}</Text>
                    </View>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>oINR:</Text>
                        <Text style={styles.balanceValue}>{balances?.oinr || '0'}</Text>
                    </View>
                </View>

                {/* Vault Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Vault Status</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Collateral:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.collateral || '0'} USDC</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Debt:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.debt || '0'} oINR</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Value:</Text>
                        <Text style={styles.infoValue}>₹{vaultInfo?.collateralValueINR || '0'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ratio:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.ratio || '0'}%</Text>
                    </View>
                    <Text
                        style={[
                            styles.healthStatus,
                            { color: vaultInfo?.isHealthy ? '#10b981' : '#ef4444' },
                        ]}
                    >
                        {vaultInfo?.isHealthy ? '✅ Healthy' : '⚠️ Undercollateralized'}
                    </Text>
                </View>

                {/* Mint Test USDC */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🪙 Mint Test USDC</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (e.g., 1000)"
                        keyboardType="numeric"
                        value={mintAmount}
                        onChangeText={setMintAmount}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleMintUSDC}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Mint USDC</Text>
                    </TouchableOpacity>
                </View>

                {/* Deposit */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💵 Deposit Collateral</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (USDC)"
                        keyboardType="numeric"
                        value={depositAmount}
                        onChangeText={setDepositAmount}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleDeposit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Deposit</Text>
                    </TouchableOpacity>
                </View>

                {/* Borrow */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💸 Borrow oINR</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (oINR)"
                        keyboardType="numeric"
                        value={borrowAmount}
                        onChangeText={setBorrowAmount}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleBorrow}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Borrow</Text>
                    </TouchableOpacity>
                </View>

                {/* Buy oINR */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🛒 Buy oINR</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (oINR)"
                        keyboardType="numeric"
                        value={buyAmount}
                        onChangeText={setBuyAmount}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleBuyOINR}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Buy oINR</Text>
                    </TouchableOpacity>
                </View>

                {/* Repay */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💳 Repay Debt</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (oINR)"
                        keyboardType="numeric"
                        value={repayAmount}
                        onChangeText={setRepayAmount}
                        placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleRepay}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Repay</Text>
                    </TouchableOpacity>
                </View>

                {/* QR Payments */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📱 UPI-Style QR Payments</Text>
                    <Text style={styles.qrDescription}>
                        Send and receive oINR instantly using QR codes
                    </Text>
                    
                    <View style={styles.qrButtonRow}>
                        <TouchableOpacity
                            style={[styles.qrButton, { backgroundColor: '#4CAF50' }]}
                            onPress={() => setCurrentScreen('receive')}
                            disabled={loading}
                        >
                            <Text style={styles.qrButtonIcon}>📥</Text>
                            <Text style={styles.qrButtonText}>Receive</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.qrButton, { backgroundColor: '#2196F3' }]}
                            onPress={() => setCurrentScreen('send')}
                            disabled={loading}
                        >
                            <Text style={styles.qrButtonIcon}>📤</Text>
                            <Text style={styles.qrButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        marginBottom: 8,
        textAlign: 'center',
    },
    network: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 40,
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 16,
        textAlign: 'center',
    },
    header: {
        marginBottom: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    address: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
        fontFamily: 'monospace',
    },
    disconnect: {
        fontSize: 14,
        color: '#ef4444',
        textDecorationLine: 'underline',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    balanceValue: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 15,
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '600',
    },
    healthStatus: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
        textAlign: 'center',
    },
    warningText: {
        fontSize: 13,
        color: '#92400e',
        marginBottom: 4,
        lineHeight: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#f9fafb',
        color: '#1f2937',
    },
    privateKeyInput: {
        borderWidth: 2,
        borderColor: '#6366f1',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        marginBottom: 16,
        backgroundColor: '#f9fafb',
        color: '#1f2937',
        width: '90%',
        fontFamily: 'monospace',
    },
    connectButton: {
        backgroundColor: '#6366f1',
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    actionButton: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    qrDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    qrButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    qrButton: {
        flex: 1,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    qrButtonIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    qrButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
