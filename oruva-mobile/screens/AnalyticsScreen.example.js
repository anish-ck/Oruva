/**
 * Example: How to use Dune Analytics in Oruva Mobile App
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AnalyticsScreen({ address }) {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, [address]);

    async function loadAnalytics() {
        try {
            // Fetch protocol metrics
            const protocolResponse = await axios.get(`${BACKEND_URL}/api/analytics/protocol`);
            setMetrics(protocolResponse.data.data);

            // Fetch user-specific analytics
            if (address) {
                const userResponse = await axios.get(`${BACKEND_URL}/api/analytics/user/${address}`);
                setUserAnalytics(userResponse.data.data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00509E" />
                <Text style={styles.loadingText}>Loading Analytics...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#002E6E', '#00509E']} style={styles.header}>
                <Text style={styles.headerTitle}>📊 Oruva Analytics</Text>
                <Text style={styles.headerSubtitle}>Real-time Protocol Insights</Text>
            </LinearGradient>

            {/* Protocol Metrics */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Protocol Overview</Text>

                <View style={styles.metricsGrid}>
                    <MetricCard
                        title="Total Value Locked"
                        value={metrics?.tvl?.[0]?.total_tvl_usdc || '0'}
                        unit="USDC"
                        icon="💰"
                    />
                    <MetricCard
                        title="Active Users"
                        value={metrics?.activeUsers?.[0]?.daily_active_users || '0'}
                        icon="👥"
                    />
                    <MetricCard
                        title="Daily Volume"
                        value={metrics?.dailyVolume?.[0]?.deposit_volume || '0'}
                        unit="USDC"
                        icon="📈"
                    />
                    <MetricCard
                        title="Total Transactions"
                        value={metrics?.dailyVolume?.[0]?.transaction_count || '0'}
                        icon="🔄"
                    />
                </View>
            </View>

            {/* Embedded Dune Dashboard */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Live Dashboard</Text>
                <View style={styles.chartContainer}>
                    <WebView
                        source={{
                            uri: 'https://dune.com/embeds/your-query-id/your-viz-id'
                        }}
                        style={styles.webview}
                        scrollEnabled={false}
                    />
                </View>
            </View>

            {/* User Analytics (if logged in) */}
            {address && userAnalytics && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Activity</Text>

                    <View style={styles.userMetrics}>
                        <UserMetricRow
                            label="Total Transactions"
                            value={userAnalytics.total_transactions || 0}
                        />
                        <UserMetricRow
                            label="Total Deposits"
                            value={`${userAnalytics.total_deposits || 0} USDC`}
                        />
                        <UserMetricRow
                            label="Total Borrows"
                            value={`${userAnalytics.total_borrows || 0} oINR`}
                        />
                        <UserMetricRow
                            label="First Transaction"
                            value={new Date(userAnalytics.first_transaction).toLocaleDateString()}
                        />
                    </View>
                </View>
            )}

            {/* Individual Charts */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detailed Metrics</Text>

                {/* Daily Active Users Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Daily Active Users (30 Days)</Text>
                    <WebView
                        source={{
                            uri: 'https://dune.com/embeds/daily-users-query/chart-viz'
                        }}
                        style={styles.chart}
                        scrollEnabled={false}
                    />
                </View>

                {/* Transaction Volume Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Transaction Volume</Text>
                    <WebView
                        source={{
                            uri: 'https://dune.com/embeds/volume-query/chart-viz'
                        }}
                        style={styles.chart}
                        scrollEnabled={false}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

// Reusable Components

function MetricCard({ title, value, unit, icon }) {
    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>{icon}</Text>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={styles.metricValue}>
                {typeof value === 'number' ? value.toLocaleString() : value}
                {unit && <Text style={styles.metricUnit}> {unit}</Text>}
            </Text>
        </View>
    );
}

function UserMetricRow({ label, value }) {
    return (
        <View style={styles.userMetricRow}>
            <Text style={styles.userMetricLabel}>{label}</Text>
            <Text style={styles.userMetricValue}>{value}</Text>
        </View>
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
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 32,
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
    },
    metricIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    metricTitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
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
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    webview: {
        height: 300,
        backgroundColor: 'transparent',
    },
    chart: {
        height: 250,
        backgroundColor: 'transparent',
    },
    userMetrics: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userMetricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    userMetricLabel: {
        fontSize: 14,
        color: '#666',
    },
    userMetricValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
