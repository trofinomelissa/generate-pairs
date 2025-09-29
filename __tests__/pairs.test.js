const { generatePairRounds } = require('../src/js/pairs');

describe('generatePairRounds', () => {
    test('should pair all participants in every round (even number)', () => {
        // Arrange
        const participants = ['a', 'b', 'c', 'd'];
        const rounds = 3;

        // Act
        const result = generatePairRounds(participants, rounds);

        // Assert
        expect(result.length).toBe(rounds);
        result.forEach(roundPairs => {
            // Each participant must appear exactly once per round
            const flat = roundPairs.flat();
            expect(flat.length).toBe(participants.length);
            participants.forEach(p => {
                expect(flat).toContain(p);
            });
            // All pairs must have length 2
            roundPairs.forEach(pair => {
                expect(pair.length).toBe(2);
            });
        });
    });

    test('should pair all participants in every round (odd number)', () => {
        // Arrange
        const participants = ['a', 'b', 'c', 'd', 'e'];
        const rounds = 4;

        // Act
        const result = generatePairRounds(participants, rounds);

        // Assert
        expect(result.length).toBe(rounds);
        result.forEach(roundPairs => {
            // Each participant must appear at least once per round
            const flat = roundPairs.flat();
            participants.forEach(p => {
                expect(flat).toContain(p);
            });
            // All pairs must have length 2
            roundPairs.forEach(pair => {
                expect(pair.length).toBe(2);
            });
        });
    });

    test('should handle minimum valid input (2 participants, 1 round)', () => {
        // Arrange
        const participants = ['a', 'b'];
        const rounds = 1;

        // Act
        const result = generatePairRounds(participants, rounds);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].length).toBe(1);
        expect(result[0][0].sort()).toEqual(['a', 'b']);
    });

    test('should not mutate the original participants array', () => {
        // Arrange
        const participants = ['a', 'b', 'c'];
        const copy = [...participants];
        const rounds = 2;

        // Act
        generatePairRounds(participants, rounds);

        // Assert
        expect(participants).toEqual(copy);
    });

    test('should create pairs for 10 weeks with a list of 12 participants', () => {
        // Arrange
        const participants = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
        ];
        const rounds = 10;

        // Act
        const result = generatePairRounds(participants, rounds);

        // Assert
        expect(result.length).toBe(rounds);
        const pastPairs = new Set();

        result.forEach(roundPairs => {
            // Each participant must appear exactly once per round
            const flat = roundPairs.flat();
            expect(flat.length).toBe(participants.length);
            participants.forEach(p => {
                expect(flat).toContain(p);
            });
            // All pairs must have length 2 and not be repeated
            roundPairs.forEach(pair => {
                expect(pair.length).toBe(2);
                const sortedPair = [...pair].sort();
                const pairKey = JSON.stringify(sortedPair);
                expect(pastPairs.has(pairKey)).toBe(false);
                pastPairs.add(pairKey);
            });
        });
    });
});




