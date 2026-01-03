import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { Text, Title, Card, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { analyticsApi, mothersApi } from '../../api';
import { DashboardStats, Mother } from '../../types';
import { colors, spacing, shadows } from '../../theme';
import { getRiskColor, getRiskEmoji } from '../../utils/helpers';

export default function DoctorDashboardScreen({ navigation }: any) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [highRiskMothers, setHighRiskMothers] = useState<Mother[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [dashboardData, mothersData] = await Promise.all([
                analyticsApi.getDashboardStats(),
                mothersApi.getAll({ risk_level: 'HIGH', limit: 5 }),
            ]);
            setStats(dashboardData);
            setHighRiskMothers(mothersData.mothers || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Set sample data for demo
            setStats(sampleStats);
            setHighRiskMothers(sampleHighRiskMothers);
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

    const StatCard = ({
        title,
        value,
        icon,
        color,
    }: {
        title: string;
        value: number;
        icon: string;
        color: string;
    }) => (
        <Card style={[styles.statCard, { borderLeftColor: color }]}>
            <Card.Content style={styles.statCardContent}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                    <Icon name={icon} size={24} color={color} />
                </View>
                <View>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statTitle}>{title}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    const PatientCard = ({ mother }: { mother: Mother }) => (
        <Card
            style={styles.patientCard}
            onPress={() => navigation.navigate('PatientDetail', { motherId: mother.id })}
        >
            <Card.Content style={styles.patientCardContent}>
                <Avatar.Text
                    size={48}
                    label={mother.name.charAt(0)}
                    style={[
                        styles.patientAvatar,
                        { backgroundColor: getRiskColor(mother.latest_risk_assessment?.risk_level || 'LOW') },
                    ]}
                />
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{mother.name}</Text>
                    <Text style={styles.patientDetails}>
                        Age: {mother.age || 'N/A'} | {mother.location || 'Unknown'}
                    </Text>
                    {mother.latest_risk_assessment && (
                        <View style={styles.riskBadge}>
                            <Text style={styles.riskText}>
                                {getRiskEmoji(mother.latest_risk_assessment.risk_level)}{' '}
                                {mother.latest_risk_assessment.risk_level} Risk
                            </Text>
                        </View>
                    )}
                </View>
                <Icon name="chevron-right" size={24} color={colors.textMuted} />
            </Card.Content>
        </Card>
    );

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
                    <Text style={styles.greeting}>Doctor Dashboard</Text>
                    <Title style={styles.title}>Overview</Title>
                </View>
                <View style={styles.headerBadge}>
                    <Icon name="stethoscope" size={20} color={colors.textOnPrimary} />
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    title="Total Patients"
                    value={stats?.total_mothers || 0}
                    icon="account-group"
                    color={colors.info}
                />
                <StatCard
                    title="High Risk"
                    value={stats?.high_risk_count || 0}
                    icon="alert-circle"
                    color={colors.riskHigh}
                />
                <StatCard
                    title="Moderate Risk"
                    value={stats?.moderate_risk_count || 0}
                    icon="alert"
                    color={colors.riskModerate}
                />
                <StatCard
                    title="Low Risk"
                    value={stats?.low_risk_count || 0}
                    icon="check-circle"
                    color={colors.riskLow}
                />
            </View>

            {/* High Risk Patients */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🔴 High Risk Patients</Text>
                    <Text style={styles.seeAll}>See All</Text>
                </View>

                {highRiskMothers.length > 0 ? (
                    highRiskMothers.map((mother) => (
                        <PatientCard key={mother.id} mother={mother} />
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyContent}>
                            <Icon name="check-circle-outline" size={48} color={colors.success} />
                            <Text style={styles.emptyText}>No high-risk patients</Text>
                        </Card.Content>
                    </Card>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsRow}>
                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Icon name="plus-circle" size={32} color={colors.primary} />
                            <Text style={styles.actionText}>Add Patient</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Icon name="file-document" size={32} color={colors.secondary} />
                            <Text style={styles.actionText}>Reports</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.actionCard}>
                        <Card.Content style={styles.actionContent}>
                            <Icon name="message" size={32} color={colors.accent} />
                            <Text style={styles.actionText}>Messages</Text>
                        </Card.Content>
                    </Card>
                </View>
            </View>
        </ScrollView>
    );
}

// Sample data
const sampleStats: DashboardStats = {
    total_mothers: 45,
    high_risk_count: 5,
    moderate_risk_count: 12,
    low_risk_count: 28,
    total_assessments: 156,
};

const sampleHighRiskMothers: Mother[] = [
    {
        id: 1,
        name: 'Priya Sharma',
        phone: '9876543210',
        age: 32,
        location: 'Mumbai',
        created_at: new Date().toISOString(),
        latest_risk_assessment: {
            id: '1',
            mother_id: 1,
            risk_level: 'HIGH',
            risk_score: 75,
            created_at: new Date().toISOString(),
        },
    },
    {
        id: 2,
        name: 'Anjali Patel',
        phone: '9876543211',
        age: 28,
        location: 'Delhi',
        created_at: new Date().toISOString(),
        latest_risk_assessment: {
            id: '2',
            mother_id: 2,
            risk_level: 'HIGH',
            risk_score: 68,
            created_at: new Date().toISOString(),
        },
    },
];

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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    headerBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.roleDoctor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        width: '48%',
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderLeftWidth: 4,
        ...shadows.small,
    },
    statCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.sm,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statTitle: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
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
    seeAll: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    patientCard: {
        marginBottom: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    patientCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientAvatar: {
        marginRight: spacing.md,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    patientDetails: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    riskBadge: {
        marginTop: spacing.xs,
    },
    riskText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.riskHigh,
    },
    emptyCard: {
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    emptyContent: {
        alignItems: 'center',
        padding: spacing.lg,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    actionCard: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    actionContent: {
        alignItems: 'center',
        padding: spacing.md,
    },
    actionText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});
