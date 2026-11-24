/**
 * Utility function to convert time string or Date into 12-hour AM/PM format.
 * Examples:
 *   '11:00' -> '11:00 AM'
 *   '14:30' -> '02:30 PM'
 *   '00:15' -> '12:15 AM'
 *   '2026-11-24T11:39:00.000Z' -> '11:39 AM'
 *   Date object -> '11:39 AM'
 *
 * @param {string|Date} timeOrDate
 * @returns {string} Formatted 12-hour time string
 */
export const format12HourTime = (timeOrDate) => {
  if (!timeOrDate) return '-';

  // Handle Date instance or ISO date string
  if (timeOrDate instanceof Date || (typeof timeOrDate === 'string' && timeOrDate.includes('T'))) {
    const d = new Date(timeOrDate);
    if (isNaN(d.getTime())) return '-';
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  // Handle 'HH:mm' or 'HH:mm:ss' time strings
  if (typeof timeOrDate === 'string' && timeOrDate.includes(':')) {
    const parts = timeOrDate.trim().split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = (parts[1] || '00').slice(0, 2);
    if (isNaN(hours)) return timeOrDate;

    // Check if it already has AM/PM
    const upper = timeOrDate.toUpperCase();
    if (upper.includes('AM') || upper.includes('PM')) {
      return timeOrDate;
    }

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  return String(timeOrDate);
};

export default format12HourTime;
