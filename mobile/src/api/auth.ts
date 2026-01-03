import apiClient from './client';
import { UserProfile } from '../types';

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: UserProfile;
}

export interface SignupResponse {
    message: string;
    status: string;
}

/**
 * Authentication API endpoints
 */
export const authApi = {
    /**
     * Sign in with email and password
     */
    signIn: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post('/auth/signin', {
            email,
            password,
        });
        return response.data;
    },

    /**
     * Sign up new user
     */
    signUp: async (
        email: string,
        password: string,
        fullName: string,
        phone?: string
    ): Promise<SignupResponse> => {
        const response = await apiClient.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
            phone,
        });
        return response.data;
    },

    /**
     * Sign out current user
     */
    signOut: async (): Promise<void> => {
        await apiClient.post('/auth/signout');
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiClient.put('/auth/profile', data);
        return response.data;
    },

    /**
     * Request password reset
     */
    requestPasswordReset: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/reset-password', { email });
        return response.data;
    },

    /**
     * Upload doctor certificate (for registration)
     */
    uploadCertificate: async (file: {
        uri: string;
        type: string;
        name: string;
    }): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file as any);

        const response = await apiClient.post('/auth/upload-cert', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Submit role request (after OAuth)
     */
    submitRoleRequest: async (
        role: 'DOCTOR' | 'ASHA_WORKER',
        certUrl?: string
    ): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/role-requests', {
            role_requested: role,
            degree_cert_url: certUrl,
        });
        return response.data;
    },
};

export default authApi;
