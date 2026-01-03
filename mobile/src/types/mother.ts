// Mother types
export interface Mother {
    id: number;
    name: string;
    phone: string;
    age?: number;
    gravida?: number;
    parity?: number;
    bmi?: number;
    location?: string;
    preferred_language?: string;
    telegram_chat_id?: string;
    doctor_id?: number;
    asha_worker_id?: number;
    medical_history?: MedicalHistory;
    created_at: string;

    // Populated relations
    doctor?: Doctor;
    asha_worker?: AshaWorker;
    latest_risk_assessment?: RiskAssessment;
}

export interface MedicalHistory {
    conditions: string[];
    medications: string[];
    trend_analysis: string;
}

export interface Doctor {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    assigned_area?: string;
    is_active: boolean;
}

export interface AshaWorker {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    assigned_area?: string;
    is_active: boolean;
}

export interface MotherRegistration {
    name: string;
    phone: string;
    age?: number;
    gravida?: number;
    parity?: number;
    bmi?: number;
    location?: string;
    preferred_language?: string;
    telegram_chat_id?: string;
}
