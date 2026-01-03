import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status
 */
export function useNetworkStatus(): boolean {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected ?? true);
        });

        // Check initial state
        NetInfo.fetch().then((state) => {
            setIsConnected(state.isConnected ?? true);
        });

        return () => unsubscribe();
    }, []);

    return isConnected;
}

export default useNetworkStatus;
