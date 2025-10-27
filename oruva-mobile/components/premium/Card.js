import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

/**
 * Premium Card Component
 * Variants: elevated, outline, gradient
 */
export const Card = ({
    children,
    variant = 'elevated',
    padding = 'base',
    onPress,
    style,
    gradient,
}) => {
    const Container = onPress ? TouchableOpacity : View;

    const cardStyles = [
        styles.card,
        styles[variant],
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        style,
    ];

    if (variant === 'gradient' || gradient) {
        return (
            <Container
                onPress={onPress}
                activeOpacity={onPress ? 0.8 : 1}
                style={[styles.card, styles.paddingBase, style]}
            >
                <LinearGradient
                    colors={gradient || theme.colors.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    {children}
                </LinearGradient>
            </Container>
        );
    }

    return (
        <Container
            style={cardStyles}
            onPress={onPress}
            activeOpacity={onPress ? 0.9 : 1}
        >
            {children}
        </Container>
    );
};

/**
 * Info Row Component for Cards
 */
export const InfoRow = ({ label, value, icon, valueColor }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
            {icon}
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>
            {value}
        </Text>
    </View>
);

/**
 * Stat Card Component
 */
export const StatCard = ({ title, value, change, icon, color }) => (
    <Card variant="elevated" padding="lg" style={styles.statCard}>
        <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                {icon}
            </View>
            {change && (
                <View style={[styles.changeBadge, { backgroundColor: change > 0 ? theme.colors.secondary.surface : '#FEE2E2' }]}>
                    <Text style={[styles.changeText, { color: change > 0 ? theme.colors.secondary.main : theme.colors.error }]}>
                        {change > 0 ? '+' : ''}{change}%
                    </Text>
                </View>
            )}
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
    },

    // Variants
    elevated: {
        backgroundColor: theme.colors.surface.primary,
        ...theme.shadows.md,
    },
    outline: {
        backgroundColor: theme.colors.surface.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.main,
    },
    flat: {
        backgroundColor: theme.colors.background.secondary,
    },

    // Padding
    paddingNone: {
        padding: 0,
    },
    paddingSm: {
        padding: theme.spacing.sm,
    },
    paddingMd: {
        padding: theme.spacing.md,
    },
    paddingBase: {
        padding: theme.spacing.base,
    },
    paddingLg: {
        padding: theme.spacing.lg,
    },
    paddingXl: {
        padding: theme.spacing.xl,
    },

    // Gradient Card
    gradientCard: {
        padding: theme.spacing.base,
        borderRadius: theme.borderRadius.xl,
    },

    // Info Row
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginLeft: theme.spacing.sm,
    },
    infoValue: {
        ...theme.typography.label,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },

    // Stat Card
    statCard: {
        minWidth: 160,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.md,
    },
    changeText: {
        ...theme.typography.caption,
        fontWeight: '600',
    },
    statTitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    statValue: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },
});

export default Card;
