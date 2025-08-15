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

// Add exports for the test environment (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDateBR
    };
}
