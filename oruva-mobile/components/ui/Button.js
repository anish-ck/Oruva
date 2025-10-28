import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Button = ({
    children,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    ...props
}) => {
    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                activeOpacity={0.8}
                {...props}
            >
                <LinearGradient
                    colors={['#00BAF2', '#0086C9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.button,
                        size === 'large' && styles.buttonLarge,
                        size === 'small' && styles.buttonSmall,
                        (disabled || loading) && styles.buttonDisabled,
                        style
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            {icon}
                            <Text style={[
                                styles.buttonText,
                                styles.buttonTextPrimary,
                                size === 'large' && styles.buttonTextLarge,
                                size === 'small' && styles.buttonTextSmall,
                            ]}>
                                {children}
                            </Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const buttonStyles = [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        variant === 'success' && styles.buttonSuccess,
        size === 'large' && styles.buttonLarge,
        size === 'small' && styles.buttonSmall,
        (disabled || loading) && styles.buttonDisabled,
        style
    ];

    const textStyles = [
        styles.buttonText,
        variant === 'primary' && styles.buttonTextPrimary,
        variant === 'secondary' && styles.buttonTextSecondary,
        variant === 'outline' && styles.buttonTextOutline,
        variant === 'ghost' && styles.buttonTextGhost,
        variant === 'danger' && styles.buttonTextDanger,
        variant === 'success' && styles.buttonTextSuccess,
        size === 'large' && styles.buttonTextLarge,
        size === 'small' && styles.buttonTextSmall,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#00BAF2' : '#FFFFFF'} />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles}>{children}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
    },
    buttonLarge: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    buttonSmall: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    buttonPrimary: {
        backgroundColor: '#00BAF2',
    },
    buttonSecondary: {
        backgroundColor: '#002E6E',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#00BAF2',
    },
    buttonGhost: {
        backgroundColor: 'transparent',
    },
    buttonDanger: {
        backgroundColor: '#E53935',
    },
    buttonSuccess: {
        backgroundColor: '#4CAF50',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    buttonTextLarge: {
        fontSize: 17,
        fontWeight: '700',
    },
    buttonTextSmall: {
        fontSize: 13,
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
    },
    buttonTextSecondary: {
        color: '#FFFFFF',
    },
    buttonTextOutline: {
        color: '#00BAF2',
    },
    buttonTextGhost: {
        color: '#00BAF2',
    },
    buttonTextDanger: {
        color: '#FFFFFF',
    },
    buttonTextSuccess: {
        color: '#FFFFFF',
    },
});
