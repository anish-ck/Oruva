/**
 * Oruva Analytics Screen
 * Displays Dune Analytics dashboard and protocol metrics
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const DUNE_DEPOSITS_URL = 'https://dune.com/raptoraujin/oruva-deposits';
const DUNE_TRANSFERS_URL = 'https://dune.com/raptoraujin/oinr-transfer-volume';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function AnalyticsScreen({ address, onBack }) {
    const [refreshing, setRefreshing] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [selectedDashboard, setSelectedDashboard] = useState('deposits'); // 'deposits' or 'transfers'

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Reload the WebView or refetch data
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    const openInBrowser = () => {
        const url = selectedDashboard === 'deposits' ? DUNE_DEPOSITS_URL : DUNE_TRANSFERS_URL;
        Linking.openURL(url);
    };

    const getDashboardUrl = () => {
        return selectedDashboard === 'deposits' ? DUNE_DEPOSITS_URL : DUNE_TRANSFERS_URL;
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <LinearGradient colors={['#002E6E', '#00509E']} style={styles.header}>
                    <View style={styles.headerIcon}>
                        <MaterialCommunityIcons name="chart-line" size={40} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Oruva Analytics</Text>
                    <Text style={styles.headerSubtitle}>Real-time Protocol Insights</Text>
                </LinearGradient>

                {/* Quick Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Protocol Overview</Text>

                    <View style={styles.metricsGrid}>
                        <MetricCard
                            title="Total Value Locked"
                            value="4,500"
                            unit="USDC"
                            iconName="cash-multiple"
                        />
                        <MetricCard
                            title="oINR Transfers"
                            value="28"
                            iconName="swap-horizontal"
                        />
                        <MetricCard
                            title="Total Volume"
                            value="268K"
                            unit="oINR"
                            iconName="chart-timeline-variant"
                        />
                        <MetricCard
                            title="Active Days"
                            value="3"
                            iconName="calendar-check"
                        />
                    </View>
                </View>

                {/* Dashboard Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Dashboard</Text>

                    <View style={styles.dashboardSelector}>
                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                selectedDashboard === 'deposits' && styles.selectorButtonActive
                            ]}
                            onPress={() => {
                                setSelectedDashboard('deposits');
                                setShowWebView(false);
                            }}
                        >
                            <MaterialCommunityIcons
                                name="download"
                                size={24}
                                color={selectedDashboard === 'deposits' ? '#fff' : '#00509E'}
                            />
                            <Text style={[
                                styles.selectorButtonText,
                                selectedDashboard === 'deposits' && styles.selectorButtonTextActive
                            ]}>
                                Vault Deposits
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.selectorButton,
                                selectedDashboard === 'transfers' && styles.selectorButtonActive
                            ]}
                            onPress={() => {
                                setSelectedDashboard('transfers');
                                setShowWebView(false);
                            }}
                        >
                            <MaterialCommunityIcons
                                name="swap-horizontal"
                                size={24}
                                color={selectedDashboard === 'transfers' ? '#fff' : '#00509E'}
                            />
                            <Text style={[
                                styles.selectorButtonText,
                                selectedDashboard === 'transfers' && styles.selectorButtonTextActive
                            ]}>
                                oINR Transfers
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Embedded Dashboard Options */}
                <View style={styles.section}>
                    <View style={styles.dashboardHeader}>
                        <Text style={styles.sectionTitle}>
                            {selectedDashboard === 'deposits' ? 'Vault Deposits' : 'oINR Transfer Volume'}
                        </Text>
                        <TouchableOpacity
                            onPress={openInBrowser}
                            style={styles.openButton}
                        >
                            <View style={styles.openButtonContent}>
                                <Ionicons name="open-outline" size={16} color="#fff" />
                                <Text style={styles.openButtonText}>Open in Browser</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {!showWebView ? (
                        <TouchableOpacity
                            style={styles.previewCard}
                            onPress={() => setShowWebView(true)}
                        >
                            <MaterialCommunityIcons
                                name={selectedDashboard === 'deposits' ? 'download-box' : 'chart-line'}
                                size={64}
                                color="#00509E"
                            />
                            <Text style={styles.previewTitle}>
                                {selectedDashboard === 'deposits'
                                    ? 'View Vault Deposits Dashboard'
                                    : 'View Transfer Volume Dashboard'}
                            </Text>
                            <Text style={styles.previewSubtitle}>
                                Tap to load live charts and analytics
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.webviewContainer}>
                            <WebView
                                source={{ uri: getDashboardUrl() }}
                                style={styles.webview}
                                startInLoadingState={true}
                                renderLoading={() => (
                                    <View style={styles.loadingWebView}>
                                        <ActivityIndicator size="large" color="#00509E" />
                                        <Text style={styles.loadingText}>Loading Dashboard...</Text>
                                    </View>
                                )}
                                scalesPageToFit={true}
                                javaScriptEnabled={true}
                            />
                        </View>
                    )}
                </View>

                {/* Feature Cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dashboard Features</Text>

                    {selectedDashboard === 'deposits' ? (
                        <>
                            <FeatureCard
                                iconName="currency-usd"
                                title="Total Value Locked (TVL)"
                                description="Track total USDC deposited in Oruva vaults"
                            />
                            <FeatureCard
                                iconName="podium"
                                title="Top Depositors"
                                description="See which wallets have deposited the most collateral"
                            />
                            <FeatureCard
                                iconName="format-list-bulleted"
                                title="Transaction History"
                                description="View recent deposits and protocol activity"
                            />
                        </>
                    ) : (
                        <>
                            <FeatureCard
                                iconName="chart-line"
                                title="Daily Transfer Volume"
                                description="Track oINR transfer volume over time (268K total)"
                            />
                            <FeatureCard
                                iconName="swap-horizontal"
                                title="Transfer Activity"
                                description="Monitor 28 transfers across 3 days of activity"
                            />
                            <FeatureCard
                                iconName="account-multiple"
                                title="User Engagement"
                                description="See who's sending and receiving oINR payments"
                            />
                        </>
                    )}

                    <FeatureCard
                        iconName="sync"
                        title="Real-time Updates"
                        description="Data refreshes hourly from Flow blockchain"
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <MaterialCommunityIcons name="chart-donut" size={24} color="#666" />
                    <Text style={styles.footerText}>
                        Powered by Dune Analytics
                    </Text>
                    <Text style={styles.footerSubtext}>
                        Data sourced from Flow EVM Testnet
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

// Reusable Components

function MetricCard({ title, value, unit, iconName }) {
    return (
        <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
                <MaterialCommunityIcons name={iconName} size={32} color="#00509E" />
            </View>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={styles.metricValue}>
                {value}
                {unit && <Text style={styles.metricUnit}> {unit}</Text>}
            </Text>
        </View>
    );
}

function FeatureCard({ iconName, title, description }) {
    return (
        <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name={iconName} size={28} color="#00509E" />
            </View>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    backButtonContainer: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 16,
    },
    backButton: {
        paddingVertical: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#00509E',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerIcon: {
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    dashboardSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    selectorButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#00509E',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    selectorButtonActive: {
        backgroundColor: '#00509E',
        borderColor: '#00509E',
    },
    selectorButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#00509E',
    },
    selectorButtonTextActive: {
        color: '#fff',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    metricIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricTitle: {
        fontSize: 11,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#002E6E',
    },
    metricUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666',
    },
    dashboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    openButton: {
        backgroundColor: '#00509E',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    openButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    openButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    previewSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    webviewContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    webview: {
        height: 600,
        backgroundColor: 'transparent',
    },
    loadingWebView: {
        height: 600,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginTop: 8,
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#999',
    },
});
