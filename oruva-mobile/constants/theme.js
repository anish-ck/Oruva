/**
 * Oruva Premium Design System
 * Modern, sophisticated color palette and design tokens
 */

export const theme = {
    colors: {
        // Primary Brand Colors - Sophisticated Purple/Blue
        primary: {
            main: '#6366F1',      // Indigo 500
            light: '#818CF8',     // Indigo 400
            dark: '#4F46E5',      // Indigo 600
            surface: '#EEF2FF',   // Indigo 50
        },

        // Secondary Colors - Success Green
        secondary: {
            main: '#10B981',      // Emerald 500
            light: '#34D399',     // Emerald 400
            dark: '#059669',      // Emerald 600
            surface: '#D1FAE5',   // Emerald 100
        },

        // Accent Colors
        accent: {
            purple: '#8B5CF6',    // Violet 500
            pink: '#EC4899',      // Pink 500
            orange: '#F59E0B',    // Amber 500
            blue: '#3B82F6',      // Blue 500
        },

        // Neutral Colors - Modern Gray Scale
        neutral: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
        },

        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Background
        background: {
            primary: '#FFFFFF',
            secondary: '#F9FAFB',
            tertiary: '#F3F4F6',
            dark: '#111827',
        },

        // Surface/Card
        surface: {
            primary: '#FFFFFF',
            elevated: '#FFFFFF',
            overlay: 'rgba(0, 0, 0, 0.5)',
        },

        // Text
        text: {
            primary: '#111827',
            secondary: '#6B7280',
            tertiary: '#9CA3AF',
            disabled: '#D1D5DB',
            inverse: '#FFFFFF',
        },

        // Border
        border: {
            light: '#F3F4F6',
            main: '#E5E7EB',
            dark: '#D1D5DB',
        },

        // Special Effects
        gradients: {
            primary: ['#6366F1', '#8B5CF6'],
            success: ['#10B981', '#059669'],
            sunset: ['#F59E0B', '#EC4899'],
            ocean: ['#3B82F6', '#6366F1'],
        },
    },

    // Spacing Scale (8px base)
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        '2xl': 32,
        '3xl': 40,
        '4xl': 48,
        '5xl': 64,
    },

    // Border Radius
    borderRadius: {
        xs: 4,
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 20,
        '3xl': 24,
        full: 9999,
    },

    // Typography
    typography: {
        // Display
        display: {
            large: {
                fontSize: 40,
                lineHeight: 48,
                fontWeight: '700',
                letterSpacing: -0.5,
            },
            medium: {
                fontSize: 36,
                lineHeight: 44,
                fontWeight: '700',
                letterSpacing: -0.5,
            },
            small: {
                fontSize: 32,
                lineHeight: 40,
                fontWeight: '700',
                letterSpacing: -0.25,
            },
        },

        // Headings
        h1: {
            fontSize: 28,
            lineHeight: 36,
            fontWeight: '700',
            letterSpacing: -0.25,
        },
        h2: {
            fontSize: 24,
            lineHeight: 32,
            fontWeight: '700',
            letterSpacing: 0,
        },
        h3: {
            fontSize: 20,
            lineHeight: 28,
            fontWeight: '600',
            letterSpacing: 0,
        },
        h4: {
            fontSize: 18,
            lineHeight: 26,
            fontWeight: '600',
            letterSpacing: 0,
        },

        // Body
        bodyLarge: {
            fontSize: 16,
            lineHeight: 24,
            fontWeight: '400',
            letterSpacing: 0.15,
        },
        body: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '400',
            letterSpacing: 0.25,
        },
        bodySmall: {
            fontSize: 12,
            lineHeight: 16,
            fontWeight: '400',
            letterSpacing: 0.4,
        },

        // Label
        label: {
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '500',
            letterSpacing: 0.1,
        },
        labelSmall: {
            fontSize: 12,
            lineHeight: 16,
            fontWeight: '500',
            letterSpacing: 0.5,
        },

        // Caption
        caption: {
            fontSize: 11,
            lineHeight: 14,
            fontWeight: '400',
            letterSpacing: 0.4,
        },

        // Button
        button: {
            fontSize: 15,
            lineHeight: 20,
            fontWeight: '600',
            letterSpacing: 0.5,
        },
    },

    // Shadows - Premium elevation system
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 24,
            elevation: 12,
        },
        colored: {
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        },
    },

    // Animation Durations
    animation: {
        fast: 150,
        normal: 250,
        slow: 350,
    },
};

// Dark Theme
export const darkTheme = {
    ...theme,
    colors: {
        ...theme.colors,

        // Override for dark mode
        background: {
            primary: '#111827',
            secondary: '#1F2937',
            tertiary: '#374151',
            dark: '#000000',
        },

        surface: {
            primary: '#1F2937',
            elevated: '#374151',
            overlay: 'rgba(255, 255, 255, 0.1)',
        },

        text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
            tertiary: '#9CA3AF',
            disabled: '#6B7280',
            inverse: '#111827',
        },

        border: {
            light: '#374151',
            main: '#4B5563',
            dark: '#6B7280',
        },
    },
};

export default theme;
