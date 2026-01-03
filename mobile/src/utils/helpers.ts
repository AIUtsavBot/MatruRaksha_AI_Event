import { RiskLevel } from '../types';
import { RISK_COLORS } from './constants';

/**
 * Get color for risk level
 */
export function getRiskColor(level: RiskLevel): string {
    return RISK_COLORS[level] || RISK_COLORS.LOW;
}

/**
 * Get emoji for risk level
 */
export function getRiskEmoji(level: RiskLevel): string {
    switch (level) {
        case 'HIGH':
            return '🔴';
        case 'MODERATE':
            return '🟡';
        case 'LOW':
            return '🟢';
        default:
            return '⚪';
    }
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format time to readable string
 */
export function formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
    return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(date);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
}

/**
 * Calculate pregnancy week from LMP (Last Menstrual Period)
 */
export function calculatePregnancyWeek(lmpDate: string | Date): number {
    const lmp = new Date(lmpDate);
    const now = new Date();
    const diffMs = now.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    return Math.floor(diffDays / 7);
}

/**
 * Get trimester from pregnancy week
 */
export function getTrimester(week: number): 1 | 2 | 3 {
    if (week <= 12) return 1;
    if (week <= 28) return 2;
    return 3;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format blood pressure reading
 */
export function formatBP(systolic?: number, diastolic?: number): string {
    if (systolic && diastolic) {
        return `${systolic}/${diastolic} mmHg`;
    }
    return 'Not recorded';
}

/**
 * Check if BP is in normal range
 */
export function isBPNormal(systolic: number, diastolic: number): boolean {
    return systolic < 140 && diastolic < 90;
}

/**
 * Get BP status
 */
export function getBPStatus(systolic: number, diastolic: number): {
    status: 'normal' | 'elevated' | 'high';
    label: string;
    color: string;
} {
    if (systolic < 120 && diastolic < 80) {
        return { status: 'normal', label: 'Normal', color: '#10B981' };
    }
    if (systolic < 140 && diastolic < 90) {
        return { status: 'elevated', label: 'Elevated', color: '#F59E0B' };
    }
    return { status: 'high', label: 'High', color: '#EF4444' };
}
