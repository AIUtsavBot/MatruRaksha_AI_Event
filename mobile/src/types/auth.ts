// User types
export type UserRole = 'ADMIN' | 'DOCTOR' | 'ASHA_WORKER' | null;

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    is_active: boolean;
    assigned_area?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserProfile | null;
    accessToken: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
}
