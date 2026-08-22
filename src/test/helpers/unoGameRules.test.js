import { unoGameRules as createUnoGameRules } from '../../../src/helpers/unoGameRules.js';
import { unoDeck as createUnoDeck } from '../../../src/helpers/unoDeck.js';

describe('unoGameRules', () => {
    const realUnoDeck = createUnoDeck();
    const parseCardString = jest.fn();
    const rules = createUnoGameRules({ unoDeck: realUnoDeck, parseCardString });

    describe('dealCards', () => {
        test('deals the requested number of cards to each player, round-robin', () => {
            const deck = realUnoDeck.buildDeck();
            const { hands, remainingDeck } = rules.dealCards(deck, [1, 2, 3], 7);

            expect(hands[1]).toHaveLength(7);
            expect(hands[2]).toHaveLength(7);
            expect(hands[3]).toHaveLength(7);
            expect(remainingDeck).toHaveLength(108 - 21);
        });

        test('no card is duplicated between hands and the remaining deck', () => {
            const deck = realUnoDeck.buildDeck();
            const { hands, remainingDeck } = rules.dealCards(deck, [1, 2], 5);
            const allDealt = [...hands[1], ...hands[2], ...remainingDeck];
            expect(allDealt).toHaveLength(108);
        });
    });

    describe('drawInitialTableCard', () => {
        test('picks the first non-wild card and sends wilds to the back', () => {
            const deck = [
                { color: null, value: 'wild' },
                { color: 'red', value: '5' },
                { color: 'blue', value: '2' },
            ];
            const { tableCard, remainingDeck } = rules.drawInitialTableCard(deck);
            expect(tableCard).toEqual({ color: 'red', value: '5' });
            expect(remainingDeck).toContainEqual({ color: null, value: 'wild' });
            expect(remainingDeck).toContainEqual({ color: 'blue', value: '2' });
        });

        test('returns null tableCard when the deck is empty', () => {
            const { tableCard, remainingDeck } = rules.drawInitialTableCard([]);
            expect(tableCard).toBeNull();
            expect(remainingDeck).toEqual([]);
        });
    });

    describe('canPlayCard', () => {
        test('a wild card can always be played', () => {
            expect(rules.canPlayCard({ color: null, value: 'wild' }, { color: 'red', value: '3' })).toBe(true);
        });

        test('a card matching the color can be played', () => {
            expect(rules.canPlayCard({ color: 'red', value: '9' }, { color: 'red', value: '3' })).toBe(true);
        });

        test('a card matching the value can be played', () => {
            expect(rules.canPlayCard({ color: 'blue', value: '3' }, { color: 'red', value: '3' })).toBe(true);
        });

        test('a card matching neither color nor value cannot be played', () => {
            expect(rules.canPlayCard({ color: 'blue', value: '9' }, { color: 'red', value: '3' })).toBe(false);
        });

        test('respects the chosen color after a wild card', () => {
            expect(rules.canPlayCard({ color: 'green', value: '4' }, { color: 'red', value: 'wild' }, 'green')).toBe(true);
        });

        test('returns false if either card is missing', () => {
            expect(rules.canPlayCard(null, { color: 'red', value: '3' })).toBe(false);
            expect(rules.canPlayCard({ color: 'red', value: '3' }, null)).toBe(false);
        });
    });

    describe('findCardInHand', () => {
        test('finds the card whose formatted label matches', () => {
            const hand = [{ color: 'red', value: '3' }, { color: 'blue', value: 'skip' }];
            expect(rules.findCardInHand(hand, 'Blue Skip')).toEqual({ color: 'blue', value: 'skip' });
        });

        test('returns null when nothing matches', () => {
            expect(rules.findCardInHand([{ color: 'red', value: '3' }], 'Green 9')).toBeNull();
        });
    });

    describe('hasPlayableCard', () => {
        test('returns true when at least one card in hand is playable', () => {
            const hand = [{ color: 'blue', value: '9' }, { color: 'red', value: '3' }];
            expect(rules.hasPlayableCard(hand, { color: 'red', value: '5' })).toBe(true);
        });

        test('returns false when no card in hand is playable', () => {
            const hand = [{ color: 'blue', value: '9' }, { color: 'green', value: '2' }];
            expect(rules.hasPlayableCard(hand, { color: 'red', value: '5' })).toBe(false);
        });
    });

    describe('getNextPlayerIndex', () => {
        test('advances one position forward with direction 1', () => {
            expect(rules.getNextPlayerIndex(0, 4, 1, false)).toBe(1);
        });

        test('advances backward with direction -1, wrapping around', () => {
            expect(rules.getNextPlayerIndex(0, 4, -1, false)).toBe(3);
        });

        test('skips one extra position when skip=true', () => {
            expect(rules.getNextPlayerIndex(0, 4, 1, true)).toBe(2);
        });

        test('wraps forward past the last index', () => {
            expect(rules.getNextPlayerIndex(3, 4, 1, false)).toBe(0);
        });
    });

    describe('getDrawPenalty', () => {
        test('draw_two gives a penalty of 2', () => {
            expect(rules.getDrawPenalty({ value: 'draw_two' })).toBe(2);
        });

        test('wild_draw_four gives a penalty of 4', () => {
            expect(rules.getDrawPenalty({ value: 'wild_draw_four' })).toBe(4);
        });

        test('any other card gives no penalty', () => {
            expect(rules.getDrawPenalty({ value: '7' })).toBe(0);
        });
    });

    describe('reshuffleDiscardIntoDeck', () => {
        test('keeps the top card and shuffles the rest into a new deck', () => {
            const discardPile = [
                { color: 'red', value: '3' },
                { color: 'blue', value: '5' },
                { color: 'green', value: '9' },
            ];
            const { newDeck, keptTopCard } = rules.reshuffleDiscardIntoDeck(discardPile);
            expect(keptTopCard).toEqual({ color: 'red', value: '3' });
            expect(newDeck).toHaveLength(2);
        });

        test('returns an empty deck when there is only the top card', () => {
            const { newDeck, keptTopCard } = rules.reshuffleDiscardIntoDeck([{ color: 'red', value: '3' }]);
            expect(newDeck).toEqual([]);
            expect(keptTopCard).toEqual({ color: 'red', value: '3' });
        });

        test('handles an empty or missing discard pile', () => {
            expect(rules.reshuffleDiscardIntoDeck([])).toEqual({ newDeck: [], keptTopCard: null });
            expect(rules.reshuffleDiscardIntoDeck(undefined)).toEqual({ newDeck: [], keptTopCard: null });
        });
    });

    describe('card type checks', () => {
        test('isSkipCard / isReverseCard / isDrawCard / isWildCard', () => {
            expect(rules.isSkipCard({ value: 'skip' })).toBe(true);
            expect(rules.isReverseCard({ value: 'reverse' })).toBe(true);
            expect(rules.isDrawCard({ value: 'draw_two' })).toBe(true);
            expect(rules.isDrawCard({ value: 'wild_draw_four' })).toBe(true);
            expect(rules.isWildCard({ color: null, value: 'wild' })).toBe(true);
            expect(rules.isWildCard({ color: 'red', value: '3' })).toBe(false);
        });
    });
});
