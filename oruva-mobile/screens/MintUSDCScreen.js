import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MintUSDCScreen({
    vaultInfo,
    mintAmount,
    setMintAmount,
    loading,
    onMintUSDC,
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
                <Text style={styles.headerTitle}>Mint USDC</Text>
                <Text style={styles.headerSubtitle}>Get testnet USDC for testing</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Balance Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Current Balance</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>USDC Balance:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.usdcBalance || '0'} USDC</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Wallet Address:</Text>
                        <Text style={[styles.infoValue, { fontSize: 10 }]} numberOfLines={1} ellipsizeMode="middle">
                            {vaultInfo?.address || 'Not connected'}
                        </Text>
                    </View>
                </View>

                {/* Mint Card */}
                <View style={styles.card}>
                    <View style={styles.cardIcon}>
                        <MaterialCommunityIcons name="cash-plus" size={56} color="#4CAF50" />
                    </View>
                    <Text style={styles.cardTitle}>Mint Test USDC</Text>
                    <Text style={styles.cardDescription}>
                        Mint free testnet USDC tokens to test the Oruva platform
                    </Text>

                    <TextInput
                        placeholder="Amount (USDC)"
                        value={mintAmount}
                        onChangeText={setMintAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <View style={styles.quickAmountContainer}>
                        <Text style={styles.quickAmountLabel}>Quick amount:</Text>
                        <View style={styles.quickAmountButtons}>
                            <TouchableOpacity
                                style={styles.quickAmountButton}
                                onPress={() => setMintAmount('100')}
                            >
                                <Text style={styles.quickAmountText}>100</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickAmountButton}
                                onPress={() => setMintAmount('500')}
                            >
                                <Text style={styles.quickAmountText}>500</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickAmountButton}
                                onPress={() => setMintAmount('1000')}
                            >
                                <Text style={styles.quickAmountText}>1000</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={onMintUSDC}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#2E7D32']}
                            style={styles.buttonInner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Minting...' : 'Mint USDC'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>ℹ️ About Testnet USDC</Text>
                    <Text style={styles.tipText}>• Free testnet tokens for development</Text>
                    <Text style={styles.tipText}>• No real value - for testing only</Text>
                    <Text style={styles.tipText}>• Use to test deposits, borrows, and swaps</Text>
                    <Text style={styles.tipText}>• Available on Flow EVM Testnet</Text>
                </View>

                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>🚀 Next Steps</Text>
                    <Text style={styles.tipText}>1. Mint USDC tokens</Text>
                    <Text style={styles.tipText}>2. Deposit as collateral in Vault</Text>
                    <Text style={styles.tipText}>3. Borrow oINR against your collateral</Text>
                    <Text style={styles.tipText}>4. Use oINR for payments and transfers</Text>
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
        flex: 1,
        textAlign: 'right',
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
    quickAmountContainer: {
        marginBottom: 16,
    },
    quickAmountLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    quickAmountButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    quickAmountButton: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    quickAmountText: {
        color: '#1565C0',
        fontSize: 14,
        fontWeight: '600',
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
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1565C0',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#1976D2',
        marginBottom: 4,
    },
});
