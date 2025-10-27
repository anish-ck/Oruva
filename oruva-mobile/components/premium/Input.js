import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

/**
 * Premium Input Component with floating label
 */
export const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    helperText,
    icon,
    rightIcon,
    secureTextEntry,
    disabled,
    multiline,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const inputStyles = [
        styles.input,
        icon && styles.inputWithIcon,
        multiline && styles.multiline,
        error && styles.inputError,
        disabled && styles.disabled,
    ];

    const containerStyles = [
        styles.container,
        isFocused && styles.containerFocused,
        error && styles.containerError,
    ];

    return (
        <View style={[styles.wrapper, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={containerStyles}>
                {icon && (
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                )}

                <TextInput
                    style={inputStyles}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.tertiary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={secureTextEntry && !showPassword}
                    editable={!disabled}
                    multiline={multiline}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.iconContainer}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={theme.colors.text.tertiary}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <View style={styles.iconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>

            {(error || helperText) && (
                <Text style={[styles.helperText, error && styles.errorText]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
};

/**
 * Amount Input Component
 */
export const AmountInput = ({
    value,
    onChangeText,
    currency = '₹',
    placeholder = '0.00',
    style,
}) => {
    return (
        <View style={[styles.amountContainer, style]}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
                style={styles.amountInput}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="decimal-pad"
            />
        </View>
    );
};

/**
 * Search Input Component
 */
export const SearchInput = ({ value, onChangeText, placeholder = 'Search...', style }) => {
    return (
        <View style={[styles.searchContainer, style]}>
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
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: theme.spacing.base,
    },

    label: {
        ...theme.typography.label,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1.5,
        borderColor: theme.colors.border.main,
        paddingHorizontal: theme.spacing.base,
        minHeight: 52,
    },

    containerFocused: {
        borderColor: theme.colors.primary.main,
        backgroundColor: theme.colors.surface.primary,
        ...theme.shadows.sm,
    },

    containerError: {
        borderColor: theme.colors.error,
    },

    input: {
        flex: 1,
        ...theme.typography.bodyLarge,
        color: theme.colors.text.primary,
        paddingVertical: theme.spacing.md,
    },

    inputWithIcon: {
        paddingLeft: 0,
    },

    multiline: {
        minHeight: 100,
        paddingTop: theme.spacing.md,
        textAlignVertical: 'top',
    },

    inputError: {
        color: theme.colors.error,
    },

    disabled: {
        opacity: 0.5,
    },

    iconContainer: {
        marginRight: theme.spacing.sm,
    },

    helperText: {
        ...theme.typography.caption,
        color: theme.colors.text.tertiary,
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },

    errorText: {
        color: theme.colors.error,
    },

    // Amount Input
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        borderWidth: 1.5,
        borderColor: theme.colors.border.main,
    },

    currencySymbol: {
        ...theme.typography.h1,
        color: theme.colors.text.secondary,
        marginRight: theme.spacing.sm,
    },

    amountInput: {
        flex: 1,
        ...theme.typography.display.medium,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },

    // Search Input
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing.base,
        height: 44,
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

export default Input;
