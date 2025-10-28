import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Card } from '../components/ui';

export default function HomeScreen({
    address,
    kycData,
    kycVerified,
    onNavigate,
    onProfilePress,
    onDisconnect
}) {
    return (
        <View style={styles.container}>
            {/* Header with Profile */}
            <LinearGradient
                colors={['#002E6E', '#00509E']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={onProfilePress}
                    >
                        <Text style={styles.profileInitial}>
                            {kycData?.name ? kycData.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.userName}>
                            {kycData?.name || 'User'}
                        </Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Text style={styles.iconText}>🔔</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* UPI Money Transfer Card */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Money Transfer</Text>

                    <View style={styles.serviceGrid}>
                        <TouchableOpacity
                            style={styles.serviceItem}
                            onPress={() => onNavigate('send')}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#00509E' }]}>
                                <Ionicons name="phone-portrait-outline" size={32} color="white" />
                            </View>
                            <Text style={styles.serviceLabel}>To Mobile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceItem}
                            onPress={() => onNavigate('send')}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#00509E' }]}>
                                <FontAwesome5 name="university" size={28} color="white" />
                            </View>
                            <Text style={styles.serviceLabel}>To Bank A/c</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceItem}
                            onPress={() => onNavigate('receive')}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#00509E' }]}>
                                <Ionicons name="person-outline" size={32} color="white" />
                            </View>
                            <Text style={styles.serviceLabel}>To Self A/c</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.secondaryGrid}>
                        <TouchableOpacity
                            style={styles.secondaryItem}
                            onPress={() => onNavigate('balances')}
                        >
                            <View style={[styles.secondaryIcon, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="chart-bar" size={28} color="#00509E" />
                            </View>
                            <Text style={styles.secondaryLabel}>Balance & History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryItem}
                            onPress={() => onNavigate('receive')}
                        >
                            <View style={[styles.secondaryIcon, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="cash-multiple" size={28} color="#00509E" />
                            </View>
                            <Text style={styles.secondaryLabel}>Receive Money</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryItem}
                            onPress={() => onNavigate('vault')}
                        >
                            <View style={[styles.secondaryIcon, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="shield-lock-outline" size={28} color="#00509E" />
                            </View>
                            <Text style={styles.secondaryLabel}>All Vault Services</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Vault & Services Card */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Vault & DeFi</Text>
                        <TouchableOpacity onPress={() => onNavigate('vault')}>
                            <Text style={styles.viewMore}>View More</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.serviceRow}>
                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('deposit')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="wallet-plus" size={32} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Deposit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('borrow')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="hand-coin-outline" size={32} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Borrow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('buy')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="cart-outline" size={32} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Buy oINR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('repay')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="credit-card-outline" size={32} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Repay</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Earn Card */}
                <Card style={styles.section}>
                    <TouchableOpacity
                        style={styles.earnCard}
                        onPress={() => onNavigate('earn')}
                    >
                        <View>
                            <Text style={styles.earnTitle}>Oruva Yield</Text>
                            <Text style={styles.earnSubtitle}>Earn 5% APY on USDC & oINR</Text>
                        </View>
                        <Text style={styles.earnArrow}>→</Text>
                    </TouchableOpacity>
                </Card>

                {/* Add INR Card */}
                {kycVerified && (
                    <Card style={styles.section}>
                        <TouchableOpacity
                            style={styles.earnCard}
                            onPress={() => onNavigate('addINR')}
                        >
                            <View>
                                <Text style={styles.earnTitle}>Add Money</Text>
                                <Text style={styles.earnSubtitle}>Add INR via Cashfree</Text>
                            </View>
                            <Text style={styles.earnArrow}>→</Text>
                        </TouchableOpacity>
                    </Card>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Scan QR Button */}
            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => onNavigate('send')}
            >
                <LinearGradient
                    colors={['#00BAF2', '#0086C9']}
                    style={styles.scanButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
                    <Text style={styles.scanText}>Scan QR</Text>
                </LinearGradient>
            </TouchableOpacity>
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#00BAF2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerCenter: {
        flex: 1,
        marginLeft: 12,
    },
    greeting: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.9,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        margin: 16,
        marginBottom: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    viewMore: {
        color: '#00BAF2',
        fontSize: 14,
        fontWeight: '600',
    },
    serviceGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    serviceItem: {
        alignItems: 'center',
        width: 80,
    },
    serviceIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceLabel: {
        fontSize: 12,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    secondaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    secondaryItem: {
        alignItems: 'center',
        width: 80,
    },
    secondaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    secondaryLabel: {
        fontSize: 11,
        color: '#666666',
        textAlign: 'center',
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    serviceBox: {
        alignItems: 'center',
        flex: 1,
    },
    serviceBoxIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceBoxLabel: {
        fontSize: 12,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    earnCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        marginTop: -8,
    },
    earnTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    earnSubtitle: {
        fontSize: 13,
        color: '#666666',
    },
    earnArrow: {
        fontSize: 24,
        color: '#4CAF50',
    },
    scanButton: {
        position: 'absolute',
        bottom: 20,
        left: '25%',
        right: '25%',
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scanButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 12,
    },
    scanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
