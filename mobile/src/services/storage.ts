import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CACHE_DURATION } from '../utils/constants';
import { HealthCheckIn, Mother, RiskAssessment } from '../types';

interface CachedData<T> {
    data: T;
    cachedAt: number;
}

interface PendingCheckIn extends HealthCheckIn {
    id: string;
    timestamp: number;
    synced: boolean;
}

/**
 * Offline storage service for caching data and handling offline operations
 */
export const storageService = {
    // ==================== Generic Cache Operations ====================

    /**
     * Save data to cache with timestamp
     */
    cacheData: async <T>(key: string, data: T): Promise<void> => {
        try {
            const cacheEntry: CachedData<T> = {
                data,
                cachedAt: Date.now(),
            };
            await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
        } catch (error) {
            console.error(`Failed to cache data for key ${key}:`, error);
        }
    },

    /**
     * Get cached data if not expired
     */
    getCachedData: async <T>(
        key: string,
        maxAge: number = CACHE_DURATION.MEDIUM
    ): Promise<T | null> => {
        try {
            const cached = await AsyncStorage.getItem(key);
            if (!cached) return null;

            const cacheEntry: CachedData<T> = JSON.parse(cached);
            const isExpired = Date.now() - cacheEntry.cachedAt > maxAge;

            if (isExpired) {
                await AsyncStorage.removeItem(key);
                return null;
            }

            return cacheEntry.data;
        } catch (error) {
            console.error(`Failed to get cached data for key ${key}:`, error);
            return null;
        }
    },

    /**
     * Clear specific cached data
     */
    clearCache: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to clear cache for key ${key}:`, error);
        }
    },

    /**
     * Clear all cached data
     */
    clearAllCache: async (): Promise<void> => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(
                (key) =>
                    key.startsWith('cached_') ||
                    key === STORAGE_KEYS.CACHED_MOTHERS ||
                    key === STORAGE_KEYS.LAST_SYNC
            );
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.error('Failed to clear all cache:', error);
        }
    },

    // ==================== Pending Check-ins (Offline Queue) ====================

    /**
     * Save a check-in for later sync when offline
     */
    savePendingCheckIn: async (checkIn: HealthCheckIn): Promise<void> => {
        try {
            const pendingCheckIn: PendingCheckIn = {
                ...checkIn,
                id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                synced: false,
            };

            const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
            const pending: PendingCheckIn[] = existing ? JSON.parse(existing) : [];
            pending.push(pendingCheckIn);

            await AsyncStorage.setItem(
                STORAGE_KEYS.PENDING_CHECKINS,
                JSON.stringify(pending)
            );

            console.log('Saved pending check-in:', pendingCheckIn.id);
        } catch (error) {
            console.error('Failed to save pending check-in:', error);
            throw error;
        }
    },

    /**
     * Get all pending check-ins
     */
    getPendingCheckIns: async (): Promise<PendingCheckIn[]> => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get pending check-ins:', error);
            return [];
        }
    },

    /**
     * Mark a check-in as synced
     */
    markCheckInSynced: async (id: string): Promise<void> => {
        try {
            const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
            if (!existing) return;

            const pending: PendingCheckIn[] = JSON.parse(existing);
            const updated = pending.map((item) =>
                item.id === id ? { ...item, synced: true } : item
            );

            await AsyncStorage.setItem(
                STORAGE_KEYS.PENDING_CHECKINS,
                JSON.stringify(updated)
            );
        } catch (error) {
            console.error('Failed to mark check-in as synced:', error);
        }
    },

    /**
     * Remove synced check-ins
     */
    clearSyncedCheckIns: async (): Promise<void> => {
        try {
            const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
            if (!existing) return;

            const pending: PendingCheckIn[] = JSON.parse(existing);
            const unsynced = pending.filter((item) => !item.synced);

            await AsyncStorage.setItem(
                STORAGE_KEYS.PENDING_CHECKINS,
                JSON.stringify(unsynced)
            );
        } catch (error) {
            console.error('Failed to clear synced check-ins:', error);
        }
    },

    /**
     * Clear all pending check-ins
     */
    clearAllPendingCheckIns: async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_CHECKINS);
        } catch (error) {
            console.error('Failed to clear pending check-ins:', error);
        }
    },

    // ==================== Mother Data Cache ====================

    /**
     * Cache mothers list
     */
    cacheMothers: async (mothers: Mother[]): Promise<void> => {
        await storageService.cacheData<Mother[]>(STORAGE_KEYS.CACHED_MOTHERS, mothers);
    },

    /**
     * Get cached mothers
     */
    getCachedMothers: async (): Promise<Mother[] | null> => {
        return storageService.getCachedData<Mother[]>(
            STORAGE_KEYS.CACHED_MOTHERS,
            CACHE_DURATION.MEDIUM
        );
    },

    // ==================== User Profile Cache ====================

    /**
     * Cache user profile
     */
    cacheUserProfile: async (profile: any): Promise<void> => {
        await storageService.cacheData(STORAGE_KEYS.USER_PROFILE, profile);
    },

    /**
     * Get cached user profile
     */
    getCachedUserProfile: async (): Promise<any | null> => {
        return storageService.getCachedData(
            STORAGE_KEYS.USER_PROFILE,
            CACHE_DURATION.LONG
        );
    },

    // ==================== Sync Status ====================

    /**
     * Update last sync timestamp
     */
    updateLastSync: async (): Promise<void> => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
        } catch (error) {
            console.error('Failed to update last sync:', error);
        }
    },

    /**
     * Get last sync timestamp
     */
    getLastSync: async (): Promise<number | null> => {
        try {
            const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
            return timestamp ? parseInt(timestamp, 10) : null;
        } catch (error) {
            console.error('Failed to get last sync:', error);
            return null;
        }
    },

    /**
     * Check if sync is needed
     */
    isSyncNeeded: async (maxAge: number = CACHE_DURATION.SHORT): Promise<boolean> => {
        const lastSync = await storageService.getLastSync();
        if (!lastSync) return true;
        return Date.now() - lastSync > maxAge;
    },
};

export default storageService;
