import apiClient from './client';
import {
    RiskAssessment,
    RiskAssessmentInput,
    HealthTimeline,
    DashboardStats,
} from '../types';

/**
 * Risk Assessment API endpoints
 */
export const riskApi = {
    /**
     * Submit a new risk assessment
     */
    submitAssessment: async (
        data: RiskAssessmentInput
    ): Promise<RiskAssessment> => {
        const response = await apiClient.post('/risk/assess', data);
        return response.data;
    },

    /**
     * Get risk assessments for a mother
     */
    getByMother: async (motherId: number): Promise<RiskAssessment[]> => {
        const response = await apiClient.get(`/risk/mother/${motherId}`);
        return response.data.assessments;
    },

    /**
     * Get latest risk assessment for a mother
     */
    getLatestByMother: async (motherId: number): Promise<RiskAssessment | null> => {
        const response = await apiClient.get(`/risk/mother/${motherId}/latest`);
        return response.data;
    },
};

/**
 * Health Timeline API endpoints
 */
export const timelineApi = {
    /**
     * Get health timeline for a mother
     */
    getByMother: async (
        motherId: number,
        params?: {
            limit?: number;
            offset?: number;
        }
    ): Promise<HealthTimeline[]> => {
        const response = await apiClient.get(`/mothers/${motherId}/timeline`, {
            params,
        });
        return response.data.timeline;
    },
};

/**
 * Analytics/Dashboard API endpoints
 */
export const analyticsApi = {
    /**
     * Get dashboard statistics
     */
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await apiClient.get('/analytics/dashboard');
        return response.data;
    },

    /**
     * Get full dashboard data (combined endpoint)
     */
    getFullDashboard: async (): Promise<{
        analytics: DashboardStats;
        recent_assessments: RiskAssessment[];
        high_risk_mothers: any[];
    }> => {
        const response = await apiClient.get('/dashboard/full');
        return response.data;
    },

    /**
     * Get admin full dashboard
     */
    getAdminDashboard: async (): Promise<{
        stats: DashboardStats;
        doctors: any[];
        asha_workers: any[];
        mothers: any[];
    }> => {
        const response = await apiClient.get('/admin/full');
        return response.data;
    },
};

/**
 * Reports API endpoints
 */
export const reportsApi = {
    /**
     * Upload and analyze medical report
     */
    uploadReport: async (
        motherId: number,
        file: { uri: string; type: string; name: string }
    ): Promise<{
        report_id: string;
        analysis_summary: string;
        health_metrics: any;
        concerns: string[];
        recommendations: string[];
    }> => {
        const formData = new FormData();
        formData.append('file', file as any);
        formData.append('mother_id', motherId.toString());

        const response = await apiClient.post('/analyze-report', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 second timeout for file uploads
        });
        return response.data;
    },

    /**
     * Get reports for a mother
     */
    getByMother: async (motherId: number): Promise<any[]> => {
        const response = await apiClient.get(`/reports/${motherId}`);
        return response.data.reports;
    },
};

export default riskApi;
