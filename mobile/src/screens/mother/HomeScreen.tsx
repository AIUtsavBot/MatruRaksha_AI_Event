import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Text, Title, Card, Button, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsApi } from '../../api';
import { DashboardStats } from '../../types';
import { colors, spacing, shadows } from '../../theme';
import { getRiskEmoji } from '../../utils/helpers';

export default function HomeScreen({ navigation }: any) {
    const { profile } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const dashboardStats = await analyticsApi.getDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Title style={styles.name}>{profile?.full_name || 'User'}</Title>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Avatar.Text
                        size={48}
                        label={profile?.full_name?.charAt(0) || 'U'}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.actionCard, styles.checkInCard]}
                    onPress={() => navigation.navigate('CheckIn')}
                >
                    <Icon name="clipboard-check" size={32} color={colors.textOnPrimary} />
                    <Text style={styles.actionCardTitle}>Daily Check-In</Text>
                    <Text style={styles.actionCardSubtitle}>Record your health</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, styles.timelineCard]}
                    onPress={() => navigation.navigate('Timeline')}
                >
                    <Icon name="chart-timeline-variant" size={32} color={colors.textOnPrimary} />
                    <Text style={styles.actionCardTitle}>Timeline</Text>
                    <Text style={styles.actionCardSubtitle}>View history</Text>
                </TouchableOpacity>
            </View>

            {/* Health Status Card */}
            <Card style={styles.statusCard}>
                <Card.Content>
                    <View style={styles.statusHeader}>
                        <Text style={styles.sectionTitle}>Health Status</Text>
                        <View style={[styles.riskBadge, styles.lowRiskBadge]}>
                            <Text style={styles.riskBadgeText}>{getRiskEmoji('LOW')} Low Risk</Text>
                        </View>
                    </View>

                    <View style={styles.statusGrid}>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusValue}>28</Text>
                            <Text style={styles.statusLabel}>Week</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusItem}>
                            <Text style={styles.statusValue}>118/76</Text>
                            <Text style={styles.statusLabel}>BP</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusItem}>
                            <Text style={styles.statusValue}>11.2</Text>
                            <Text style={styles.statusLabel}>Hemoglobin</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>Daily Tips</Text>
                <Card style={styles.tipCard}>
                    <Card.Content style={styles.tipContent}>
                        <Text style={styles.tipEmoji}>💧</Text>
                        <View style={styles.tipTextContainer}>
                            <Text style={styles.tipTitle}>Stay Hydrated</Text>
                            <Text style={styles.tipDescription}>
                                Drink at least 8-10 glasses of water today to stay healthy.
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.tipCard}>
                    <Card.Content style={styles.tipContent}>
                        <Text style={styles.tipEmoji}>🚶‍♀️</Text>
                        <View style={styles.tipTextContainer}>
                            <Text style={styles.tipTitle}>Light Exercise</Text>
                            <Text style={styles.tipDescription}>
                                A 20-minute walk can help improve your circulation.
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.tipCard}>
                    <Card.Content style={styles.tipContent}>
                        <Text style={styles.tipEmoji}>💊</Text>
                        <View style={styles.tipTextContainer}>
                            <Text style={styles.tipTitle}>Iron Supplement</Text>
                            <Text style={styles.tipDescription}>
                                Remember to take your iron tablet 1 hour before meals.
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </View>

            {/* Emergency Button */}
            <Button
                mode="contained"
                icon="phone-alert"
                onPress={() => { }}
                style={styles.emergencyButton}
                buttonColor={colors.error}
                textColor={colors.textOnPrimary}
            >
                Emergency Contact
            </Button>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    avatar: {
        backgroundColor: colors.primary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: 16,
        ...shadows.medium,
    },
    checkInCard: {
        backgroundColor: colors.primary,
    },
    timelineCard: {
        backgroundColor: colors.secondary,
    },
    actionCardTitle: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginTop: spacing.sm,
    },
    actionCardSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: spacing.xs,
    },
    statusCard: {
        marginBottom: spacing.lg,
        borderRadius: 16,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    riskBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 20,
    },
    lowRiskBadge: {
        backgroundColor: '#DCFCE7',
    },
    riskBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.riskLow,
    },
    statusGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    statusItem: {
        alignItems: 'center',
    },
    statusValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statusLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    statusDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },
    tipsSection: {
        marginBottom: spacing.lg,
    },
    tipCard: {
        marginTop: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    tipContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipEmoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    tipTextContainer: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    tipDescription: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    emergencyButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
        borderRadius: 12,
    },
});
