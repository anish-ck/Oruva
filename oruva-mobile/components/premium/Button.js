import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

/**
 * Premium Button Component
 * Variants: primary, secondary, outline, ghost, gradient
 */
export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
}) => {
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
    ];

    const content = (
        <>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'gradient' ? '#fff' : theme.colors.primary.main}
                    size={size === 'small' ? 'small' : 'small'}
                />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    <Text style={textStyles}>{title}</Text>
                    {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                </View>
            )}
        </>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={[styles.button, styles[size], fullWidth && styles.fullWidth]}
            >
                <LinearGradient
                    colors={theme.colors.gradient.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {content}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    // Sizes
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
    },
    medium: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        minHeight: 48,
    },
    large: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        minHeight: 56,
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary.main,
        ...theme.shadows.md,
    },
    secondary: {
        backgroundColor: theme.colors.secondary.main,
        ...theme.shadows.md,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary.main,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Text Styles
    text: {
        ...theme.typography.button,
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#FFFFFF',
    },
    outlineText: {
        color: theme.colors.primary.main,
    },
    ghostText: {
        color: theme.colors.primary.main,
    },
    gradientText: {
        color: '#FFFFFF',
    },

    smallText: {
        fontSize: 13,
    },
    mediumText: {
        fontSize: 15,
    },
    largeText: {
        fontSize: 17,
    },

    // States
    disabled: {
        opacity: 0.5,
    },

    // Layout
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.xl,
    },
});

export default Button;
