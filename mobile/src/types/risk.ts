// Risk assessment types
export type RiskLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface RiskAssessment {
    id: string;
    mother_id: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    hemoglobin?: number;
    blood_sugar?: number;
    weight?: number;
    symptoms?: string[];
    risk_level: RiskLevel;
    risk_score: number;
    factors?: string[];
    recommendations?: string[];
    created_at: string;
}

export interface RiskAssessmentInput {
    mother_id?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    hemoglobin?: number;
    blood_sugar?: number;
    weight?: number;
    symptoms?: string[];
    notes?: string;
}

export interface HealthCheckIn {
    feeling: 'good' | 'okay' | 'not_good';
    systolic_bp?: number;
    diastolic_bp?: number;
    symptoms: string[];
    notes?: string;
}

export interface HealthTimeline {
    id: number;
    mother_id: number;
    event_date: string;
    event_type: string;
    blood_pressure?: string;
    hemoglobin?: number;
    sugar_level?: number;
    weight?: number;
    summary?: string;
    created_at: string;
}

export interface DashboardStats {
    total_mothers: number;
    high_risk_count: number;
    moderate_risk_count: number;
    low_risk_count: number;
    total_assessments: number;
    pending_approvals?: number;
}
