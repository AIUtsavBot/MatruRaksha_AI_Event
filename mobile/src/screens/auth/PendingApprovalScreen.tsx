import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button, Card } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme';

export default function PendingApprovalScreen() {
    const { signOut, profile, refreshProfile } = useAuth();

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.content}>
                    <Text style={styles.emoji}>⏳</Text>
                    <Title style={styles.title}>Approval Pending</Title>

                    <Text style={styles.message}>
                        Your account registration is being reviewed by an administrator.
                    </Text>

                    {profile?.email && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{profile.email}</Text>
                        </View>
                    )}

                    <Text style={styles.helperText}>
                        You will receive an email notification once your account has been approved.
                        This usually takes 24-48 hours.
                    </Text>

                    <Button
                        mode="outlined"
                        onPress={refreshProfile}
                        style={styles.refreshButton}
                        icon="refresh"
                    >
                        Check Status
                    </Button>

                    <Button
                        mode="text"
                        onPress={signOut}
                        style={styles.signOutButton}
                        textColor={colors.textSecondary}
                    >
                        Sign Out
                    </Button>
                </Card.Content>
            </Card>

            <Text style={styles.footer}>
                Need help? Contact support@matruraksha.org
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
    },
    content: {
        alignItems: 'center',
        padding: spacing.lg,
    },
    emoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 24,
    },
    infoBox: {
        backgroundColor: colors.surfaceVariant,
        padding: spacing.md,
        borderRadius: 8,
        width: '100%',
        marginBottom: spacing.lg,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    infoValue: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    helperText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    refreshButton: {
        width: '100%',
        marginBottom: spacing.sm,
    },
    signOutButton: {
        marginTop: spacing.sm,
    },
    footer: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
        marginTop: spacing.xl,
    },
});
