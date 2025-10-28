import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({
    email,
    setEmail,
    privateKey,
    setPrivateKey,
    importMode,
    setImportMode,
    magicMode,
    setMagicMode,
    loading,
    handleConnect,
    handleMagicLogin,
}) {
    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#002E6E', '#00509E', '#00BAF2']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoContent}>
                        <View style={styles.logoBanner}>
                            <View style={styles.logoCircleSymbol}>
                                <Text style={styles.logoO}>o:</Text>
                            </View>
                            <Text style={styles.oruvaText}>oruva</Text>
                        </View>
                        <Text style={styles.logoSubtitle}>Bridging India to Web3 Finance</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Flow EVM Testnet</Text>
                        </View>
                    </View>
                </View>

                {/* Login Card */}
                <View style={styles.card}>
                    {!importMode && !magicMode ? (
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Get Started</Text>
                            <Text style={styles.cardSubtitle}>Choose your preferred login method</Text>

                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.disabledButton]}
                                onPress={() => setMagicMode(true)}
                                disabled={loading}
                            >
                                <Text style={styles.primaryButtonText}>Login with Email</Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={[styles.outlineButton, loading && styles.disabledButton]}
                                onPress={handleConnect}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#00BAF2" />
                                ) : (
                                    <Text style={styles.outlineButtonText}>Create New Wallet</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => setImportMode(true)}
                            >
                                <Text style={styles.linkButtonText}>Import Existing Wallet</Text>
                            </TouchableOpacity>
                        </View>
                    ) : magicMode ? (
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Email Login</Text>
                            <Text style={styles.cardSubtitle}>We'll send a magic link to your email</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999999"
                            />

                            <TouchableOpacity
                                style={[styles.primaryButton, (loading || !email) && styles.disabledButton]}
                                onPress={handleMagicLogin}
                                disabled={loading || !email}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Send Magic Link</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => {
                                    setMagicMode(false);
                                    setEmail('');
                                }}
                            >
                                <Text style={styles.linkButtonText}>← Back to options</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>Import Wallet</Text>
                            <Text style={styles.cardSubtitle}>Enter your private key to import</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Private Key (0x...)"
                                value={privateKey}
                                onChangeText={setPrivateKey}
                                secureTextEntry={true}
                                autoCapitalize="none"
                                placeholderTextColor="#999999"
                            />

                            <TouchableOpacity
                                style={[styles.primaryButton, (loading || !privateKey) && styles.disabledButton]}
                                onPress={handleConnect}
                                disabled={loading || !privateKey}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Import Wallet</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => {
                                    setImportMode(false);
                                    setPrivateKey('');
                                }}
                            >
                                <Text style={styles.linkButtonText}>← Back to options</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        padding: 16,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    logoContent: {
        alignItems: 'center',
    },
    logoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoCircleSymbol: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoO: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: -3,
    },
    oruvaText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 3,
    },
    logoSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.95)',
        marginTop: 8,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 4,
        marginTop: 12,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 32,
    },
    cardContent: {
        gap: 16,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 14,
        fontSize: 15,
        color: '#1A1A1A',
        backgroundColor: '#FAFAFA',
    },
    primaryButton: {
        backgroundColor: '#00BAF2',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    outlineButton: {
        borderWidth: 1.5,
        borderColor: '#00BAF2',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    outlineButtonText: {
        color: '#00BAF2',
        fontSize: 15,
        fontWeight: '600',
    },
    linkButton: {
        padding: 8,
        alignItems: 'center',
    },
    linkButtonText: {
        color: '#00BAF2',
        fontSize: 14,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        color: '#999999',
        fontSize: 13,
        fontWeight: '500',
    },
});
