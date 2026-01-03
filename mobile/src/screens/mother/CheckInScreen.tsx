import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import {
    Text,
    Title,
    Card,
    Button,
    TextInput,
    RadioButton,
    Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { riskApi } from '../../api';
import { storageService } from '../../services/storage';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { colors, spacing, shadows } from '../../theme';
import { SYMPTOM_OPTIONS, FEELING_OPTIONS } from '../../utils/constants';
import { RiskAssessment, HealthCheckIn } from '../../types';
import { getRiskColor, getRiskEmoji } from '../../utils/helpers';

export default function CheckInScreen() {
    const isConnected = useNetworkStatus();

    const [step, setStep] = useState(1);
    const [feeling, setFeeling] = useState<string>('good');
    const [systolicBp, setSystolicBp] = useState('');
    const [diastolicBp, setDiastolicBp] = useState('');
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RiskAssessment | null>(null);

    const toggleSymptom = (symptomId: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptomId)
                ? prev.filter((s) => s !== symptomId)
                : [...prev, symptomId]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);

        const checkInData: HealthCheckIn = {
            feeling: feeling as 'good' | 'okay' | 'not_good',
            systolic_bp: systolicBp ? parseInt(systolicBp) : undefined,
            diastolic_bp: diastolicBp ? parseInt(diastolicBp) : undefined,
            symptoms: selectedSymptoms,
            notes: notes.trim() || undefined,
        };

        try {
            if (!isConnected) {
                // Save for later sync when offline
                await storageService.savePendingCheckIn(checkInData);
                Alert.alert(
                    'Saved Offline',
                    'Your check-in has been saved and will be synced when you\'re back online.',
                    [{ text: 'OK', onPress: resetForm }]
                );
                return;
            }

            const assessment = await riskApi.submitAssessment({
                systolic_bp: checkInData.systolic_bp,
                diastolic_bp: checkInData.diastolic_bp,
                symptoms: checkInData.symptoms,
                notes: checkInData.notes,
            });

            setResult(assessment);
            setStep(4); // Show results
        } catch (error: any) {
            // If network error, save offline
            if (error.isNetworkError) {
                await storageService.savePendingCheckIn(checkInData);
                Alert.alert(
                    'Connection Issue',
                    'Your check-in has been saved locally and will sync later.'
                );
            } else {
                Alert.alert('Error', error.message || 'Failed to submit check-in');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setFeeling('good');
        setSystolicBp('');
        setDiastolicBp('');
        setSelectedSymptoms([]);
        setNotes('');
        setResult(null);
    };

    const renderStep1 = () => (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.stepTitle}>How are you feeling today?</Title>

                <View style={styles.feelingOptions}>
                    {FEELING_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.feelingCard,
                                feeling === option.id && styles.feelingCardSelected,
                                feeling === option.id && { borderColor: option.color },
                            ]}
                            onPress={() => setFeeling(option.id)}
                        >
                            <Text style={styles.feelingEmoji}>{option.emoji}</Text>
                            <Text
                                style={[
                                    styles.feelingLabel,
                                    feeling === option.id && { color: option.color },
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    mode="contained"
                    onPress={() => setStep(2)}
                    style={styles.nextButton}
                >
                    Continue
                </Button>
            </Card.Content>
        </Card>
    );

    const renderStep2 = () => (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.stepTitle}>Blood Pressure (Optional)</Title>
                <Text style={styles.stepDescription}>
                    If you measured your BP today, enter it here
                </Text>

                <View style={styles.bpContainer}>
                    <View style={styles.bpInputContainer}>
                        <TextInput
                            label="Systolic"
                            value={systolicBp}
                            onChangeText={(text) => setSystolicBp(text.replace(/\D/g, ''))}
                            keyboardType="numeric"
                            maxLength={3}
                            style={styles.bpInput}
                            mode="outlined"
                        />
                        <Text style={styles.bpSlash}>/</Text>
                        <TextInput
                            label="Diastolic"
                            value={diastolicBp}
                            onChangeText={(text) => setDiastolicBp(text.replace(/\D/g, ''))}
                            keyboardType="numeric"
                            maxLength={3}
                            style={styles.bpInput}
                            mode="outlined"
                        />
                        <Text style={styles.bpUnit}>mmHg</Text>
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <Button mode="outlined" onPress={() => setStep(1)} style={styles.backButton}>
                        Back
                    </Button>
                    <Button mode="contained" onPress={() => setStep(3)} style={styles.nextButton}>
                        Continue
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    const renderStep3 = () => (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.stepTitle}>Any Symptoms?</Title>
                <Text style={styles.stepDescription}>
                    Select any symptoms you're experiencing
                </Text>

                <View style={styles.symptomsGrid}>
                    {SYMPTOM_OPTIONS.map((symptom) => (
                        <Chip
                            key={symptom.id}
                            selected={selectedSymptoms.includes(symptom.id)}
                            onPress={() => toggleSymptom(symptom.id)}
                            style={[
                                styles.symptomChip,
                                selectedSymptoms.includes(symptom.id) && styles.symptomChipSelected,
                            ]}
                            textStyle={[
                                styles.symptomChipText,
                                selectedSymptoms.includes(symptom.id) && styles.symptomChipTextSelected,
                            ]}
                        >
                            {symptom.emoji} {symptom.label}
                        </Chip>
                    ))}
                </View>

                <TextInput
                    label="Additional Notes"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    style={styles.notesInput}
                    mode="outlined"
                    placeholder="Any other concerns or information..."
                />

                <View style={styles.buttonRow}>
                    <Button mode="outlined" onPress={() => setStep(2)} style={styles.backButton}>
                        Back
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        Submit Check-In
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    const renderResult = () => (
        <Card style={styles.resultCard}>
            <Card.Content style={styles.resultContent}>
                <View
                    style={[
                        styles.resultIconContainer,
                        { backgroundColor: getRiskColor(result!.risk_level) + '20' },
                    ]}
                >
                    <Text style={styles.resultEmoji}>{getRiskEmoji(result!.risk_level)}</Text>
                </View>

                <Title style={styles.resultTitle}>Check-In Complete!</Title>

                <View style={styles.riskContainer}>
                    <Text style={styles.riskLabel}>Risk Level</Text>
                    <Text
                        style={[styles.riskValue, { color: getRiskColor(result!.risk_level) }]}
                    >
                        {result!.risk_level}
                    </Text>
                    <Text style={styles.riskScore}>Score: {result!.risk_score}/100</Text>
                </View>

                {result!.recommendations && result!.recommendations.length > 0 && (
                    <View style={styles.recommendationsContainer}>
                        <Text style={styles.recommendationsTitle}>Recommendations</Text>
                        {result!.recommendations.map((rec, index) => (
                            <View key={index} style={styles.recommendationItem}>
                                <Icon name="check-circle" size={16} color={colors.success} />
                                <Text style={styles.recommendationText}>{rec}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <Button
                    mode="contained"
                    onPress={resetForm}
                    style={styles.doneButton}
                >
                    Done
                </Button>
            </Card.Content>
        </Card>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <Title style={styles.title}>Daily Check-In</Title>
                {!isConnected && (
                    <View style={styles.offlineBadge}>
                        <Icon name="wifi-off" size={14} color={colors.textOnPrimary} />
                        <Text style={styles.offlineText}>Offline</Text>
                    </View>
                )}
            </View>

            {/* Progress Indicator */}
            {step < 4 && (
                <View style={styles.progressContainer}>
                    {[1, 2, 3].map((s) => (
                        <View
                            key={s}
                            style={[
                                styles.progressDot,
                                s === step && styles.progressDotActive,
                                s < step && styles.progressDotCompleted,
                            ]}
                        />
                    ))}
                </View>
            )}

            {/* Step Content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && result && renderResult()}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
        gap: 4,
    },
    offlineText: {
        fontSize: 12,
        color: colors.textOnPrimary,
        fontWeight: '500',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.border,
    },
    progressDotActive: {
        backgroundColor: colors.primary,
        width: 24,
    },
    progressDotCompleted: {
        backgroundColor: colors.success,
    },
    card: {
        borderRadius: 16,
        backgroundColor: colors.surface,
        ...shadows.medium,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    stepDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    feelingOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    feelingCard: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    feelingCardSelected: {
        backgroundColor: colors.surfaceVariant,
    },
    feelingEmoji: {
        fontSize: 36,
        marginBottom: spacing.xs,
    },
    feelingLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    bpContainer: {
        marginBottom: spacing.lg,
    },
    bpInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bpInput: {
        width: 100,
        backgroundColor: colors.surface,
    },
    bpSlash: {
        fontSize: 24,
        marginHorizontal: spacing.sm,
        color: colors.textSecondary,
    },
    bpUnit: {
        fontSize: 14,
        marginLeft: spacing.sm,
        color: colors.textSecondary,
    },
    symptomsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    symptomChip: {
        backgroundColor: colors.surfaceVariant,
    },
    symptomChipSelected: {
        backgroundColor: colors.primaryLight,
    },
    symptomChipText: {
        color: colors.textSecondary,
    },
    symptomChipTextSelected: {
        color: colors.primaryDark,
    },
    notesInput: {
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
    },
    submitButton: {
        flex: 2,
    },
    resultCard: {
        borderRadius: 16,
        backgroundColor: colors.surface,
        ...shadows.medium,
    },
    resultContent: {
        alignItems: 'center',
        padding: spacing.lg,
    },
    resultIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    resultEmoji: {
        fontSize: 40,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    riskContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    riskLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    riskValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    riskScore: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    recommendationsContainer: {
        width: '100%',
        backgroundColor: colors.surfaceVariant,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    recommendationsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    recommendationText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    doneButton: {
        width: '100%',
    },
});
