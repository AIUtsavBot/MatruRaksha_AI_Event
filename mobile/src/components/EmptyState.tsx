import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../theme';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon = 'inbox-outline',
    title,
    message,
    action,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Icon name={icon} size={64} color={colors.textMuted} />
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
            {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxl,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionContainer: {
        marginTop: spacing.lg,
    },
});

export default EmptyState;
