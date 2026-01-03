import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Title, Card, Avatar, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, shadows } from '../../theme';
import { formatDate } from '../../utils/helpers';

export default function ProfileScreen({ navigation }: any) {
    const { profile, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);
    };

    const getRoleColor = (role: string | null) => {
        switch (role) {
            case 'ADMIN':
                return colors.roleAdmin;
            case 'DOCTOR':
                return colors.roleDoctor;
            case 'ASHA_WORKER':
                return colors.roleAsha;
            default:
                return colors.primary;
        }
    };

    const getRoleLabel = (role: string | null) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrator';
            case 'DOCTOR':
                return 'Doctor';
            case 'ASHA_WORKER':
                return 'ASHA Worker';
            default:
                return 'User';
        }
    };

    const MenuItem = ({
        icon,
        title,
        subtitle,
        onPress,
        showChevron = true,
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        showChevron?: boolean;
    }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIcon}>
                <Icon name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {showChevron && (
                <Icon name="chevron-right" size={24} color={colors.textMuted} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <Card style={styles.profileCard}>
                <Card.Content style={styles.profileContent}>
                    <Avatar.Text
                        size={80}
                        label={profile?.full_name?.charAt(0) || 'U'}
                        style={[styles.avatar, { backgroundColor: getRoleColor(profile?.role || null) }]}
                    />
                    <Title style={styles.name}>{profile?.full_name || 'User'}</Title>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(profile?.role || null) + '20' }]}>
                        <Text style={[styles.roleText, { color: getRoleColor(profile?.role || null) }]}>
                            {getRoleLabel(profile?.role || null)}
                        </Text>
                    </View>
                    <Text style={styles.email}>{profile?.email}</Text>
                    {profile?.phone && (
                        <View style={styles.phoneRow}>
                            <Icon name="phone" size={14} color={colors.textSecondary} />
                            <Text style={styles.phone}>{profile.phone}</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Account Settings */}
            <Text style={styles.sectionTitle}>Account</Text>
            <Card style={styles.menuCard}>
                <MenuItem
                    icon="account-edit"
                    title="Edit Profile"
                    subtitle="Update your information"
                    onPress={() => { }}
                />
                <Divider />
                <MenuItem
                    icon="lock"
                    title="Change Password"
                    subtitle="Update your password"
                    onPress={() => { }}
                />
                <Divider />
                <MenuItem
                    icon="bell"
                    title="Notifications"
                    subtitle="Manage notification preferences"
                    onPress={() => { }}
                />
            </Card>

            {/* App Settings */}
            <Text style={styles.sectionTitle}>App Settings</Text>
            <Card style={styles.menuCard}>
                <MenuItem
                    icon="translate"
                    title="Language"
                    subtitle="English"
                    onPress={() => { }}
                />
                <Divider />
                <MenuItem
                    icon="theme-light-dark"
                    title="Appearance"
                    subtitle="Light mode"
                    onPress={() => { }}
                />
                <Divider />
                <MenuItem
                    icon="help-circle"
                    title="Help & Support"
                    onPress={() => { }}
                />
                <Divider />
                <MenuItem
                    icon="information"
                    title="About"
                    subtitle="Version 1.0.0"
                    onPress={() => { }}
                />
            </Card>

            {/* Danger Zone */}
            <Button
                mode="outlined"
                icon="logout"
                onPress={handleSignOut}
                style={styles.signOutButton}
                textColor={colors.error}
            >
                Sign Out
            </Button>

            {/* Footer */}
            <Text style={styles.footer}>
                MatruRaksha v1.0.0{'\n'}
                © 2026 MatruRaksha AI Team
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingTop: spacing.xl,
    },
    profileCard: {
        borderRadius: 16,
        backgroundColor: colors.surface,
        marginBottom: spacing.lg,
        ...shadows.small,
    },
    profileContent: {
        alignItems: 'center',
        padding: spacing.lg,
    },
    avatar: {
        marginBottom: spacing.md,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    roleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        marginBottom: spacing.sm,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    phone: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuCard: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    signOutButton: {
        marginTop: spacing.lg,
        borderColor: colors.error,
        borderRadius: 12,
    },
    footer: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
        lineHeight: 20,
    },
});
