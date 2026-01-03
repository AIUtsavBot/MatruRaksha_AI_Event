import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Text, Title, Card, Searchbar, Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { mothersApi } from '../../api';
import { Mother, RiskLevel } from '../../types';
import { colors, spacing, shadows } from '../../theme';
import { getRiskColor, getRiskEmoji, formatPhone } from '../../utils/helpers';

export default function MotherListScreen({ navigation }: any) {
    const [mothers, setMothers] = useState<Mother[]>([]);
    const [filteredMothers, setFilteredMothers] = useState<Mother[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<RiskLevel | 'ALL'>('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMothers = async () => {
        try {
            const data = await mothersApi.getAll();
            setMothers(data.mothers || []);
            setFilteredMothers(data.mothers || []);
        } catch (error) {
            console.error('Failed to fetch mothers:', error);
            // Set sample data for demo
            setMothers(sampleMothers);
            setFilteredMothers(sampleMothers);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMothers();
    }, []);

    useEffect(() => {
        filterMothers();
    }, [searchQuery, selectedFilter, mothers]);

    const filterMothers = () => {
        let filtered = mothers;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (mother) =>
                    mother.name.toLowerCase().includes(query) ||
                    mother.phone.includes(query) ||
                    mother.location?.toLowerCase().includes(query)
            );
        }

        // Filter by risk level
        if (selectedFilter !== 'ALL') {
            filtered = filtered.filter(
                (mother) =>
                    mother.latest_risk_assessment?.risk_level === selectedFilter
            );
        }

        setFilteredMothers(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMothers();
    };

    const renderMotherCard = ({ item }: { item: Mother }) => {
        const riskLevel = item.latest_risk_assessment?.risk_level || 'LOW';

        return (
            <Card
                style={styles.motherCard}
                onPress={() => navigation.navigate('PatientDetail', { motherId: item.id })}
            >
                <Card.Content style={styles.cardContent}>
                    <Avatar.Text
                        size={56}
                        label={item.name.charAt(0)}
                        style={[styles.avatar, { backgroundColor: getRiskColor(riskLevel) }]}
                    />
                    <View style={styles.motherInfo}>
                        <Text style={styles.motherName}>{item.name}</Text>
                        <View style={styles.detailsRow}>
                            <Icon name="cake-variant" size={14} color={colors.textMuted} />
                            <Text style={styles.detailText}>Age: {item.age || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Icon name="map-marker" size={14} color={colors.textMuted} />
                            <Text style={styles.detailText}>{item.location || 'Unknown'}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Icon name="phone" size={14} color={colors.textMuted} />
                            <Text style={styles.detailText}>{formatPhone(item.phone)}</Text>
                        </View>
                    </View>
                    <View style={styles.riskContainer}>
                        <Text style={styles.riskEmoji}>{getRiskEmoji(riskLevel)}</Text>
                        <Text style={[styles.riskText, { color: getRiskColor(riskLevel) }]}>
                            {riskLevel}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    const FilterChip = ({
        label,
        value,
        color,
    }: {
        label: string;
        value: RiskLevel | 'ALL';
        color?: string;
    }) => (
        <Chip
            selected={selectedFilter === value}
            onPress={() => setSelectedFilter(value)}
            style={[
                styles.filterChip,
                selectedFilter === value && { backgroundColor: color || colors.primary },
            ]}
            textStyle={[
                styles.filterChipText,
                selectedFilter === value && { color: colors.textOnPrimary },
            ]}
        >
            {label}
        </Chip>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Title style={styles.title}>Mothers</Title>
                <Text style={styles.count}>{filteredMothers.length} patients</Text>
            </View>

            {/* Search Bar */}
            <Searchbar
                placeholder="Search by name, phone, or location"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
                inputStyle={styles.searchInput}
            />

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <FilterChip label="All" value="ALL" color={colors.textSecondary} />
                <FilterChip label="🔴 High" value="HIGH" color={colors.riskHigh} />
                <FilterChip label="🟡 Moderate" value="MODERATE" color={colors.riskModerate} />
                <FilterChip label="🟢 Low" value="LOW" color={colors.riskLow} />
            </View>

            {/* Mothers List */}
            <FlatList
                data={filteredMothers}
                renderItem={renderMotherCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="account-search" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No mothers found</Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery
                                ? 'Try adjusting your search'
                                : 'Add mothers to get started'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

// Sample data
const sampleMothers: Mother[] = [
    {
        id: 1,
        name: 'Priya Sharma',
        phone: '9876543210',
        age: 28,
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
        age: 32,
        location: 'Delhi',
        created_at: new Date().toISOString(),
        latest_risk_assessment: {
            id: '2',
            mother_id: 2,
            risk_level: 'MODERATE',
            risk_score: 55,
            created_at: new Date().toISOString(),
        },
    },
    {
        id: 3,
        name: 'Sunita Devi',
        phone: '9876543212',
        age: 25,
        location: 'Jaipur',
        created_at: new Date().toISOString(),
        latest_risk_assessment: {
            id: '3',
            mother_id: 3,
            risk_level: 'LOW',
            risk_score: 25,
            created_at: new Date().toISOString(),
        },
    },
    {
        id: 4,
        name: 'Meera Kumari',
        phone: '9876543213',
        age: 30,
        location: 'Patna',
        created_at: new Date().toISOString(),
        latest_risk_assessment: {
            id: '4',
            mother_id: 4,
            risk_level: 'LOW',
            risk_score: 20,
            created_at: new Date().toISOString(),
        },
    },
    {
        id: 5,
        name: 'Radha Singh',
        phone: '9876543214',
        age: 27,
        location: 'Lucknow',
        created_at: new Date().toISOString(),
        latest_risk_assessment: {
            id: '5',
            mother_id: 5,
            risk_level: 'MODERATE',
            risk_score: 45,
            created_at: new Date().toISOString(),
        },
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        paddingTop: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    count: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    searchbar: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: 12,
        elevation: 0,
    },
    searchInput: {
        fontSize: 14,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.xs,
    },
    filterChip: {
        backgroundColor: colors.surfaceVariant,
    },
    filterChipText: {
        fontSize: 12,
    },
    listContent: {
        padding: spacing.md,
        paddingTop: 0,
    },
    motherCard: {
        marginBottom: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...shadows.small,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: spacing.md,
    },
    motherInfo: {
        flex: 1,
    },
    motherName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: 2,
    },
    detailText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    riskContainer: {
        alignItems: 'center',
    },
    riskEmoji: {
        fontSize: 28,
    },
    riskText: {
        fontSize: 10,
        fontWeight: '600',
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
