const { formatDateBR } = require('../src/js/utils');

describe('formatDateBR', () => {
    test('should format a standard date correctly', () => {
        // Arrange
        const date = new Date('2025-08-14T00:00:00');

        // Act
        const formattedDate = formatDateBR(date);

        // Assert
        expect(formattedDate).toBe('14/08');
    });

    test('should pad single-digit day and month with a zero', () => {
        // Arrange
        const date = new Date('2025-01-05T00:00:00');

        // Act
        const formattedDate = formatDateBR(date);

        // Assert
        expect(formattedDate).toBe('05/01');
    });

    test('should handle the end of the year correctly', () => {
        // Arrange
        const date = new Date('2025-12-31T00:00:00');

        // Act
        const formattedDate = formatDateBR(date);

        // Assert
        expect(formattedDate).toBe('31/12');
    });
});
