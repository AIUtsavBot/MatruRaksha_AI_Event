import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { Text, Title, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { timelineApi } from '../../api';
import { HealthTimeline } from '../../types';
import { colors, spacing, shadows } from '../../theme';
import { formatDate, getRelativeTime } from '../../utils/helpers';

export default function TimelineScreen() {
    const [timeline, setTimeline] = useState<HealthTimeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTimeline = async () => {
        try {
            // Using a placeholder mother ID - in production, get from context
            const data = await timelineApi.getByMother(1, { limit: 50 });
            setTimeline(data);
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
            // Set sample data for demo
            setTimeline(sampleTimeline);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTimeline();
    };

    const getEventIcon = (eventType: string): { name: string; color: string } => {
        switch (eventType.toLowerCase()) {
            case 'checkin':
                return { name: 'clipboard-check', color: colors.primary };
            case 'risk_assessment':
                return { name: 'hospital-box', color: colors.secondary };
            case 'blood_test':
                return { name: 'water', color: colors.error };
            case 'ultrasound':
                return { name: 'image-filter-hdr', color: colors.accent };
            case 'milestone':
                return { name: 'star', color: colors.warning };
            case 'appointment':
                return { name: 'calendar-check', color: colors.info };
            case 'symptom':
                return { name: 'alert-circle', color: colors.warning };
            default:
                return { name: 'circle', color: colors.textMuted };
        }
    };

    const renderTimelineItem = ({ item, index }: { item: HealthTimeline; index: number }) => {
        const icon = getEventIcon(item.event_type);
        const isLast = index === timeline.length - 1;

        return (
            <View style={styles.timelineItem}>
                {/* Timeline Line */}
                <View style={styles.timelineLine}>
                    <View style={[styles.iconCircle, { backgroundColor: icon.color + '20' }]}>
                        <Icon name={icon.name} size={20} color={icon.color} />
                    </View>
                    {!isLast && <View style={styles.connector} />}
                </View>

                {/* Content */}
                <Card style={styles.eventCard}>
                    <Card.Content>
                        <View style={styles.eventHeader}>
                            <Text style={styles.eventType}>{formatEventType(item.event_type)}</Text>
                            <Text style={styles.eventTime}>{getRelativeTime(item.event_date)}</Text>
                        </View>

                        {item.summary && (
                            <Text style={styles.eventSummary}>{item.summary}</Text>
                        )}

                        <View style={styles.eventDetails}>
                            {item.blood_pressure && (
                                <View style={styles.detailItem}>
                                    <Icon name="heart-pulse" size={16} color={colors.textSecondary} />
                                    <Text style={styles.detailText}>BP: {item.blood_pressure}</Text>
                                </View>
                            )}
                            {item.hemoglobin && (
                                <View style={styles.detailItem}>
                                    <Icon name="water" size={16} color={colors.textSecondary} />
                                    <Text style={styles.detailText}>Hb: {item.hemoglobin} g/dL</Text>
                                </View>
                            )}
                            {item.weight && (
                                <View style={styles.detailItem}>
                                    <Icon name="scale-bathroom" size={16} color={colors.textSecondary} />
                                    <Text style={styles.detailText}>{item.weight} kg</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.eventDate}>{formatDate(item.event_date)}</Text>
                    </Card.Content>
                </Card>
            </View>
        );
    };

    const formatEventType = (type: string): string => {
        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading timeline...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Health Timeline</Title>
                <Text style={styles.subtitle}>Your pregnancy journey</Text>
            </View>

            <FlatList
                data={timeline}
                renderItem={renderTimelineItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="timeline-outline" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No events yet</Text>
                        <Text style={styles.emptySubtext}>
                            Your health journey will appear here
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

// Sample data for demo purposes
const sampleTimeline: HealthTimeline[] = [
    {
        id: 1,
        mother_id: 1,
        event_date: new Date().toISOString(),
        event_type: 'checkin',
        blood_pressure: '118/76',
        summary: 'Feeling good today. No symptoms reported.',
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        mother_id: 1,
        event_date: new Date(Date.now() - 86400000).toISOString(),
        event_type: 'blood_test',
        hemoglobin: 11.2,
        summary: 'Blood test results - all values normal.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 3,
        mother_id: 1,
        event_date: new Date(Date.now() - 86400000 * 3).toISOString(),
        event_type: 'milestone',
        summary: 'Completed Week 28! 🎉',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: 4,
        mother_id: 1,
        event_date: new Date(Date.now() - 86400000 * 5).toISOString(),
        event_type: 'appointment',
        blood_pressure: '120/78',
        weight: 65,
        summary: 'Regular prenatal checkup with Dr. Meera Shah.',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
        id: 5,
        mother_id: 1,
        event_date: new Date(Date.now() - 86400000 * 7).toISOString(),
        event_type: 'ultrasound',
        summary: 'Baby growth on track. All parameters normal.',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: spacing.md,
        paddingTop: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    timelineLine: {
        width: 40,
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    connector: {
        flex: 1,
        width: 2,
        backgroundColor: colors.border,
        marginVertical: spacing.xs,
    },
    eventCard: {
        flex: 1,
        marginLeft: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    eventType: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    eventTime: {
        fontSize: 12,
        color: colors.textMuted,
    },
    eventSummary: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    eventDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    detailText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    eventDate: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
});
