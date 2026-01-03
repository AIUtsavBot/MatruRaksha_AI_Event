// App configuration constants
// Replace these with your actual values

// API URL - Use your deployed backend URL
export const API_URL = __DEV__
    ? 'http://192.168.1.100:8000' // Your local network IP for development
    : 'https://your-backend.onrender.com'; // Production URL

// Supabase Configuration
// Get these from: Supabase Dashboard > Project > Settings > API
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

// App Info
export const APP_NAME = 'MatruRaksha';
export const APP_VERSION = '1.0.0';

// Symptom options for check-in
export const SYMPTOM_OPTIONS = [
    { id: 'headache', label: 'Headache', emoji: '🤕' },
    { id: 'swelling', label: 'Swelling', emoji: '🦶' },
    { id: 'nausea', label: 'Nausea', emoji: '🤢' },
    { id: 'dizziness', label: 'Dizziness', emoji: '💫' },
    { id: 'bleeding', label: 'Bleeding', emoji: '🩸' },
    { id: 'fever', label: 'Fever', emoji: '🤒' },
    { id: 'abdominal_pain', label: 'Abdominal Pain', emoji: '😣' },
    { id: 'back_pain', label: 'Back Pain', emoji: '🔙' },
    { id: 'shortness_of_breath', label: 'Shortness of Breath', emoji: '😮‍💨' },
    { id: 'blurred_vision', label: 'Blurred Vision', emoji: '👁️' },
];

// Risk level colors
export const RISK_COLORS = {
    HIGH: '#EF4444',     // Red
    MODERATE: '#F59E0B', // Orange/Amber
    LOW: '#10B981',      // Green
};

// Feeling options for check-in
export const FEELING_OPTIONS = [
    { id: 'good', label: 'Good', emoji: '😊', color: '#10B981' },
    { id: 'okay', label: 'Okay', emoji: '😐', color: '#F59E0B' },
    { id: 'not_good', label: 'Not Good', emoji: '😟', color: '#EF4444' },
];

// Storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_PROFILE: 'userProfile',
    PENDING_CHECKINS: 'pendingCheckIns',
    CACHED_MOTHERS: 'cachedMothers',
    LAST_SYNC: 'lastSync',
};

// Cache durations (in milliseconds)
export const CACHE_DURATION = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 60 * 60 * 1000,      // 1 hour
};
