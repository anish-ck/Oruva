import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RepayScreen({
    vaultInfo,
    repayAmount,
    setRepayAmount,
    loading,
    onRepay,
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
                <Text style={styles.headerTitle}>Repay Debt</Text>
                <Text style={styles.headerSubtitle}>Pay back borrowed oINR</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Vault Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Current Vault Status</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Collateral:</Text>
                        <Text style={styles.infoValue}>{vaultInfo?.collateral || '0'} USDC</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Outstanding Debt:</Text>
                        <Text style={[styles.infoValue, { color: '#F44336' }]}>{vaultInfo?.debt || '0'} oINR</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Collateral Ratio:</Text>
                        <Text style={[styles.infoValue, { color: parseFloat(vaultInfo?.ratio) >= 150 ? '#4CAF50' : '#F44336' }]}>
                            {vaultInfo?.ratio || '0'}%
                        </Text>
                    </View>
                </View>

                {/* Repay Card */}
                <View style={styles.card}>
                    <View style={styles.cardIcon}>
                        <MaterialCommunityIcons name="credit-card-outline" size={48} color="#4CAF50" />
                    </View>
                    <Text style={styles.cardTitle}>Repay oINR</Text>
                    <Text style={styles.cardDescription}>
                        Repay your debt to improve vault health and unlock collateral
                    </Text>

                    <TextInput
                        placeholder="Amount (oINR)"
                        value={repayAmount}
                        onChangeText={setRepayAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={onRepay}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#2E7D32']}
                            style={styles.buttonInner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Processing...' : 'Repay Debt'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Info Section */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>💰 Benefits of Repaying</Text>
                    <Text style={styles.tipText}>• Improve your collateral ratio</Text>
                    <Text style={styles.tipText}>• Reduce liquidation risk</Text>
                    <Text style={styles.tipText}>• Unlock collateral for withdrawal</Text>
                    <Text style={styles.tipText}>• Full repayment allows withdrawing all collateral</Text>
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
        backgroundColor: '#E8F5E9',
        margin: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#2E7D32',
        marginBottom: 4,
    },
});
