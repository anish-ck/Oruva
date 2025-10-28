import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Header = ({
    title,
    subtitle,
    onBackPress,
    rightAction,
    gradient = true,
    style,
    ...props
}) => {
    if (gradient) {
        return (
            <LinearGradient
                colors={['#002E6E', '#00509E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, style]}
                {...props}
            >
                <View style={styles.headerContent}>
                    {onBackPress && (
                        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleGradient}>{title}</Text>
                        {subtitle && <Text style={styles.subtitleGradient}>{subtitle}</Text>}
                    </View>
                    {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.header, style]} {...props}>
            <View style={styles.headerContent}>
                {onBackPress && (
                    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                        <Text style={styles.backButtonTextDark}>←</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    backButtonText: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    backButtonTextDark: {
        fontSize: 22,
        color: '#002E6E',
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    titleGradient: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    subtitleGradient: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 2,
    },
    rightAction: {
        marginLeft: 'auto',
    },
});
