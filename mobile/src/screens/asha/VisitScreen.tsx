import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../../theme';

export default function VisitScreen() {
    const todaysVisits = [
        {
            id: 1,
            name: 'Priya Sharma',
            time: '10:00 AM',
            type: 'Regular Checkup',
            status: 'pending',
        },
        {
            id: 2,
            name: 'Anjali Patel',
            time: '11:30 AM',
            type: 'Follow-up',
            status: 'completed',
        },
        {
            id: 3,
            name: 'Sunita Devi',
            time: '2:00 PM',
            type: 'New Registration',
            status: 'pending',
        },
    ];

    const getStatusColor = (status: string) => {
        return status === 'completed' ? colors.success : colors.warning;
    };

    const getStatusIcon = (status: string) => {
        return status === 'completed' ? 'check-circle' : 'clock-outline';
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Title style={styles.title}>Today's Visits</Title>
                <Text style={styles.date}>
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                    })}
                </Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                    <Card.Content style={styles.statContent}>
                        <Text style={styles.statValue}>3</Text>
                        <Text style={styles.statLabel}>Total Visits</Text>
                    </Card.Content>
                </Card>
                <Card style={styles.statCard}>
                    <Card.Content style={styles.statContent}>
                        <Text style={[styles.statValue, { color: colors.success }]}>1</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </Card.Content>
                </Card>
                <Card style={styles.statCard}>
                    <Card.Content style={styles.statContent}>
                        <Text style={[styles.statValue, { color: colors.warning }]}>2</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Visit List */}
            <Text style={styles.sectionTitle}>Scheduled Visits</Text>

            {todaysVisits.map((visit) => (
                <Card key={visit.id} style={styles.visitCard}>
                    <Card.Content style={styles.visitContent}>
                        <View style={styles.visitLeft}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: getStatusColor(visit.status) },
                                ]}
                            />
                            <View>
                                <Text style={styles.visitName}>{visit.name}</Text>
                                <Text style={styles.visitType}>{visit.type}</Text>
                                <View style={styles.timeRow}>
                                    <Icon name="clock-outline" size={14} color={colors.textMuted} />
                                    <Text style={styles.visitTime}>{visit.time}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.visitRight}>
                            <Icon
                                name={getStatusIcon(visit.status)}
                                size={24}
                                color={getStatusColor(visit.status)}
                            />
                            <Text
                                style={[
                                    styles.visitStatus,
                                    { color: getStatusColor(visit.status) },
                                ]}
                            >
                                {visit.status === 'completed' ? 'Done' : 'Pending'}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            ))}

            {/* Add Visit Button */}
            <Button
                mode="contained"
                icon="plus"
                onPress={() => { }}
                style={styles.addButton}
            >
                Schedule New Visit
            </Button>

            {/* Upcoming Section */}
            <Text style={styles.sectionTitle}>Upcoming This Week</Text>

            <Card style={styles.upcomingCard}>
                <Card.Content>
                    <View style={styles.upcomingItem}>
                        <View style={styles.upcomingDate}>
                            <Text style={styles.upcomingDay}>Tue</Text>
                            <Text style={styles.upcomingNum}>7</Text>
                        </View>
                        <View style={styles.upcomingInfo}>
                            <Text style={styles.upcomingName}>Meera Kumari</Text>
                            <Text style={styles.upcomingType}>Week 32 Checkup</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.upcomingItem}>
                        <View style={styles.upcomingDate}>
                            <Text style={styles.upcomingDay}>Thu</Text>
                            <Text style={styles.upcomingNum}>9</Text>
                        </View>
                        <View style={styles.upcomingInfo}>
                            <Text style={styles.upcomingName}>Radha Singh</Text>
                            <Text style={styles.upcomingType}>Blood Test Follow-up</Text>
                        </View>
                    </View>
                </Card.Content>
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
        paddingTop: spacing.xl,
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    date: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    statContent: {
        alignItems: 'center',
        padding: spacing.sm,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    visitCard: {
        marginBottom: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    visitContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    visitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    visitName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    visitType: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    visitTime: {
        fontSize: 12,
        color: colors.textMuted,
    },
    visitRight: {
        alignItems: 'center',
    },
    visitStatus: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: spacing.xs,
    },
    addButton: {
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: 12,
    },
    upcomingCard: {
        borderRadius: 12,
        backgroundColor: colors.surface,
        marginBottom: spacing.xl,
        ...shadows.small,
    },
    upcomingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    upcomingDate: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    upcomingDay: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    upcomingNum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    upcomingInfo: {
        flex: 1,
    },
    upcomingName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    upcomingType: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.xs,
    },
});
