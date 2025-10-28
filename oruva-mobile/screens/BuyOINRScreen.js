import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BuyOINRScreen({
    vaultInfo,
    buyAmount,
    setBuyAmount,
    loading,
    onBuy,
    onBack
}) {
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
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buy oINR</Text>
                <Text style={styles.headerSubtitle}>Purchase INR stablecoin with USDC</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Balance Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Your Balances</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>USDC Balance:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.usdcBalance || '0'} USDC</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>oINR Balance:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.oinrBalance || '0'} oINR</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Exchange Rate:</Text>
                        <Text style={[styles.infoValue, { color: '#4CAF50' }]}>1 USDC ≈ 83 oINR</Text>
                    </View>
                </View>

                {/* Buy Card */}
                <View style={styles.card}>
                    <View style={styles.cardIcon}>
                        <MaterialCommunityIcons name="cart-outline" size={48} color="#00BAF2" />
                    </View>
                    <Text style={styles.cardTitle}>Buy oINR</Text>
                    <Text style={styles.cardDescription}>
                        Convert your USDC to oINR - India's first Web3 stablecoin pegged to INR
                    </Text>

                    <TextInput
                        placeholder="Amount (USDC)"
                        value={buyAmount}
                        onChangeText={setBuyAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    {buyAmount && parseFloat(buyAmount) > 0 && (
                        <View style={styles.conversionBox}>
                            <Text style={styles.conversionLabel}>You will receive:</Text>
                            <Text style={styles.conversionValue}>
                                ≈ {(parseFloat(buyAmount) * 83).toFixed(2)} oINR
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={onBuy}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#00BAF2', '#0086C9']}
                            style={styles.buttonInner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Processing...' : 'Buy oINR'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.tipCard}>
                    <View style={styles.tipTitleContainer}>
                        <MaterialCommunityIcons name="information" size={20} color="#1565C0" />
                        <Text style={styles.tipTitle}>About oINR</Text>
                    </View>
                    <Text style={styles.tipText}>• oINR is pegged 1:1 to Indian Rupee</Text>
                    <Text style={styles.tipText}>• Backed by USDC reserves on blockchain</Text>
                    <Text style={styles.tipText}>• Instant conversion with transparent pricing</Text>
                    <Text style={styles.tipText}>• Use for payments, transfers, and DeFi</Text>
                </View>

                <View style={styles.tipCard}>
                    <View style={styles.tipTitleContainer}>
                        <MaterialCommunityIcons name="shield-check" size={20} color="#1565C0" />
                        <Text style={styles.tipTitle}>Safe & Secure</Text>
                    </View>
                    <Text style={styles.tipText}>• Smart contract audited</Text>
                    <Text style={styles.tipText}>• On-chain transparency</Text>
                    <Text style={styles.tipText}>• Non-custodial - you own your funds</Text>
                </View>

                <View style={{ height: 40 }} />
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
        paddingHorizontal: 16,
    },
    backButton: {
        marginBottom: 12,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
        flex: 1,
    },
    infoCard: {
        backgroundColor: '#fff',
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardIcon: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginBottom: 16,
        backgroundColor: '#FAFAFA',
        color: '#333',
    },
    conversionBox: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    conversionLabel: {
        fontSize: 12,
        color: '#1976D2',
        marginBottom: 4,
    },
    conversionValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1565C0',
    },
    button: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonInner: {
        padding: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tipCard: {
        backgroundColor: '#E3F2FD',
        margin: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
    },
    tipTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1565C0',
    },
    tipText: {
        fontSize: 13,
        color: '#1976D2',
        marginBottom: 4,
    },
});
