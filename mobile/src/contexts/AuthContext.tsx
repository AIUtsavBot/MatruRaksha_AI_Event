import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { supabase, supabaseAuth } from '../services/supabase';
import { authApi } from '../api';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notifications';
import { UserProfile, UserRole } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
    // State
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Auth methods
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;

    // Helpers
    hasRole: (role: UserRole) => boolean;
    isPendingApproval: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from backend
    const fetchProfile = useCallback(async () => {
        try {
            const userProfile = await authApi.getProfile();
            setProfile(userProfile);
            await storageService.cacheUserProfile(userProfile);
            return userProfile;
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Try to get cached profile
            const cachedProfile = await storageService.getCachedUserProfile();
            if (cachedProfile) {
                setProfile(cachedProfile);
                return cachedProfile;
            }
            return null;
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Get existing session
                const { data: { session: existingSession } } = await supabase.auth.getSession();

                if (mounted) {
                    setSession(existingSession);
                    setUser(existingSession?.user ?? null);

                    if (existingSession?.access_token) {
                        await SecureStore.setItemAsync(
                            STORAGE_KEYS.ACCESS_TOKEN,
                            existingSession.access_token
                        );
                        await fetchProfile();
                    }

                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log('Auth state changed:', event);

                if (mounted) {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);

                    if (newSession?.access_token) {
                        await SecureStore.setItemAsync(
                            STORAGE_KEYS.ACCESS_TOKEN,
                            newSession.access_token
                        );
                        await fetchProfile();

                        // Register for push notifications on sign in
                        if (event === 'SIGNED_IN') {
                            const pushToken = await notificationService.registerForPushNotifications();
                            if (pushToken) {
                                await notificationService.registerTokenWithBackend(pushToken);
                            }
                        }
                    } else {
                        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                        setProfile(null);
                        await storageService.clearAllCache();
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await supabaseAuth.signIn(email, password);
            // Auth state listener will handle the rest
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Sign up new user
    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        phone?: string
    ) => {
        setIsLoading(true);
        try {
            await supabaseAuth.signUp(email, password, {
                full_name: fullName,
                phone,
            });
            // Note: User may need email confirmation depending on Supabase settings
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        setIsLoading(true);
        try {
            await supabaseAuth.signOut();
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            setSession(null);
            setUser(null);
            setProfile(null);
            await storageService.clearAllCache();
            await notificationService.cancelAllScheduledNotifications();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh profile from server
    const refreshProfile = async () => {
        await fetchProfile();
    };

    // Check if user has specific role
    const hasRole = (role: UserRole): boolean => {
        return profile?.role === role;
    };

    // Check if user is pending approval
    const isPendingApproval = profile?.role === null && session !== null;

    const value: AuthContextType = {
        session,
        user,
        profile,
        isLoading,
        isAuthenticated: !!session && !!profile?.role,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        hasRole,
        isPendingApproval,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
