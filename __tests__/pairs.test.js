const { generatePairRounds, generateWeeksData } = require('../src/js/pairs');

describe('generatePairRounds', () => {
    
    test('should not repeat the same person in a pair with an odd number of participants', () => {
        // Arrange
        const people = ['melissa', 'cris', 'lu', 'pri', 'elaine'];
        
        // Act
        const rounds = generatePairRounds(people, 1);
        const firstRound = rounds[0];
        const hasRepetition = firstRound.some(pair => pair[0] === pair[1]);
        
        // Assert
        expect(hasRepetition).toBe(false);
    });

    test('should handle an even number of people correctly', () => {
        // Arrange
        const people = ['a', 'b', 'c', 'd'];
        
        // Act
        const rounds = generatePairRounds(people, 1);
        const firstRound = rounds[0];
        const allPeopleInRound = firstRound.flat();

        // Assert
        expect(firstRound.length).toBe(2);
        expect(allPeopleInRound.sort()).toEqual(people.sort());
    });

    test('should generate the correct number of weeks', () => {
        // Arrange
        const people = ['a', 'b', 'c', 'd'];
        
        // Act
        const rounds = generatePairRounds(people, 5);

        // Assert
        expect(rounds.length).toBe(5);
    });

    test('should not leave anyone alone with an odd list', () => {
        // Arrange
        const people = ['a', 'b', 'c', 'd', 'e'];

        // Act
        const rounds = generatePairRounds(people, 1);
        const firstRound = rounds[0];
        const peopleInRound = new Set(firstRound.flat());

        // Assert
        people.forEach(person => {
            expect(peopleInRound.has(person)).toBe(true);
        });
    });
});

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
