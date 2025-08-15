/**
 * Formats a date to the Brazilian standard (dd/mm).
 * @param {Date} date - The Date object to be formatted.
 * @returns {string} The formatted date.
 */
function formatDateBR(date) {
    // Add the timezone offset to avoid date issues
    const d = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

/**
 * Adjusts the start date to the next occurrence of the selected day of the week.
 * @param {string} startDateStr - The initial date in string format (e.g., '2023-01-10').
 * @param {number} selectedDayOfWeek - The day of the week (0=Sunday, 1=Monday, ...).
 * @returns {Date} The adjusted Date object.
 */
function calculateCorrectStartDate(startDateStr, selectedDayOfWeek) {
    let baseDate;
    if (startDateStr) {
    // Parse YYYY-MM-DD as a local date
        const [year, month, day] = startDateStr.split('-').map(Number);
        baseDate = new Date(year, month - 1, day);
    } else {
        baseDate = new Date();
    }
    const currentDay = baseDate.getDay();
    let daysUntilNext = (selectedDayOfWeek - currentDay + 7) % 7;
    if (!startDateStr && daysUntilNext === 0) {
    daysUntilNext = 7; // If the date was not provided and today is the day, skip to the next week
    }
    baseDate.setDate(baseDate.getDate() + daysUntilNext);
    return baseDate;
}

// Export functions for the test environment (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDateBR,
        calculateCorrectStartDate
    };
}
