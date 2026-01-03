import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Title, Card, Switch, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../../theme';

export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [dailyReminders, setDailyReminders] = React.useState(true);
    const [emergencyAlerts, setEmergencyAlerts] = React.useState(true);
    const [offlineMode, setOfflineMode] = React.useState(false);

    const SettingItem = ({
        icon,
        title,
        subtitle,
        value,
        onValueChange,
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
    }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
                <Icon name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Switch value={value} onValueChange={onValueChange} color={colors.primary} />
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Title style={styles.title}>Settings</Title>

            {/* Notifications */}
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Card style={styles.card}>
                <SettingItem
                    icon="bell"
                    title="Push Notifications"
                    subtitle="Receive alerts and updates"
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                />
                <Divider />
                <SettingItem
                    icon="alarm"
                    title="Daily Reminders"
                    subtitle="Morning health check-in reminders"
                    value={dailyReminders}
                    onValueChange={setDailyReminders}
                />
                <Divider />
                <SettingItem
                    icon="alert"
                    title="Emergency Alerts"
                    subtitle="Critical health notifications"
                    value={emergencyAlerts}
                    onValueChange={setEmergencyAlerts}
                />
            </Card>

            {/* Data & Storage */}
            <Text style={styles.sectionTitle}>Data & Storage</Text>
            <Card style={styles.card}>
                <SettingItem
                    icon="cloud-off-outline"
                    title="Offline Mode"
                    subtitle="Save data for offline access"
                    value={offlineMode}
                    onValueChange={setOfflineMode}
                />
                <Divider />
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.settingIcon}>
                        <Icon name="database" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>Clear Cache</Text>
                        <Text style={styles.settingSubtitle}>Free up storage space</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.settingIcon}>
                        <Icon name="download" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>Download My Data</Text>
                        <Text style={styles.settingSubtitle}>Export health records</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>
            </Card>

            {/* Privacy & Security */}
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <Card style={styles.card}>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.settingIcon}>
                        <Icon name="shield-lock" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>Privacy Policy</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.settingIcon}>
                        <Icon name="file-document" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>Terms of Service</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.settingIcon}>
                        <Icon name="delete" size={22} color={colors.error} />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={[styles.settingTitle, { color: colors.error }]}>
                            Delete Account
                        </Text>
                        <Text style={styles.settingSubtitle}>
                            Permanently delete your account and data
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={colors.textMuted} />
                </TouchableOpacity>
            </Card>

            {/* App Info */}
            <Text style={styles.sectionTitle}>About</Text>
            <Card style={styles.card}>
                <View style={styles.aboutItem}>
                    <Text style={styles.aboutLabel}>App Version</Text>
                    <Text style={styles.aboutValue}>1.0.0</Text>
                </View>
                <Divider />
                <View style={styles.aboutItem}>
                    <Text style={styles.aboutLabel}>Build Number</Text>
                    <Text style={styles.aboutValue}>2026.01.03</Text>
                </View>
            </Card>
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
        paddingBottom: spacing.xxl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.lg,
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
    card: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    aboutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    aboutLabel: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    aboutValue: {
        fontSize: 16,
        color: colors.textSecondary,
    },
});
