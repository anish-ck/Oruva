import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function VaultScreen({
    vaultInfo,
    depositAmount,
    setDepositAmount,
    borrowAmount,
    setBorrowAmount,
    repayAmount,
    setRepayAmount,
    buyAmount,
    setBuyAmount,
    mintAmount,
    setMintAmount,
    loading,
    onDeposit,
    onBorrow,
    onRepay,
    onBuyOINR,
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
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vault Services</Text>
                <Text style={styles.headerSubtitle}>Manage your collateral & debt</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Mint USDC */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Mint Test USDC</Text>
                    <Text style={styles.cardSubtitle}>Get testnet USDC for testing</Text>

                    <TextInput
                        placeholder="Amount (e.g., 1000)"
                        value={mintAmount}
                        onChangeText={setMintAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.buttonGradient]}
                        onPress={onMintUSDC}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#00BAF2', '#0086C9']}
                            style={styles.buttonInner}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Processing...' : 'Mint USDC'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Deposit Collateral */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Deposit Collateral</Text>
                    <Text style={styles.cardSubtitle}>Add USDC to your vault</Text>

                    <TextInput
                        placeholder="Amount (USDC)"
                        value={depositAmount}
                        onChangeText={setDepositAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={onDeposit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Processing...' : 'Deposit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Borrow oINR */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Borrow oINR</Text>
                    <Text style={styles.cardSubtitle}>Borrow against your collateral</Text>

                    <TextInput
                        placeholder="Amount (oINR)"
                        value={borrowAmount}
                        onChangeText={setBorrowAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={onBorrow}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Processing...' : 'Borrow'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Buy oINR */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Buy oINR</Text>
                    <Text style={styles.cardSubtitle}>Purchase oINR with USDC</Text>

                    <TextInput
                        placeholder="Amount (oINR)"
                        value={buyAmount}
                        onChangeText={setBuyAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.buttonSuccess]}
                        onPress={onBuyOINR}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Processing...' : 'Buy oINR'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Repay Debt */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Repay Debt</Text>
                    <Text style={styles.cardSubtitle}>Pay back your borrowed oINR</Text>

                    <TextInput
                        placeholder="Amount (oINR)"
                        value={repayAmount}
                        onChangeText={setRepayAmount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={onRepay}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Processing...' : 'Repay'}
                        </Text>
                    </TouchableOpacity>
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
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
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
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        color: '#1A1A1A',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    button: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonInner: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#00BAF2',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#002E6E',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSuccess: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonGradient: {
        padding: 0,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
