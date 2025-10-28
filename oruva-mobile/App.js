import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Clipboard,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import walletService from './src/services/wallet';
import vaultService from './src/services/vault';
import yieldService from './src/services/yield';
import ReceivePayment from './app/ReceivePayment';
import SendPayment from './app/SendPayment';
import DiagnosticScreen from './app/DiagnosticScreen';
import EarnTab from './components/EarnTab';
import ProfileTab from './components/ProfileTab';
import AddINRTab from './components/AddINRTab';
import AadhaarVerification from './components/AadhaarVerification';
import { magic, loginWithEmail, getUserAddress, isLoggedIn, logout, getMagicProvider } from './src/services/magic';
import aadhaarService from './src/services/aadhaar';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import BalancesScreen from './screens/BalancesScreen';
import VaultScreen from './screens/VaultScreen';
import DepositScreen from './screens/DepositScreen';
import BorrowScreen from './screens/BorrowScreen';
import BuyOINRScreen from './screens/BuyOINRScreen';
import RepayScreen from './screens/RepayScreen';
import MintUSDCScreen from './screens/MintUSDCScreen';

function AppContent() {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState('');
    const [vaultInfo, setVaultInfo] = useState(null);
    const [balances, setBalances] = useState(null);
    const [loading, setLoading] = useState(false);

    // KYC/Aadhaar states
    const [showAadhaarVerification, setShowAadhaarVerification] = useState(false);
    const [kycData, setKycData] = useState(null);
    const [kycVerified, setKycVerified] = useState(false);

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

            // Check if user has completed KYC
            console.log('Checking KYC status for:', email);
            const kycStatus = await aadhaarService.checkKYCStatus(email);
            console.log('KYC Status:', kycStatus);

            if (kycStatus.verified) {
                // Returning user with KYC completed
                console.log('✅ User already KYC verified');
                setKycData(kycStatus.data);
                setKycVerified(true);

                // Connect wallet service with Magic provider
                const magicProvider = getMagicProvider();
                await walletService.connectWithMagic(magicProvider, addr);

                setAddress(addr);
                setConnected(true);
                vaultService.initialize();
                await yieldService.initialize(walletService.signer, addr);

                Alert.alert(
                    'Welcome Back!',
                    `Hi ${kycStatus.data.name}!\n\nWallet: ${addr.slice(0, 6)}...${addr.slice(-4)}`
                );
            } else {
                // New user - show Aadhaar verification
                console.log('🆕 New user - showing Aadhaar verification');
                setShowAadhaarVerification(true);
            }
        } catch (error) {
            console.error('Magic login error:', error);
            Alert.alert('Error', 'Magic login failed: ' + error.message);
        }
        setLoading(false);
    }

    async function handleAadhaarVerificationComplete(userData) {
        console.log('✅ Aadhaar verification complete:', userData);
        setKycData(userData);
        setKycVerified(true);
        setShowAadhaarVerification(false);

        try {
            // Get address from Magic
            const addr = await getUserAddress();
            console.log('Creating wallet for:', addr);

            // Connect wallet
            const magicProvider = getMagicProvider();
            await walletService.connectWithMagic(magicProvider, addr);

            setAddress(addr);
            setConnected(true);
            vaultService.initialize();
            await yieldService.initialize(walletService.signer, addr);

            Alert.alert(
                'Welcome to Oruva!',
                `Hi ${userData.name}!\n\nYour KYC is complete and wallet is ready.\n\nWallet: ${addr.slice(0, 6)}...${addr.slice(-4)}`
            );
        } catch (error) {
            console.error('Wallet creation error:', error);
            Alert.alert('Error', 'Failed to create wallet: ' + error.message);
        }
    }

    function handleSkipAadhaar() {
        Alert.alert(
            'Skip KYC?',
            'Without KYC verification:\n\n• Cannot add INR via Cashfree\n• Limited transaction amounts\n• Some features unavailable\n\nYou can complete KYC later from Profile.\n\nContinue without KYC?',
            [
                { text: 'Go Back', style: 'cancel' },
                {
                    text: 'Skip KYC',
                    style: 'destructive',
                    onPress: async () => {
                        setShowAadhaarVerification(false);
                        setKycVerified(false);

                        try {
                            const addr = await getUserAddress();
                            const magicProvider = getMagicProvider();
                            await walletService.connectWithMagic(magicProvider, addr);

                            setAddress(addr);
                            setConnected(true);
                            vaultService.initialize();
                            await yieldService.initialize(walletService.signer, addr);

                            Alert.alert(
                                'Wallet Created',
                                'You can complete KYC verification anytime from the Profile tab to unlock all features.'
                            );
                        } catch (error) {
                            console.error('Wallet creation error:', error);
                            Alert.alert('Error', 'Failed to create wallet: ' + error.message);
                        }
                    }
                }
            ]
        );
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
        setKycData(null);
        setKycVerified(false);
        setShowAadhaarVerification(false);
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

    // Show Aadhaar verification screen after Magic Link login
    if (showAadhaarVerification && !connected) {
        return (

            <GluestackUIProvider mode="dark">
                <AadhaarVerification
                    email={email}
                    onVerificationComplete={handleAadhaarVerificationComplete}
                    onSkip={handleSkipAadhaar}
                />
            </GluestackUIProvider>

        );
    }

    // Handle screen navigation
    if (currentScreen === 'balances' && connected) {
        return (
            <BalancesScreen
                balances={balances}
                vaultInfo={vaultInfo}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'vault' && connected) {
        return (
            <VaultScreen
                vaultInfo={vaultInfo}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                borrowAmount={borrowAmount}
                setBorrowAmount={setBorrowAmount}
                repayAmount={repayAmount}
                setRepayAmount={setRepayAmount}
                buyAmount={buyAmount}
                setBuyAmount={setBuyAmount}
                mintAmount={mintAmount}
                setMintAmount={setMintAmount}
                loading={loading}
                onDeposit={handleDeposit}
                onBorrow={handleBorrow}
                onRepay={handleRepay}
                onBuyOINR={handleBuyOINR}
                onMintUSDC={handleMintUSDC}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'deposit' && connected) {
        return (
            <DepositScreen
                vaultInfo={vaultInfo}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                loading={loading}
                onDeposit={handleDeposit}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'mintusdc' && connected) {
        return (
            <MintUSDCScreen
                vaultInfo={{ ...vaultInfo, address, usdcBalance: balances?.usdc }}
                mintAmount={mintAmount}
                setMintAmount={setMintAmount}
                loading={loading}
                onMintUSDC={handleMintUSDC}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'borrow' && connected) {
        return (
            <BorrowScreen
                vaultInfo={vaultInfo}
                borrowAmount={borrowAmount}
                setBorrowAmount={setBorrowAmount}
                loading={loading}
                onBorrow={handleBorrow}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'buy' && connected) {
        return (
            <BuyOINRScreen
                vaultInfo={{ ...vaultInfo, usdcBalance: balances?.usdc, oinrBalance: balances?.oinr }}
                buyAmount={buyAmount}
                setBuyAmount={setBuyAmount}
                loading={loading}
                onBuy={handleBuyOINR}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    if (currentScreen === 'repay' && connected) {
        return (
            <RepayScreen
                vaultInfo={vaultInfo}
                repayAmount={repayAmount}
                setRepayAmount={setRepayAmount}
                loading={loading}
                onRepay={handleRepay}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

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
            <LoginScreen
                email={email}
                setEmail={setEmail}
                privateKey={privateKey}
                setPrivateKey={setPrivateKey}
                importMode={importMode}
                setImportMode={setImportMode}
                magicMode={magicMode}
                setMagicMode={setMagicMode}
                loading={loading}
                handleConnect={handleConnect}
                handleMagicLogin={handleMagicLogin}
            />
        );
    }

    // Main Home Screen
    return (
        <HomeScreen
            address={address}
            kycData={kycData}
            kycVerified={kycVerified}
            onNavigate={setCurrentScreen}
            onProfilePress={() => setCurrentScreen('profile')}
            onDisconnect={handleDisconnect}
        />
    );
}

const styles = StyleSheet.create({
    // Login Screen - Simple & Clean
    loginContainer: {
        flex: 1,
    },
    loginGradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 80,
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 80,
        marginBottom: 16,
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    loginCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#111827',
    },
    gradientBtn: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    gradientBtnInner: {
        padding: 16,
        alignItems: 'center',
    },
    gradientBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    outlineBtn: {
        borderWidth: 2,
        borderColor: '#6366F1',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    outlineBtnText: {
        color: '#6366F1',
        fontSize: 16,
        fontWeight: '600',
    },
    textBtn: {
        padding: 12,
        alignItems: 'center',
    },
    textBtnText: {
        color: '#6B7280',
        fontSize: 14,
    },
    orText: {
        textAlign: 'center',
        color: '#9CA3AF',
        marginVertical: 12,
        fontSize: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
    },

    // Original Styles (kept for backward compatibility)
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
    kycBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    kycBadgeText: {
        fontSize: 11,
        color: '#065f46',
        fontWeight: '600',
    },
    kycWarningBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    kycWarningText: {
        fontSize: 11,
        color: '#92400e',
        fontWeight: '600',
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

// Main App component with Gluestack UI and Magic Relayer
export default function App() {
    return (
        <GluestackUIProvider>
            <SafeAreaProvider>
                {/* Magic Relayer - REQUIRED for Magic authentication to work */}
                <magic.Relayer />

                {/* Main app content */}
                <AppContent />
            </SafeAreaProvider>
        </GluestackUIProvider>
    );
}
