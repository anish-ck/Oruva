import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Badge = ({ 
    children, 
    variant = 'default',
    size = 'medium',
    style,
    ...props 
}) => {
    const badgeStyles = [
        styles.badge,
        variant === 'success' && styles.badgeSuccess,
        variant === 'warning' && styles.badgeWarning,
        variant === 'error' && styles.badgeError,
        variant === 'info' && styles.badgeInfo,
        variant === 'primary' && styles.badgePrimary,
        size === 'small' && styles.badgeSmall,
        size === 'large' && styles.badgeLarge,
        style
    ];

    const textStyles = [
        styles.badgeText,
        variant === 'success' && styles.badgeTextSuccess,
        variant === 'warning' && styles.badgeTextWarning,
        variant === 'error' && styles.badgeTextError,
        variant === 'info' && styles.badgeTextInfo,
        variant === 'primary' && styles.badgeTextPrimary,
        size === 'small' && styles.badgeTextSmall,
        size === 'large' && styles.badgeTextLarge,
    ];

    return (
        <View style={badgeStyles} {...props}>
            <Text style={textStyles}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#F5F5F5',
        alignSelf: 'flex-start',
    },
    badgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeLarge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    badgeSuccess: {
        backgroundColor: '#E8F5E9',
    },
    badgeWarning: {
        backgroundColor: '#FFF4E5',
    },
    badgeError: {
        backgroundColor: '#FFEBEE',
    },
    badgeInfo: {
        backgroundColor: '#E3F2FD',
    },
    badgePrimary: {
        backgroundColor: '#E1F5FE',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333333',
    },
    badgeTextSmall: {
        fontSize: 10,
    },
    badgeTextLarge: {
        fontSize: 13,
    },
    badgeTextSuccess: {
        color: '#2E7D32',
    },
    badgeTextWarning: {
        color: '#F57C00',
    },
    badgeTextError: {
        color: '#C62828',
    },
    badgeTextInfo: {
        color: '#1565C0',
    },
    badgeTextPrimary: {
        color: '#00838F',
    },
});
