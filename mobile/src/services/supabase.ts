import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

// Custom storage adapter for React Native using SecureStore
const ExpoSecureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error('SecureStore getItem error:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error('SecureStore setItem error:', error);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error('SecureStore removeItem error:', error);
        }
    },
};

// Create Supabase client with React Native configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Important for React Native
    },
});

// Auth helper functions
export const supabaseAuth = {
    // Sign in with email and password
    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // Sign up with email and password
    signUp: async (email: string, password: string, metadata?: object) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    getSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // Get current user
    getUser: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    },

    // Refresh session
    refreshSession: async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return data;
    },

    // Listen to auth state changes
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Reset password
    resetPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    },

    // Update password
    updatePassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error) throw error;
    },
};

export default supabase;
