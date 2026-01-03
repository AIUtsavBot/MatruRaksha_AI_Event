import { MD3LightTheme, configureFonts } from 'react-native-paper';

// Color palette
export const colors = {
    // Primary colors (Green - Medical/Health)
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',

    // Secondary colors (Blue - Trust)
    secondary: '#3B82F6',
    secondaryLight: '#60A5FA',
    secondaryDark: '#2563EB',

    // Accent colors
    accent: '#8B5CF6',

    // Risk level colors
    riskHigh: '#EF4444',
    riskModerate: '#F59E0B',
    riskLow: '#10B981',

    // Role colors
    roleDoctor: '#3B82F6',
    roleAsha: '#10B981',
    roleAdmin: '#8B5CF6',
    roleMother: '#EC4899',

    // Neutral colors
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Border colors
    border: '#E5E7EB',
    borderDark: '#D1D5DB',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
};

// Typography configuration
const fontConfig = {
    displayLarge: {
        fontFamily: 'System',
        fontSize: 57,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 64,
    },
    displayMedium: {
        fontFamily: 'System',
        fontSize: 45,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 52,
    },
    displaySmall: {
        fontFamily: 'System',
        fontSize: 36,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 44,
    },
    headlineLarge: {
        fontFamily: 'System',
        fontSize: 32,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 40,
    },
    headlineMedium: {
        fontFamily: 'System',
        fontSize: 28,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 36,
    },
    headlineSmall: {
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 32,
    },
    titleLarge: {
        fontFamily: 'System',
        fontSize: 22,
        fontWeight: '500' as const,
        letterSpacing: 0,
        lineHeight: 28,
    },
    titleMedium: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '500' as const,
        letterSpacing: 0.15,
        lineHeight: 24,
    },
    titleSmall: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '500' as const,
        letterSpacing: 0.1,
        lineHeight: 20,
    },
    bodyLarge: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '400' as const,
        letterSpacing: 0.15,
        lineHeight: 24,
    },
    bodyMedium: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '400' as const,
        letterSpacing: 0.25,
        lineHeight: 20,
    },
    bodySmall: {
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '400' as const,
        letterSpacing: 0.4,
        lineHeight: 16,
    },
    labelLarge: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '500' as const,
        letterSpacing: 0.1,
        lineHeight: 20,
    },
    labelMedium: {
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '500' as const,
        letterSpacing: 0.5,
        lineHeight: 16,
    },
    labelSmall: {
        fontFamily: 'System',
        fontSize: 11,
        fontWeight: '500' as const,
        letterSpacing: 0.5,
        lineHeight: 16,
    },
};

// Create the theme
export const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: colors.primary,
        primaryContainer: colors.primaryLight,
        secondary: colors.secondary,
        secondaryContainer: colors.secondaryLight,
        tertiary: colors.accent,
        background: colors.background,
        surface: colors.surface,
        surfaceVariant: colors.surfaceVariant,
        error: colors.error,
        onPrimary: colors.textOnPrimary,
        onSecondary: colors.textOnPrimary,
        onBackground: colors.textPrimary,
        onSurface: colors.textPrimary,
        onSurfaceVariant: colors.textSecondary,
        outline: colors.border,
        outlineVariant: colors.borderDark,
    },
    fonts: configureFonts({ config: fontConfig }),
    roundness: 12,
};

// Spacing scale
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Shadow presets
export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
};

export default theme;
