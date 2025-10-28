import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BalancesScreen({ balances, vaultInfo, onBack }) {
    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#002E6E', '#00509E']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Balance & History</Text>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Wallet Balance Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Your Balances</Text>

                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <Text style={styles.balanceLabel}>USDC</Text>
                            <Text style={styles.balanceValue}>{balances?.usdc || '0'}</Text>
                        </View>

                        <View style={styles.balanceDivider} />

                        <View style={styles.balanceItem}>
                            <Text style={styles.balanceLabel}>oINR</Text>
                            <Text style={styles.balanceValue}>{balances?.oinr || '0'}</Text>
                        </View>
                    </View>
                </View>

                {/* Vault Status Card */}
                {vaultInfo && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Vault Status</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Collateral</Text>
                            <Text style={styles.infoValue}>{vaultInfo.collateral || '0'} USDC</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Debt</Text>
                            <Text style={styles.infoValue}>{vaultInfo.debt || '0'} oINR</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Collateral Value</Text>
                            <Text style={styles.infoValue}>₹{vaultInfo.collateralValueINR || '0'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Collateral Ratio</Text>
                            <Text style={styles.infoValue}>{vaultInfo.ratio || '0'}%</Text>
                        </View>

                        <View style={[styles.statusBadge, {
                            backgroundColor: vaultInfo.isHealthy ? '#E8F5E9' : '#FFEBEE'
                        }]}>
                            <Text style={[styles.statusText, {
                                color: vaultInfo.isHealthy ? '#2E7D32' : '#C62828'
                            }]}>
                                {vaultInfo.isHealthy ? 'Healthy' : 'Undercollateralized'}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        marginBottom: 8,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    balanceItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
    },
    balanceDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    balanceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#00BAF2',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    statusBadge: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
