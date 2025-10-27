import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/theme';

/**
 * Avatar Component
 */
export const Avatar = ({
    source,
    name,
    size = 'medium',
    variant = 'circle',
    showBadge,
    badgeColor,
    style,
}) => {
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const sizeMap = {
        small: 32,
        medium: 48,
        large: 64,
        xlarge: 96,
    };

    const avatarSize = sizeMap[size];

    const containerStyles = [
        styles.container,
        {
            width: avatarSize,
            height: avatarSize,
            borderRadius: variant === 'circle' ? avatarSize / 2 : theme.borderRadius.lg,
        },
        style,
    ];

    return (
        <View style={styles.wrapper}>
            {source ? (
                <Image source={source} style={containerStyles} />
            ) : (
                <LinearGradient
                    colors={theme.gradients.primary}
                    style={containerStyles}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={[
                        styles.initials,
                        { fontSize: avatarSize * 0.4 }
                    ]}>
                        {getInitials(name)}
                    </Text>
                </LinearGradient>
            )}

            {showBadge && (
                <View style={[
                    styles.badge,
                    {
                        width: avatarSize * 0.25,
                        height: avatarSize * 0.25,
                        borderRadius: avatarSize * 0.125,
                        backgroundColor: badgeColor || theme.colors.success,
                    }
                ]} />
            )}
        </View>
    );
};

/**
 * Avatar Group Component
 */
export const AvatarGroup = ({ avatars = [], max = 3, size = 'small' }) => {
    const displayAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    const sizeMap = {
        small: 32,
        medium: 48,
        large: 64,
    };

    const avatarSize = sizeMap[size];
    const overlap = avatarSize * 0.25;

    return (
        <View style={styles.group}>
            {displayAvatars.map((avatar, index) => (
                <View
                    key={index}
                    style={[
                        styles.groupAvatar,
                        {
                            marginLeft: index > 0 ? -overlap : 0,
                            zIndex: displayAvatars.length - index,
                        }
                    ]}
                >
                    <Avatar
                        source={avatar.source}
                        name={avatar.name}
                        size={size}
                        style={styles.groupAvatarBorder}
                    />
                </View>
            ))}

            {remaining > 0 && (
                <View style={[
                    styles.remainingContainer,
                    {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        marginLeft: -overlap,
                    }
                ]}>
                    <Text style={[
                        styles.remainingText,
                        { fontSize: avatarSize * 0.35 }
                    ]}>
                        +{remaining}
                    </Text>
                </View>
            )}
        </View>
    );
};

/**
 * Avatar with Info Component
 */
export const AvatarInfo = ({
    source,
    name,
    subtitle,
    size = 'medium',
    showBadge,
    badgeColor,
    rightContent,
}) => {
    return (
        <View style={styles.infoContainer}>
            <Avatar
                source={source}
                name={name}
                size={size}
                showBadge={showBadge}
                badgeColor={badgeColor}
            />

            <View style={styles.infoText}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                )}
            </View>

            {rightContent && (
                <View style={styles.rightContent}>
                    {rightContent}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
    },

    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    initials: {
        color: theme.colors.surface.primary,
        fontWeight: '700',
    },

    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: theme.colors.surface.primary,
    },

    // Avatar Group
    group: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    groupAvatar: {
        position: 'relative',
    },

    groupAvatarBorder: {
        borderWidth: 2,
        borderColor: theme.colors.surface.primary,
    },

    remainingContainer: {
        backgroundColor: theme.colors.neutral[300],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface.primary,
    },

    remainingText: {
        color: theme.colors.text.primary,
        fontWeight: '600',
    },

    // Avatar Info
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoText: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },

    name: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },

    subtitle: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },

    rightContent: {
        marginLeft: theme.spacing.md,
    },
});

export default Avatar;
