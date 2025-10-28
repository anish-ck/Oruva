import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Card = ({ children, variant = 'default', gradient = false, style, ...props }) => {
    if (gradient) {
        return (
            <LinearGradient
                colors={variant === 'primary' ? ['#00BAF2', '#0086C9'] : ['#002E6E', '#00509E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.cardGradient, style]}
                {...props}
            >
                {children}
            </LinearGradient>
        );
    }

    const cardStyle = variant === 'warning'
        ? [styles.card, styles.cardWarning, style]
        : variant === 'success'
            ? [styles.card, styles.cardSuccess, style]
            : variant === 'accent'
                ? [styles.card, styles.cardAccent, style]
                : [styles.card, style];

    return (
        <View style={cardStyle} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardGradient: {
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardWarning: {
        backgroundColor: '#FFF4E5',
        borderWidth: 1,
        borderColor: '#FFB020',
    },
    cardSuccess: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    cardAccent: {
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: '#00BAF2',
    },
});
