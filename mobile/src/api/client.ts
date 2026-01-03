import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401) {
            try {
                // Clear stored token
                await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

                // You could implement token refresh here
                // For now, we'll just reject and let AuthContext handle it
                console.log('Token expired, user needs to re-authenticate');
            } catch (e) {
                console.error('Error handling 401:', e);
            }
        }

        // Handle network errors
        if (!error.response) {
            console.log('Network error - possibly offline');
            return Promise.reject({
                ...error,
                message: 'Network error. Please check your connection.',
                isNetworkError: true,
            });
        }

        // Handle other errors
        const errorMessage =
            (error.response?.data as any)?.detail ||
            (error.response?.data as any)?.message ||
            error.message ||
            'An unexpected error occurred';

        return Promise.reject({
            ...error,
            message: errorMessage,
        });
    }
);

export default apiClient;
