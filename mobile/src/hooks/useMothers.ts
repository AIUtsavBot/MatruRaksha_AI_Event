import { useState, useEffect, useCallback } from 'react';
import { mothersApi } from '../api';
import { storageService } from '../services/storage';
import { Mother } from '../types';
import { useNetworkStatus } from './useNetworkStatus';

interface UseMothersResult {
    mothers: Mother[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * Hook to fetch and cache mothers list with offline support
 */
export function useMothers(): UseMothersResult {
    const [mothers, setMothers] = useState<Mother[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isConnected = useNetworkStatus();

    const fetchMothers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (isConnected) {
                // Fetch from API if online
                const data = await mothersApi.getAll();
                setMothers(data.mothers || []);
                // Cache for offline use
                await storageService.cacheMothers(data.mothers || []);
                await storageService.updateLastSync();
            } else {
                // Use cached data if offline
                const cachedMothers = await storageService.getCachedMothers();
                if (cachedMothers) {
                    setMothers(cachedMothers);
                } else {
                    setError('No cached data available. Please connect to the internet.');
                }
            }
        } catch (err: any) {
            console.error('Error fetching mothers:', err);

            // Try to use cached data on error
            const cachedMothers = await storageService.getCachedMothers();
            if (cachedMothers) {
                setMothers(cachedMothers);
                setError('Using cached data. Some information may be outdated.');
            } else {
                setError(err.message || 'Failed to fetch mothers');
            }
        } finally {
            setLoading(false);
        }
    }, [isConnected]);

    useEffect(() => {
        fetchMothers();
    }, [fetchMothers]);

    return {
        mothers,
        loading,
        error,
        refresh: fetchMothers,
    };
}

export default useMothers;
