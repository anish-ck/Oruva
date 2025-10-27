import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../constants/theme';

/**
 * Badge Component for status indicators
 */
export const Badge = ({
    children,
    variant = 'primary',
    size = 'medium',
    style
}) => {
    const containerStyles = [
        styles.badge,
        styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        styles[`badge${size.charAt(0).toUpperCase() + size.slice(1)}`],
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    ];

    return (
        <View style={containerStyles}>
            <Text style={textStyles}>{children}</Text>
        </View>
    );
};

/**
 * Dot Badge for notifications
 */
export const DotBadge = ({ count, max = 99, variant = 'primary', size = 'medium' }) => {
    if (count === 0 || count === null || count === undefined) return null;

    const displayCount = count > max ? `${max}+` : count;

    return (
        <View style={[
            styles.dotBadge,
            styles[`dotBadge${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
            styles[`dotBadge${size.charAt(0).toUpperCase() + size.slice(1)}`],
        ]}>
            <Text style={styles.dotText}>{displayCount}</Text>
        </View>
    );
};

/**
 * Status Badge with dot indicator
 */
export const StatusBadge = ({ status, label, showDot = true }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
            case 'verified':
            case 'active':
                return theme.colors.success;
            case 'warning':
            case 'pending':
                return theme.colors.warning;
            case 'error':
            case 'failed':
            case 'rejected':
                return theme.colors.error;
            case 'info':
            default:
                return theme.colors.primary.main;
        }
    };

    const color = getStatusColor();

    return (
        <View style={styles.statusBadge}>
            {showDot && (
                <View style={[styles.statusDot, { backgroundColor: color }]} />
            )}
            <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
    );
};

/**
 * Icon Badge (for wrapping icons with badge indicators)
 */
export const IconBadge = ({ children, count, showDot = false }) => {
    return (
        <View style={styles.iconBadgeContainer}>
            {children}
            {showDot && count > 0 && (
                <View style={styles.iconDot} />
            )}
            {!showDot && count > 0 && (
                <DotBadge count={count} size="small" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Main Badge
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 9999,
        alignSelf: 'flex-start',
    },

    badgePrimary: {
        backgroundColor: '#6366F115',
    },

    badgeSuccess: {
        backgroundColor: '#10B98115',
    },

    badgeWarning: {
        backgroundColor: '#F59E0B15',
    },

    badgeError: {
        backgroundColor: '#EF444415',
    },

    badgeSecondary: {
        backgroundColor: '#10B98115',
    },

    badgeNeutral: {
        backgroundColor: '#F3F4F6',
    },

    // Badge Sizes
    badgeSmall: {
        paddingHorizontal: 4,
        paddingVertical: 2,
    },

    badgeMedium: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    badgeLarge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },

    // Badge Text
    text: {
        fontSize: 14,
        fontWeight: '600',
    },

    textSmall: {
        fontSize: 10,
    },

    textMedium: {
        fontSize: 12,
    },

    textLarge: {
        fontSize: 14,
    },

    // Dot Badge
    dotBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    dotBadgePrimary: {
        backgroundColor: '#6366F1',
    },

    dotBadgeSuccess: {
        backgroundColor: '#10B981',
    },

    dotBadgeWarning: {
        backgroundColor: '#F59E0B',
    },

    dotBadgeError: {
        backgroundColor: '#EF4444',
    },

    dotBadgeSmall: {
        minWidth: 16,
        height: 16,
        paddingHorizontal: 4,
    },

    dotBadgeMedium: {
        minWidth: 20,
        height: 20,
        paddingHorizontal: 5,
    },

    dotBadgeLarge: {
        minWidth: 24,
        height: 24,
        paddingHorizontal: 6,
    },

    dotText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },

    // Status Badge
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F9FAFB',
        borderRadius: 9999,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },

    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },

    // Icon Badge
    iconBadgeContainer: {
        position: 'relative',
    },

    iconDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
});

export default Badge;
