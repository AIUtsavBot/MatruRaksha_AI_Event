import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Screens
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    PendingApproval: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
    const { isLoading, isAuthenticated, isPendingApproval } = useAuth();

    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                // Not authenticated - show auth screens
                isPendingApproval ? (
                    <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )
            ) : (
                // Authenticated - show main app
                <Stack.Screen name="Main" component={MainNavigator} />
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default AppNavigator;
