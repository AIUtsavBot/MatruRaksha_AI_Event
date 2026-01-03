import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    message?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = 'large',
    message,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const content = (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size={size} color={colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );

    if (fullScreen) {
        return <View style={styles.overlay}>{content}</View>;
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    fullScreen: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default LoadingSpinner;
