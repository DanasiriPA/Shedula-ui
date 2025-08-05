// utils.ts

/**
 * Format a date string into a readable format like "Mon, Aug 5"
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Normalize a date and time string into a UTC Date object
 * Used internally by calculateTimeRemaining and other time-sensitive logic
 */
export const normalizeDate = (dateStr: string, timeStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hours, minutes));
};

/**
 * Calculate time remaining until a given appointment date and time
 * Returns a string like "2d 3h 15m remaining" or "Appointment completed"
 */
export const calculateTimeRemaining = (date: string, time: string): string => {
    const appointmentDateTime = normalizeDate(date, time);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();

    if (diffMs <= 0) return 'Appointment completed';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffDays}d ${diffHours}h ${diffMinutes}m remaining`;
};