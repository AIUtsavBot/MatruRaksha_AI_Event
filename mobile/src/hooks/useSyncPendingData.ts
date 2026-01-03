import { useEffect, useRef, useCallback } from 'react';
import { storageService } from '../services/storage';
import { riskApi } from '../api';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook to sync pending offline data when network becomes available
 */
export function useSyncPendingData() {
    const isConnected = useNetworkStatus();
    const isSyncing = useRef(false);

    const syncPendingCheckIns = useCallback(async () => {
        if (isSyncing.current) return;
        isSyncing.current = true;

        try {
            const pendingCheckIns = await storageService.getPendingCheckIns();

            if (pendingCheckIns.length === 0) {
                console.log('No pending check-ins to sync');
                return;
            }

            console.log(`Syncing ${pendingCheckIns.length} pending check-ins...`);

            for (const checkIn of pendingCheckIns) {
                if (checkIn.synced) continue;

                try {
                    await riskApi.submitAssessment({
                        systolic_bp: checkIn.systolic_bp,
                        diastolic_bp: checkIn.diastolic_bp,
                        symptoms: checkIn.symptoms,
                        notes: checkIn.notes,
                    });

                    await storageService.markCheckInSynced(checkIn.id);
                    console.log(`Synced check-in: ${checkIn.id}`);
                } catch (error) {
                    console.error(`Failed to sync check-in ${checkIn.id}:`, error);
                }
            }

            // Clean up synced check-ins
            await storageService.clearSyncedCheckIns();
            console.log('Pending check-ins sync completed');
        } catch (error) {
            console.error('Error syncing pending data:', error);
        } finally {
            isSyncing.current = false;
        }
    }, []);

    useEffect(() => {
        if (isConnected) {
            // Sync when network becomes available
            syncPendingCheckIns();
        }
    }, [isConnected, syncPendingCheckIns]);

    return {
        syncNow: syncPendingCheckIns,
        isConnected,
    };
}

export default useSyncPendingData;
