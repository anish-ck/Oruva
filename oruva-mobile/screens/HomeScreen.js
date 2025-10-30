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
                            onPress={() => onNavigate('addINR')}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#00509E' }]}>
                                <FontAwesome5 name="university" size={28} color="white" />
                            </View>
                            <Text style={styles.serviceLabel}>To Bank A/c</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceItem}
                            onPress={() => onNavigate('earn')}
                        >
                            <View style={[styles.serviceIcon, { backgroundColor: '#00509E' }]}>
                                <MaterialCommunityIcons name="piggy-bank" size={32} color="white" />
                            </View>
                            <Text style={styles.serviceLabel}>Oruva Yield</Text>
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
                            onPress={() => onNavigate('analytics')}
                        >
                            <View style={[styles.secondaryIcon, { backgroundColor: '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="chart-line" size={28} color="#00509E" />
                            </View>
                            <Text style={styles.secondaryLabel}>Analytics</Text>
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

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.serviceScrollContainer}
                    >
                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('mintusdc')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="cash-plus" size={40} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Mint USDC</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('deposit')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="wallet-plus" size={40} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Deposit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('borrow')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="hand-coin-outline" size={40} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Borrow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('buy')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="cart-outline" size={40} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Buy oINR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.serviceBox}
                            onPress={() => onNavigate('repay')}
                        >
                            <View style={styles.serviceBoxIcon}>
                                <MaterialCommunityIcons name="credit-card-outline" size={40} color="#00509E" />
                            </View>
                            <Text style={styles.serviceBoxLabel}>Repay</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Card>

                {/* Promotional Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.promoScrollView}
                    contentContainerStyle={styles.promoContainer}
                    snapToInterval={200}
                    decelerationRate="fast"
                >
                    <TouchableOpacity
                        style={styles.promoCard}
                        onPress={() => onNavigate('earn')}
                    >
                        <LinearGradient
                            colors={['#6B4CFF', '#4C3FD6']}
                            style={styles.promoGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.promoIconContainer}>
                                <MaterialCommunityIcons name="piggy-bank" size={40} color="#FFD700" />
                            </View>
                            <Text style={styles.promoTitle}>Oruva Yield</Text>
                            <Text style={styles.promoSubtitle}>Earn 5% APY</Text>
                            <Text style={styles.promoDescription}>On USDC & oINR deposits</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.promoCard}
                        onPress={() => onNavigate('addINR')}
                    >
                        <LinearGradient
                            colors={['#6B4CFF', '#4C3FD6']}
                            style={styles.promoGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.promoIconContainer}>
                                <MaterialCommunityIcons name="wallet-plus" size={40} color="#FFD700" />
                            </View>
                            <Text style={styles.promoTitle}>Add Money</Text>
                            <Text style={styles.promoSubtitle}>Instant Deposit</Text>
                            <Text style={styles.promoDescription}>Get oINR via Cashfree</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>

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
    serviceScrollContainer: {
        paddingRight: 16,
        gap: 16,
    },
    serviceBox: {
        alignItems: 'center',
        width: 85,
    },
    serviceBoxIcon: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceBoxLabel: {
        fontSize: 12,
        color: '#1A1A1A',
        textAlign: 'center',
        fontWeight: '500',
    },
    promoScrollView: {
        marginTop: 8,
    },
    promoContainer: {
        paddingHorizontal: 15,
        gap: 12,
    },
    promoCard: {
        width: 180,
        marginRight: 12,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    promoGradient: {
        padding: 16,
        minHeight: 160,
        justifyContent: 'space-between',
    },
    promoIconContainer: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    promoSubtitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFD700',
        marginBottom: 4,
    },
    promoDescription: {
        fontSize: 12,
        color: '#E8E8FF',
        opacity: 0.9,
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
