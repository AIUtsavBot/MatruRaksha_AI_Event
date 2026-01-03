import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { RiskLevel } from '../types';
import { colors, spacing } from '../theme';
import { getRiskColor, getRiskEmoji } from '../utils/helpers';

interface RiskBadgeProps {
    level: RiskLevel;
    size?: 'small' | 'medium' | 'large';
    showEmoji?: boolean;
}

export function RiskBadge({
    level,
    size = 'medium',
    showEmoji = true,
}: RiskBadgeProps) {
    const color = getRiskColor(level);
    const emoji = getRiskEmoji(level);

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    container: styles.containerSmall,
                    text: styles.textSmall,
                    emoji: styles.emojiSmall,
                };
            case 'large':
                return {
                    container: styles.containerLarge,
                    text: styles.textLarge,
                    emoji: styles.emojiLarge,
                };
            default:
                return {
                    container: styles.containerMedium,
                    text: styles.textMedium,
                    emoji: styles.emojiMedium,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    return (
        <View style={[styles.container, sizeStyles.container, { backgroundColor: color + '20' }]}>
            {showEmoji && <Text style={sizeStyles.emoji}>{emoji}</Text>}
            <Text style={[sizeStyles.text, { color }]}>{level} Risk</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
    },
    containerSmall: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        gap: 4,
    },
    containerMedium: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        gap: 6,
    },
    containerLarge: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: 8,
    },
    textSmall: {
        fontSize: 10,
        fontWeight: '600',
    },
    textMedium: {
        fontSize: 12,
        fontWeight: '600',
    },
    textLarge: {
        fontSize: 14,
        fontWeight: '600',
    },
    emojiSmall: {
        fontSize: 10,
    },
    emojiMedium: {
        fontSize: 14,
    },
    emojiLarge: {
        fontSize: 18,
    },
});

export default RiskBadge;
