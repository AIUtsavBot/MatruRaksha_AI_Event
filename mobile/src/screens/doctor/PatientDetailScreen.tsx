import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { Text, Title, Card, Button, Avatar, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mothersApi, riskApi, timelineApi } from '../../api';
import { Mother, RiskAssessment, HealthTimeline } from '../../types';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { colors, spacing, shadows } from '../../theme';
import { formatDate, formatBP, getRiskColor, getRiskEmoji } from '../../utils/helpers';

type Props = NativeStackScreenProps<MainStackParamList, 'PatientDetail'>;

export default function PatientDetailScreen({ route, navigation }: Props) {
    const { motherId } = route.params;
    const [mother, setMother] = useState<Mother | null>(null);
    const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
    const [timeline, setTimeline] = useState<HealthTimeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [motherData, assessmentsData, timelineData] = await Promise.all([
                mothersApi.getById(motherId),
                riskApi.getByMother(motherId),
                timelineApi.getByMother(motherId, { limit: 5 }),
            ]);
            setMother(motherData);
            setAssessments(assessmentsData);
            setTimeline(timelineData);
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
            // Set sample data for demo
            setMother(sampleMother);
            setAssessments(sampleAssessments);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [motherId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading || !mother) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading patient details...</Text>
            </View>
        );
    }

    const latestAssessment = assessments[0];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Patient Header */}
            <Card style={styles.headerCard}>
                <Card.Content style={styles.headerContent}>
                    <Avatar.Text
                        size={72}
                        label={mother.name.charAt(0)}
                        style={[
                            styles.avatar,
                            { backgroundColor: getRiskColor(latestAssessment?.risk_level || 'LOW') },
                        ]}
                    />
                    <View style={styles.headerInfo}>
                        <Title style={styles.patientName}>{mother.name}</Title>
                        <Text style={styles.patientMeta}>Age: {mother.age || 'N/A'}</Text>
                        <Text style={styles.patientMeta}>{mother.location || 'Unknown location'}</Text>
                        <View style={styles.contactRow}>
                            <Icon name="phone" size={14} color={colors.textSecondary} />
                            <Text style={styles.phone}>{mother.phone}</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Risk Status */}
            {latestAssessment && (
                <Card
                    style={[
                        styles.riskCard,
                        { borderLeftColor: getRiskColor(latestAssessment.risk_level) },
                    ]}
                >
                    <Card.Content>
                        <View style={styles.riskHeader}>
                            <Text style={styles.riskTitle}>Current Risk Level</Text>
                            <Text style={styles.riskDate}>
                                {formatDate(latestAssessment.created_at)}
                            </Text>
                        </View>
                        <View style={styles.riskContent}>
                            <Text style={styles.riskEmoji}>
                                {getRiskEmoji(latestAssessment.risk_level)}
                            </Text>
                            <View>
                                <Text
                                    style={[
                                        styles.riskLevel,
                                        { color: getRiskColor(latestAssessment.risk_level) },
                                    ]}
                                >
                                    {latestAssessment.risk_level} RISK
                                </Text>
                                <Text style={styles.riskScore}>
                                    Score: {latestAssessment.risk_score}/100
                                </Text>
                            </View>
                        </View>

                        {latestAssessment.factors && latestAssessment.factors.length > 0 && (
                            <>
                                <Divider style={styles.divider} />
                                <Text style={styles.factorsTitle}>Risk Factors:</Text>
                                {latestAssessment.factors.map((factor, index) => (
                                    <View key={index} style={styles.factorItem}>
                                        <Icon name="alert-circle" size={14} color={colors.warning} />
                                        <Text style={styles.factorText}>{factor}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </Card.Content>
                </Card>
            )}

            {/* Vitals */}
            <Card style={styles.vitalsCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Latest Vitals</Text>
                    <View style={styles.vitalsGrid}>
                        <View style={styles.vitalItem}>
                            <Icon name="heart-pulse" size={24} color={colors.error} />
                            <Text style={styles.vitalValue}>
                                {latestAssessment?.systolic_bp && latestAssessment?.diastolic_bp
                                    ? formatBP(latestAssessment.systolic_bp, latestAssessment.diastolic_bp)
                                    : 'N/A'}
                            </Text>
                            <Text style={styles.vitalLabel}>Blood Pressure</Text>
                        </View>
                        <View style={styles.vitalItem}>
                            <Icon name="water" size={24} color={colors.info} />
                            <Text style={styles.vitalValue}>
                                {latestAssessment?.hemoglobin
                                    ? `${latestAssessment.hemoglobin} g/dL`
                                    : 'N/A'}
                            </Text>
                            <Text style={styles.vitalLabel}>Hemoglobin</Text>
                        </View>
                        <View style={styles.vitalItem}>
                            <Icon name="scale-bathroom" size={24} color={colors.secondary} />
                            <Text style={styles.vitalValue}>
                                {latestAssessment?.weight ? `${latestAssessment.weight} kg` : 'N/A'}
                            </Text>
                            <Text style={styles.vitalLabel}>Weight</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            {/* Medical History */}
            {mother.medical_history && (
                <Card style={styles.historyCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Medical History</Text>

                        {mother.medical_history.conditions?.length > 0 && (
                            <View style={styles.historySection}>
                                <Text style={styles.historyLabel}>Conditions:</Text>
                                <View style={styles.tagsRow}>
                                    {mother.medical_history.conditions.map((condition, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>{condition}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {mother.medical_history.medications?.length > 0 && (
                            <View style={styles.historySection}>
                                <Text style={styles.historyLabel}>Current Medications:</Text>
                                {mother.medical_history.medications.map((med, index) => (
                                    <View key={index} style={styles.medicationItem}>
                                        <Icon name="pill" size={16} color={colors.primary} />
                                        <Text style={styles.medicationText}>{med}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card.Content>
                </Card>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <Button
                    mode="contained"
                    icon="phone"
                    onPress={() => { }}
                    style={styles.actionButton}
                >
                    Call Patient
                </Button>
                <Button
                    mode="outlined"
                    icon="message"
                    onPress={() => { }}
                    style={styles.actionButton}
                >
                    Send Message
                </Button>
            </View>
        </ScrollView>
    );
}

// Sample data
const sampleMother: Mother = {
    id: 1,
    name: 'Priya Sharma',
    phone: '9876543210',
    age: 28,
    location: 'Mumbai, Maharashtra',
    gravida: 2,
    parity: 1,
    created_at: new Date().toISOString(),
    medical_history: {
        conditions: ['Gestational Diabetes', 'Mild Anemia'],
        medications: ['Folic Acid 5mg', 'Iron 100mg', 'Calcium 500mg'],
        trend_analysis: 'Improving',
    },
};

const sampleAssessments: RiskAssessment[] = [
    {
        id: '1',
        mother_id: 1,
        systolic_bp: 138,
        diastolic_bp: 88,
        hemoglobin: 10.5,
        weight: 65,
        risk_level: 'MODERATE',
        risk_score: 55,
        factors: [
            'Slightly elevated blood pressure',
            'Hemoglobin below optimal range',
        ],
        recommendations: [
            'Monitor BP daily',
            'Increase iron intake',
            'Schedule follow-up in 1 week',
        ],
        created_at: new Date().toISOString(),
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        marginBottom: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: spacing.md,
    },
    headerInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    patientMeta: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    phone: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    riskCard: {
        marginBottom: spacing.md,
        borderRadius: 12,
        borderLeftWidth: 4,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    riskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    riskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    riskDate: {
        fontSize: 12,
        color: colors.textMuted,
    },
    riskContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    riskEmoji: {
        fontSize: 48,
    },
    riskLevel: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    riskScore: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    divider: {
        marginVertical: spacing.md,
    },
    factorsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    factorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    factorText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    vitalsCard: {
        marginBottom: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    vitalsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    vitalItem: {
        alignItems: 'center',
    },
    vitalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    vitalLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    historyCard: {
        marginBottom: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    historySection: {
        marginBottom: spacing.md,
    },
    historyLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    tag: {
        backgroundColor: colors.surfaceVariant,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    medicationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    medicationText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    actionsContainer: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    actionButton: {
        borderRadius: 12,
    },
});
