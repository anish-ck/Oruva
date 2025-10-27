import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

/**
 * Premium Header Component
 */
export const Header = ({
    title,
    subtitle,
    leftIcon,
    onLeftPress,
    rightIcon,
    onRightPress,
    variant = 'default',
    gradient = false,
    style,
}) => {
    const HeaderContent = () => (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                {leftIcon && (
                    <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                        {leftIcon}
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.centerSection}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                )}
            </View>

            <View style={styles.rightSection}>
                {rightIcon && (
                    <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (gradient) {
        return (
            <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.wrapper, style]}
            >
                <StatusBar barStyle="light-content" />
                <HeaderContent />
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.wrapper, styles.defaultBackground, style]}>
            <StatusBar barStyle="dark-content" />
            <HeaderContent />
        </View>
    );
};

/**
 * Large Header with gradient background
 */
export const LargeHeader = ({
    title,
    subtitle,
    rightContent,
    children,
    style,
}) => {
    return (
        <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.largeWrapper, style]}
        >
            <StatusBar barStyle="light-content" />

            <View style={styles.largeHeader}>
                <View style={styles.largeTitleSection}>
                    <Text style={styles.largeTitle}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.largeSubtitle}>{subtitle}</Text>
                    )}
                </View>

                {rightContent && (
                    <View style={styles.largeRightContent}>
                        {rightContent}
                    </View>
                )}
            </View>

            {children}
        </LinearGradient>
    );
};

/**
 * Tab Header Component
 */
export const TabHeader = ({ title, rightContent, style }) => {
    return (
        <View style={[styles.tabHeader, style]}>
            <Text style={styles.tabTitle}>{title}</Text>
            {rightContent && (
                <View style={styles.tabRightContent}>
                    {rightContent}
                </View>
            )}
        </View>
    );
};

/**
 * Search Header Component
 */
export const SearchHeader = ({
    value,
    onChangeText,
    placeholder = 'Search...',
    onBack,
    onFilter,
    style,
}) => {
    return (
        <View style={[styles.searchHeader, style]}>
            <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.searchInputContainer}>
                <Ionicons
                    name="search-outline"
                    size={20}
                    color={theme.colors.text.tertiary}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.tertiary}
                    autoFocus
                />
                {value?.length > 0 && (
                    <TouchableOpacity onPress={() => onChangeText('')}>
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={theme.colors.text.tertiary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {onFilter && (
                <TouchableOpacity onPress={onFilter} style={styles.iconButton}>
                    <Ionicons name="options-outline" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // Default Header
    wrapper: {
        paddingTop: StatusBar.currentHeight || 40,
        paddingBottom: theme.spacing.base,
    },

    defaultBackground: {
        backgroundColor: theme.colors.surface.primary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        height: 56,
    },

    leftSection: {
        width: 40,
        alignItems: 'flex-start',
    },

    centerSection: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
    },

    rightSection: {
        width: 40,
        alignItems: 'flex-end',
    },

    iconButton: {
        padding: theme.spacing.xs,
    },

    title: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },

    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },

    // Large Header
    largeWrapper: {
        paddingTop: StatusBar.currentHeight || 40,
        paddingBottom: theme.spacing.xl,
    },

    largeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.base,
    },

    largeTitleSection: {
        flex: 1,
    },

    largeTitle: {
        ...theme.typography.display.medium,
        color: theme.colors.surface.primary,
        fontWeight: '700',
    },

    largeSubtitle: {
        ...theme.typography.bodyLarge,
        color: theme.colors.surface.primary,
        opacity: 0.9,
        marginTop: theme.spacing.xs,
    },

    largeRightContent: {
        marginLeft: theme.spacing.base,
    },

    // Tab Header
    tabHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.base,
        backgroundColor: theme.colors.surface.primary,
    },

    tabTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },

    tabRightContent: {
        marginLeft: theme.spacing.base,
    },

    // Search Header
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        paddingTop: StatusBar.currentHeight || 40,
        paddingBottom: theme.spacing.base,
        backgroundColor: theme.colors.surface.primary,
    },

    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing.md,
        height: 44,
        marginHorizontal: theme.spacing.sm,
    },

    searchIcon: {
        marginRight: theme.spacing.sm,
    },

    searchInput: {
        flex: 1,
        ...theme.typography.body,
        color: theme.colors.text.primary,
    },
});

export default Header;
