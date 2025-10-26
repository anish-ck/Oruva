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
    Clipboard,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import walletService from './src/services/wallet';
import vaultService from './src/services/vault';
import yieldService from './src/services/yield';
import ReceivePayment from './app/ReceivePayment';
import SendPayment from './app/SendPayment';
import DiagnosticScreen from './app/DiagnosticScreen';
import EarnTab from './components/EarnTab';
import ProfileTab from './components/ProfileTab';
import AddINRTab from './components/AddINRTab';
import { magic, loginWithEmail, getUserAddress, isLoggedIn, logout, getMagicProvider } from './src/services/magic';

function AppContent() {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState('');
    const [vaultInfo, setVaultInfo] = useState(null);
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(false);

    // Screen navigation
    const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'receive', 'send', 'diagnostic', 'earn', 'profile', 'addINR'

    // Input states
    const [depositAmount, setDepositAmount] = useState('');
    const [borrowAmount, setBorrowAmount] = useState('');
    const [repayAmount, setRepayAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState('');
    const [mintAmount, setMintAmount] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [importMode, setImportMode] = useState(false);
    const [magicMode, setMagicMode] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (connected && address) {
            loadData();
        }
    }, [connected, address]);

    // Disable auto-login to allow users to choose login method
    // If you want auto-login back, uncomment this:
    /*
    useEffect(() => {
        checkMagicLogin();
    }, []);
    */

    async function checkMagicLogin() {
        try {
            const loggedIn = await isLoggedIn();
            if (loggedIn) {
                console.log('User already logged in with Magic');
                const addr = await getUserAddress();

                // Connect wallet service with Magic provider
                const magicProvider = getMagicProvider();
                await walletService.connectWithMagic(magicProvider, addr);

                setAddress(addr);
                setConnected(true);
                vaultService.initialize();
                await yieldService.initialize(walletService.signer, addr);
            }
        } catch (error) {
            console.error('Error checking Magic login:', error);
        }
    }

    async function handleMagicLogin() {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            console.log('Logging in with Magic Link...');
            await loginWithEmail(email);
            const addr = await getUserAddress();
            console.log('Magic wallet address:', addr);

            // Connect wallet service with Magic provider
            const magicProvider = getMagicProvider();
            await walletService.connectWithMagic(magicProvider, addr);

            setAddress(addr);
            setConnected(true);
            vaultService.initialize();
            await yieldService.initialize(walletService.signer, addr);
            Alert.alert('Success', `Magic Link login successful!\n\nWallet: ${addr.slice(0, 6)}...${addr.slice(-4)}`);
        } catch (error) {
            console.error('Magic login error:', error);
            Alert.alert('Error', 'Magic login failed: ' + error.message);
        }
        setLoading(false);
    }

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
            await yieldService.initialize(walletService.signer, addr);
            Alert.alert('Success', 'Wallet connected!');
        } catch (error) {
            Alert.alert('Error', 'Failed to connect wallet: ' + error.message);
        }
        setLoading(false);
    }

    async function handleDisconnect() {
        // Check if logged in with Magic and logout
        try {
            const magicLoggedIn = await isLoggedIn();
            if (magicLoggedIn) {
                await logout();
                console.log('Logged out from Magic');
            }
        } catch (error) {
            console.error('Error logging out from Magic:', error);
        }

        await walletService.disconnect();
        setConnected(false);
        setAddress('');
        setVaultInfo(null);
        setBalances(null);
        setEmail('');
        setMagicMode(false);
        setImportMode(false);
    }

    async function loadData() {
        try {
            console.log('Loading data for address:', address);
            const info = await vaultService.getVaultInfo(address);
            const bal = await vaultService.getBalances(address);
            console.log('Vault info:', info);
            console.log('Balances:', bal);
            setVaultInfo(info);
            setBalances(bal);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    async function handleRefresh() {
        setLoading(true);
        try {
            await loadData();
            Alert.alert('Success', 'Balances refreshed!');
        } catch (error) {
            Alert.alert('Error', 'Failed to refresh: ' + error.message);
        }
        setLoading(false);
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
            await loadData();
            Alert.alert('Success', `Borrowed ${borrowAmount} oINR!\n\nCheck your oINR balance above.`);
            setBorrowAmount('');
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
            await loadData();
            Alert.alert('Success', `Bought ${buyAmount} oINR!\n\nCheck your oINR balance above.`);
            setBuyAmount('');
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
    if (currentScreen === 'profile' && connected) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.backButton}>
                    <TouchableOpacity onPress={() => setCurrentScreen('home')}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <ProfileTab onLogout={handleDisconnect} />
            </SafeAreaView>
        );
    }

    if (currentScreen === 'earn' && connected) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.backButton}>
                    <TouchableOpacity onPress={() => setCurrentScreen('home')}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <EarnTab />
            </SafeAreaView>
        );
    }

    if (currentScreen === 'addINR' && connected) {
        return (
            <AddINRTab
                walletAddress={address}
                provider={walletService.provider}
                magic={magic}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'diagnostic' && connected) {
        return (
            <DiagnosticScreen onBack={() => setCurrentScreen('home')} />
        );
    }

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
                oINRBalance={balances?.oinr}
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

                    {!importMode && !magicMode ? (
                        <>
                            <TouchableOpacity
                                style={[styles.connectButton, { backgroundColor: '#8b5cf6' }]}
                                onPress={() => setMagicMode(true)}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>🪄 Login with Magic Link</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.connectButton, { marginTop: 12 }]}
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

                            <Text style={styles.hint}>Login with email or create/import wallet</Text>
                        </>
                    ) : magicMode ? (
                        <>
                            <TextInput
                                style={styles.emailInput}
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                style={[styles.connectButton, { backgroundColor: '#8b5cf6' }]}
                                onPress={handleMagicLogin}
                                disabled={loading || !email}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Send Magic Link</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.connectButton, { backgroundColor: '#6b7280', marginTop: 12 }]}
                                onPress={() => {
                                    setMagicMode(false);
                                    setEmail('');
                                }}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>

                            <Text style={styles.hint}>✨ No password needed - check your email for login link</Text>
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
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Your Vault</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Clipboard.setString(address);
                                    Alert.alert('Copied!', 'Address copied to clipboard');
                                }}
                                style={styles.addressContainer}
                            >
                                <Text style={styles.address} numberOfLines={1}>
                                    {address}
                                </Text>
                                <Text style={styles.copyIcon}>📋</Text>
                            </TouchableOpacity>
                            <Text style={styles.copyHint}>Tap to copy full address</Text>
                        </View>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                style={styles.addINRButton}
                                onPress={() => setCurrentScreen('addINR')}
                                disabled={loading}
                            >
                                <Text style={styles.addINRButtonText}>💰</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.profileButton}
                                onPress={() => setCurrentScreen('profile')}
                                disabled={loading}
                            >
                                <Text style={styles.profileButtonText}>�</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.diagnosticButton}
                                onPress={() => setCurrentScreen('diagnostic')}
                                disabled={loading}
                            >
                                <Text style={styles.diagnosticButtonText}>🔧</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={handleRefresh}
                                disabled={loading}
                            >
                                <Text style={styles.refreshButtonText}>
                                    {loading ? '⏳' : '🔄'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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

                    {balances && parseFloat(balances.oinr) === 0 && (
                        <View style={[styles.card, { backgroundColor: '#fff3cd', padding: 12, marginBottom: 12 }]}>
                            <Text style={{ fontSize: 13, color: '#856404' }}>
                                💡 To send payments, you need oINR. Buy or borrow oINR first using the options above!
                            </Text>
                        </View>
                    )}

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

                {/* Earn Tab */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💰 Earn Passive Income</Text>
                    <Text style={styles.qrDescription}>
                        Deposit USDC or oINR to earn 5% APY
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#FF9800' }]}
                        onPress={() => setCurrentScreen('earn')}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>💎 Open Earn Tab</Text>
                    </TouchableOpacity>
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    refreshButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    refreshButtonText: {
        fontSize: 18,
    },
    addINRButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    addINRButtonText: {
        fontSize: 18,
    },
    profileButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
    },
    profileButtonText: {
        fontSize: 18,
    },
    diagnosticButton: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    diagnosticButtonText: {
        fontSize: 18,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    address: {
        fontSize: 12,
        color: '#1f2937',
        fontFamily: 'monospace',
        flex: 1,
    },
    copyIcon: {
        fontSize: 16,
        marginLeft: 8,
    },
    copyHint: {
        fontSize: 10,
        color: '#9ca3af',
        fontStyle: 'italic',
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
    emailInput: {
        borderWidth: 2,
        borderColor: '#8b5cf6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#f9fafb',
        color: '#1f2937',
        width: '90%',
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
    backButton: {
        padding: 16,
        paddingTop: 50,
        backgroundColor: 'white',
    },
    backButtonText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '600',
    },
});

// Main App component with Magic Relayer
export default function App() {
    return (
        <SafeAreaProvider>
            {/* Magic Relayer - REQUIRED for Magic authentication to work */}
            <magic.Relayer backgroundColor="#f3f4f6" />

            {/* Main app content */}
            <AppContent />
        </SafeAreaProvider>
    );
}
