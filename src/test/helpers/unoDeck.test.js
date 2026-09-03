import { unoDeck as createUnoDeck } from '../../../src/helpers/unoDeck.js';

describe('unoDeck', () => {
    const deck = createUnoDeck();

    describe('buildDeck', () => {
        test('builds exactly 108 cards', () => {
            expect(deck.buildDeck()).toHaveLength(108);
        });

        test('has 4 zero cards, one per color', () => {
            const zeros = deck.buildDeck().filter((c) => c.value === '0');
            expect(zeros).toHaveLength(4);
        });

        test('has 8 wild cards total (4 wild + 4 wild_draw_four)', () => {
            const wilds = deck.buildDeck().filter((c) => c.color === null);
            expect(wilds).toHaveLength(8);
        });

        test('has 72 numbered cards from 1-9 (2 per color per number)', () => {
            const numbered = deck.buildDeck().filter((c) => c.value !== '0' && !isNaN(c.value));
            expect(numbered).toHaveLength(72);
        });
    });

    describe('shuffleDeck', () => {
        test('returns a new array with the same cards', () => {
            const original = deck.buildDeck();
            const shuffled = deck.shuffleDeck(original);
            expect(shuffled).toHaveLength(original.length);
            expect(shuffled).not.toBe(original);
        });
    });

    describe('getCardPoints', () => {
        test('wild cards are worth 50', () => {
            expect(deck.getCardPoints('wild')).toBe(50);
            expect(deck.getCardPoints('wild_draw_four')).toBe(50);
        });

        test('action cards are worth 20', () => {
            expect(deck.getCardPoints('skip')).toBe(20);
            expect(deck.getCardPoints('reverse')).toBe(20);
            expect(deck.getCardPoints('draw_two')).toBe(20);
        });

        test('number cards are worth their face value', () => {
            expect(deck.getCardPoints('7')).toBe(7);
            expect(deck.getCardPoints('0')).toBe(0);
        });
    });

    describe('formatCard', () => {
        test('formats a plain number card', () => {
            expect(deck.formatCard({ color: 'red', value: '7' })).toBe('Red 7');
        });

        test('formats an action card', () => {
            expect(deck.formatCard({ color: 'blue', value: 'skip' })).toBe('Blue Skip');
        });

        test('formats a wild card without a color', () => {
            expect(deck.formatCard({ color: null, value: 'wild' })).toBe('Wild');
            expect(deck.formatCard({ color: null, value: 'wild_draw_four' })).toBe('Wild Draw Four');
        });

        test('returns "No card" for falsy input', () => {
            expect(deck.formatCard(null)).toBe('No card');
            expect(deck.formatCard(undefined)).toBe('No card');
        });
    });
});