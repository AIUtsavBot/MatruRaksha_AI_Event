import apiClient from './client';
import { Mother, MotherRegistration, Doctor, AshaWorker } from '../types';

export interface MothersListResponse {
    mothers: Mother[];
    total: number;
}

/**
 * Mothers API endpoints
 */
export const mothersApi = {
    /**
     * Get all mothers (for doctors/ASHA workers)
     */
    getAll: async (params?: {
        limit?: number;
        offset?: number;
        risk_level?: string;
    }): Promise<MothersListResponse> => {
        const response = await apiClient.get('/mothers', { params });
        return response.data;
    },

    /**
     * Get mother by ID
     */
    getById: async (id: number): Promise<Mother> => {
        const response = await apiClient.get(`/mothers/${id}`);
        return response.data;
    },

    /**
     * Register new mother
     */
    register: async (data: MotherRegistration): Promise<Mother> => {
        const response = await apiClient.post('/mothers/register', data);
        return response.data;
    },

    /**
     * Update mother information
     */
    update: async (id: number, data: Partial<Mother>): Promise<Mother> => {
        const response = await apiClient.put(`/mothers/${id}`, data);
        return response.data;
    },

    /**
     * Get mothers by doctor ID
     */
    getByDoctor: async (doctorId: number): Promise<Mother[]> => {
        const response = await apiClient.get(`/doctors/${doctorId}/mothers`);
        return response.data;
    },

    /**
     * Get mothers by ASHA worker ID
     */
    getByAshaWorker: async (ashaWorkerId: number): Promise<Mother[]> => {
        const response = await apiClient.get(`/asha-workers/${ashaWorkerId}/mothers`);
        return response.data;
    },

    /**
     * Assign mother to doctor
     */
    assignDoctor: async (motherId: number, doctorId: number): Promise<void> => {
        await apiClient.post(`/admin/mothers/${motherId}/assign-doctor`, {
            doctor_id: doctorId,
        });
    },

    /**
     * Assign mother to ASHA worker
     */
    assignAshaWorker: async (motherId: number, ashaWorkerId: number): Promise<void> => {
        await apiClient.post(`/admin/mothers/${motherId}/assign-asha`, {
            asha_worker_id: ashaWorkerId,
        });
    },
};

/**
 * Doctors API endpoints
 */
export const doctorsApi = {
    /**
     * Get all doctors
     */
    getAll: async (): Promise<Doctor[]> => {
        const response = await apiClient.get('/admin/doctors');
        return response.data.doctors;
    },

    /**
     * Get doctor by ID
     */
    getById: async (id: number): Promise<Doctor> => {
        const response = await apiClient.get(`/admin/doctors/${id}`);
        return response.data;
    },
};

/**
 * ASHA Workers API endpoints
 */
export const ashaWorkersApi = {
    /**
     * Get all ASHA workers
     */
    getAll: async (): Promise<AshaWorker[]> => {
        const response = await apiClient.get('/admin/asha-workers');
        return response.data.asha_workers;
    },

    /**
     * Get ASHA worker by ID
     */
    getById: async (id: number): Promise<AshaWorker> => {
        const response = await apiClient.get(`/admin/asha-workers/${id}`);
        return response.data;
    },
};

export default mothersApi;
