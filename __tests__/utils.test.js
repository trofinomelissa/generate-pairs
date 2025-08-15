const { generateWeeksData } = require('../src/js/pairs');

describe('generateWeeksData', () => {
    test('should generate correct week data for a single round', () => {
         // Arrange
         const rounds = [[['a', 'b']]];
         // Using UTC date to avoid timezone issues during tests
         const startDate = new Date('2025-08-14T00:00:00');

         // Act
         const weeksData = generateWeeksData(rounds, startDate);

         // Assert
         expect(weeksData.length).toBe(1);
         expect(weeksData[0].weekNumber).toBe(1);
         expect(weeksData[0].label).toBe('14/08 - 20/08');
         expect(weeksData[0].pairs).toEqual([['a', 'b']]);
     });

    test('should generate correct data for multiple weeks', () => {
         // Arrange
         const rounds = [[['a', 'b']], [['c', 'd']]];
         const startDate = new Date('2025-08-14T00:00:00');

         // Act
         const weeksData = generateWeeksData(rounds, startDate);

         // Assert
         expect(weeksData.length).toBe(2);
         
         expect(weeksData[0].weekNumber).toBe(1);
         expect(weeksData[0].label).toBe('14/08 - 20/08');
         expect(weeksData[0].pairs).toEqual([['a', 'b']]);

         expect(weeksData[1].weekNumber).toBe(2);
         expect(weeksData[1].label).toBe('21/08 - 27/08');
         expect(weeksData[1].pairs).toEqual([['c', 'd']]);
     });

    test('should return an empty array if no rounds are provided', () => {
         // Arrange
         const rounds = [];
         const startDate = new Date('2025-08-14T00:00:00');

         // Act
         const weeksData = generateWeeksData(rounds, startDate);

         // Assert
         expect(weeksData.length).toBe(0);
     });
});
const { formatDateBR, calculateCorrectStartDate } = require('../src/js/utils');

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

describe('calculateCorrectStartDate', () => {
    afterEach(() => {
        // Restore Date if it was mocked
        if (global._originalDate) {
            global.Date = global._originalDate;
            delete global._originalDate;
        }
    });

    test('should return the same date if it is already the selected day (with startDateStr)', () => {
        // Arrange
        const date = '2025-08-14'; // Thursday
        const selectedDay = 4; // 0=Sunday, 4=Thursday

        // Act
        const result = calculateCorrectStartDate(date, selectedDay);

        // Assert
        expect(result.toISOString().slice(0, 10)).toBe('2025-08-14');
    });

    test('should return the next occurrence if today is not the selected day', () => {
        // Arrange
        const date = '2025-08-14'; // Thursday
        const selectedDay = 1; // Monday

        // Act
        const result = calculateCorrectStartDate(date, selectedDay);

        // Assert
        expect(result.toISOString().slice(0, 10)).toBe('2025-08-18'); // Next Monday
    });

    test('should skip to next week if no date provided and today is the selected day', () => {
        // Arrange
        global._originalDate = global.Date;
        global.Date = class extends global._originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    return new global._originalDate('2025-08-17T00:00:00'); // Sunday
                }
                return new global._originalDate(...args);
            }
        };
        const selectedDay = 0; // Sunday

        // Act
        const result = calculateCorrectStartDate('', selectedDay);

        // Assert
        expect(result.toISOString().slice(0, 10)).toBe('2025-08-24'); // Next Sunday
    });

    test('should return next occurrence if no date provided and today is not the selected day', () => {
        // Arrange
        global._originalDate = global.Date;
        global.Date = class extends global._originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    return new global._originalDate('2025-08-14T00:00:00'); // Thursday
                }
                return new global._originalDate(...args);
            }
        };
        const selectedDay = 1; // Monday

        // Act
        const result = calculateCorrectStartDate('', selectedDay);

        // Assert
        expect(result.toISOString().slice(0, 10)).toBe('2025-08-18'); // Next Monday
    });
});
