/**
 * Profile Tab - Account Info & Transaction History
 * Shows wallet details, balances, and transaction history
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Clipboard,
    RefreshControl,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import walletService from '../src/services/wallet';
import vaultService from '../src/services/vault';
import { ethers } from 'ethers';

export default function ProfileTab({ onLogout }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accountInfo, setAccountInfo] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [balances, setBalances] = useState({ usdc: '0', oinr: '0' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const address = walletService.address;

            // Get balances
            const balanceInfo = await vaultService.getBalances(address);
            setBalances(balanceInfo);

            // Get vault info
            const vaultInfo = await vaultService.getVaultInfo(address);

            // Get transaction history from provider
            const txHistory = await getTransactionHistory(address);

            setAccountInfo({
                address,
                isMagicWallet: walletService.isMagicWallet,
                vaultInfo,
            });

            setTransactions(txHistory);
            setLoading(false);
        } catch (error) {
            console.error('Error loading profile data:', error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const getTransactionHistory = async (address) => {
        try {
            // For now, return empty array as transaction history requires an indexer service
            // In production, you would use:
            // - Flowscan API
            // - The Graph indexer
            // - Moralis API
            // - Or your own backend indexer

            console.log('Transaction history requires indexer service - showing placeholder');
            return [];

            // Placeholder data structure for when you implement indexer:
            /*
            return [
              {
                hash: '0x123...',
                from: '0xabc...',
                to: '0xdef...',
                value: '0.0',
                timestamp: Date.now() / 1000,
                blockNumber: 12345,
              }
            ];
            */
        } catch (error) {
            console.error('Error getting transaction history:', error);
            return [];
        }
    };

    const copyAddress = () => {
        Clipboard.setString(accountInfo.address);
        Alert.alert('Copied!', 'Address copied to clipboard');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: onLogout,
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={40} color="#00BAF2" />
                </View>
                <Text style={styles.headerTitle}>My Account</Text>
                <View style={styles.walletTypeContainer}>
                    {accountInfo?.isMagicWallet ? (
                        <>
                            <MaterialCommunityIcons name="magic-staff" size={16} color="#E3F2FD" />
                            <Text style={styles.walletType}>Magic Wallet</Text>
                        </>
                    ) : (
                        <>
                            <MaterialIcons name="security" size={16} color="#E3F2FD" />
                            <Text style={styles.walletType}>Self-Custody Wallet</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Address Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Wallet Address</Text>
                <TouchableOpacity onPress={copyAddress} style={styles.addressContainer}>
                    <Text style={styles.address}>
                        {accountInfo?.address?.slice(0, 6)}...{accountInfo?.address?.slice(-4)}
                    </Text>
                    <MaterialIcons name="content-copy" size={20} color="#00BAF2" />
                </TouchableOpacity>
                <Text style={styles.copyHint}>Tap to copy full address</Text>
            </View>

            {/* Balances Card */}
            <View style={styles.card}>
                <View style={styles.cardTitleContainer}>
                    <MaterialCommunityIcons name="wallet" size={20} color="#00BAF2" />
                    <Text style={styles.cardTitleWithIcon}>Token Balances</Text>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>USDC:</Text>
                    <Text style={styles.balanceValue}>{balances.usdc}</Text>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>oINR:</Text>
                    <Text style={styles.balanceValue}>{balances.oinr}</Text>
                </View>
            </View>

            {/* Vault Info Card */}
            <View style={styles.card}>
                <View style={styles.cardTitleContainer}>
                    <MaterialCommunityIcons name="bank" size={20} color="#00BAF2" />
                    <Text style={styles.cardTitleWithIcon}>Vault Status</Text>
                </View>
                <View style={styles.vaultRow}>
                    <Text style={styles.vaultLabel}>Collateral (USDC):</Text>
                    <Text style={styles.vaultValue}>{accountInfo?.vaultInfo?.collateral}</Text>
                </View>
                <View style={styles.vaultRow}>
                    <Text style={styles.vaultLabel}>Debt (oINR):</Text>
                    <Text style={styles.vaultValue}>{accountInfo?.vaultInfo?.debt}</Text>
                </View>
                <View style={styles.vaultRow}>
                    <Text style={styles.vaultLabel}>Collateral Ratio:</Text>
                    <Text
                        style={[
                            styles.vaultValue,
                            parseFloat(accountInfo?.vaultInfo?.ratio || 0) >= 150
                                ? styles.healthyRatio
                                : styles.unhealthyRatio,
                        ]}
                    >
                        {accountInfo?.vaultInfo?.ratio}%
                    </Text>
                </View>
                <View style={styles.healthIndicator}>
                    <Text style={styles.healthLabel}>Health:</Text>
                    <View style={styles.healthStatusContainer}>
                        {accountInfo?.vaultInfo?.isHealthy ? (
                            <>
                                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                                <Text style={styles.healthyText}>Healthy</Text>
                            </>
                        ) : (
                            <>
                                <MaterialIcons name="warning" size={16} color="#F44336" />
                                <Text style={styles.unhealthyText}>At Risk</Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            {/* Transaction History */}
            <View style={styles.card}>
                <View style={styles.cardTitleContainer}>
                    <MaterialIcons name="receipt-long" size={20} color="#00BAF2" />
                    <Text style={styles.cardTitleWithIcon}>Recent Transactions</Text>
                </View>
                {transactions.length === 0 ? (
                    <View style={styles.noTransactionsContainer}>
                        <Text style={styles.noTransactions}>No transaction history available</Text>
                        <Text style={styles.noTransactionsHint}>
                            Transaction history requires an indexer service.{'\n'}
                            You can view your transactions on Flowscan.
                        </Text>
                        <TouchableOpacity
                            style={styles.explorerButton}
                            onPress={() => {
                                // In future, open browser to flowscan
                                Alert.alert('Explorer', `View on Flowscan:\nhttps://evm-testnet.flowscan.io/address/${accountInfo?.address}`);
                            }}
                        >
                            <MaterialIcons name="open-in-new" size={16} color="white" />
                            <Text style={styles.explorerButtonText}>View on Flowscan</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    transactions.map((tx, index) => (
                        <View key={tx.hash} style={styles.txItem}>
                            <View style={styles.txHeader}>
                                <View style={styles.txTypeContainer}>
                                    {tx.from.toLowerCase() === accountInfo?.address?.toLowerCase() ? (
                                        <>
                                            <MaterialIcons name="call-made" size={16} color="#F44336" />
                                            <Text style={styles.txType}>Sent</Text>
                                        </>
                                    ) : (
                                        <>
                                            <MaterialIcons name="call-received" size={16} color="#4CAF50" />
                                            <Text style={styles.txType}>Received</Text>
                                        </>
                                    )}
                                </View>
                                <Text style={styles.txValue}>{parseFloat(tx.value).toFixed(4)} FLOW</Text>
                            </View>
                            <Text style={styles.txHash}>
                                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                            </Text>
                            <Text style={styles.txTime}>
                                Block #{tx.blockNumber}
                            </Text>
                        </View>
                    ))
                )}
            </View>

            {/* Network Info */}
            <View style={styles.card}>
                <View style={styles.cardTitleContainer}>
                    <MaterialCommunityIcons name="web" size={20} color="#00BAF2" />
                    <Text style={styles.cardTitleWithIcon}>Network</Text>
                </View>
                <View style={styles.networkRow}>
                    <Text style={styles.networkLabel}>Chain:</Text>
                    <Text style={styles.networkValue}>Flow EVM Testnet</Text>
                </View>
                <View style={styles.networkRow}>
                    <Text style={styles.networkLabel}>Chain ID:</Text>
                    <Text style={styles.networkValue}>545</Text>
                </View>
                <View style={styles.networkRow}>
                    <Text style={styles.networkLabel}>RPC:</Text>
                    <Text style={styles.networkValue} numberOfLines={1}>
                        testnet.evm.nodes.onflow.org
                    </Text>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color="#FF3B30" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#002E6E',
        padding: 30,
        alignItems: 'center',
        paddingTop: 60,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    walletTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    walletType: {
        fontSize: 14,
        color: '#E3F2FD',
    },
    card: {
        backgroundColor: 'white',
        margin: 15,
        marginBottom: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
    },
    cardTitleWithIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 8,
    },
    address: {
        fontSize: 16,
        fontFamily: 'monospace',
        color: '#333',
    },
    copyHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    balanceLabel: {
        fontSize: 16,
        color: '#666',
    },
    balanceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    vaultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    vaultLabel: {
        fontSize: 14,
        color: '#666',
    },
    vaultValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    healthyRatio: {
        color: '#4CAF50',
    },
    unhealthyRatio: {
        color: '#F44336',
    },
    healthIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    healthLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    healthStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    healthyText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    unhealthyText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F44336',
    },
    txItem: {
        padding: 12,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        marginBottom: 10,
    },
    txHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    txTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    txType: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    txValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00BAF2',
    },
    txHash: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#666',
        marginBottom: 3,
    },
    txTime: {
        fontSize: 11,
        color: '#999',
    },
    noTransactionsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noTransactions: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    noTransactionsHint: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginBottom: 15,
        lineHeight: 18,
    },
    explorerButton: {
        backgroundColor: '#00BAF2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    explorerButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    networkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    networkLabel: {
        fontSize: 14,
        color: '#666',
    },
    networkValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    logoutButton: {
        backgroundColor: '#F44336',
        margin: 15,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
