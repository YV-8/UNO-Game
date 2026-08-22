import { unoCardBuilder as createUnoCardBuilder } from '../../../src/helpers/unoCardBuilder.js';

describe('unoCardBuilder', () => {
    let unoDeck, unoGameRules, cardRepository, builder;

    beforeEach(() => {
        unoDeck = { buildDeck: jest.fn(() => ['deck']), shuffleDeck: jest.fn((d) => d) };
        unoGameRules = { dealCards: jest.fn() };
        cardRepository = {
            bulkCreate: jest.fn(), findDeckByGameId: jest.fn(),
            findDiscardByGameId: jest.fn(), bulkUpdate: jest.fn(),
        };
        builder = createUnoCardBuilder({ unoDeck, unoGameRules, cardRepository });
    });

    describe('dealInitialCards', () => {
        test('deals hands, picks a plain number card as table card, and persists everything in one bulkCreate', async () => {
            unoGameRules.dealCards.mockReturnValue({
                hands: { 1: [{ color: 'red', value: '2' }], 2: [{ color: 'blue', value: '5' }] },
                remainingDeck: [
                    { color: null, value: 'wild' },
                    { color: 'green', value: '7' },
                    { color: 'red', value: 'skip' },
                ],
            });

            const result = await builder.dealInitialCards({ gameId: 1, playerIds: [1, 2], handSize: 1 });

            expect(result.topCard).toEqual({ color: 'green', value: '7' });
            expect(cardRepository.bulkCreate).toHaveBeenCalledTimes(1);

            const rows = cardRepository.bulkCreate.mock.calls[0][0];
            expect(rows.filter((r) => r.location === 'hand')).toHaveLength(2);
            expect(rows.filter((r) => r.location === 'discard')).toHaveLength(1);
            expect(rows.filter((r) => r.location === 'deck')).toHaveLength(2);
        });

        test('falls back to the first card when no plain number card exists', async () => {
            unoGameRules.dealCards.mockReturnValue({
                hands: { 1: [] },
                remainingDeck: [{ color: null, value: 'wild' }, { color: 'red', value: 'skip' }],
            });

            const result = await builder.dealInitialCards({ gameId: 1, playerIds: [1], handSize: 0 });

            expect(result.topCard).toEqual({ color: null, value: 'wild' });
        });

        test('assigns the correct card type: number, action, and wild', async () => {
            unoGameRules.dealCards.mockReturnValue({
                hands: { 1: [{ color: 'red', value: '3' }, { color: 'blue', value: 'skip' }, { color: null, value: 'wild' }] },
                remainingDeck: [{ color: 'green', value: '9' }],
            });

            await builder.dealInitialCards({ gameId: 1, playerIds: [1], handSize: 3 });

            const handRows = cardRepository.bulkCreate.mock.calls[0][0].filter((r) => r.location === 'hand');
            expect(handRows.find((r) => r.value === '3').type).toBe('number');
            expect(handRows.find((r) => r.value === 'skip').type).toBe('action');
            expect(handRows.find((r) => r.value === 'wild').type).toBe('wild');
        });
    });

    describe('drawCards', () => {
        test('draws directly from the deck when there are enough cards', async () => {
            cardRepository.findDeckByGameId.mockResolvedValue([
                { id: 10, color: 'red', value: '3' }, { id: 11, color: 'blue', value: '5' },
            ]);

            const drawn = await builder.drawCards({ gameId: 1, playerId: 7, count: 1 });

            expect(cardRepository.findDiscardByGameId).not.toHaveBeenCalled();
            expect(drawn).toEqual([{ id: 10, color: 'red', value: '3' }]);
            expect(cardRepository.bulkUpdate).toHaveBeenCalledWith([
                { id: 10, data: { location: 'hand', playerId: 7 } },
            ]);
        });

        test('recycles the discard pile (keeping the top card) when the deck runs short', async () => {
            cardRepository.findDeckByGameId.mockResolvedValue([{ id: 1, color: 'red', value: '3' }]);
            cardRepository.findDiscardByGameId.mockResolvedValue([
                { id: 20, color: 'blue', value: '9' }, // top card, se conserva
                { id: 21, color: 'green', value: '2' },
                { id: 22, color: 'red', value: '4' },
            ]);

            const drawn = await builder.drawCards({ gameId: 1, playerId: 7, count: 3 });

            expect(drawn).toHaveLength(3);
            expect(cardRepository.bulkUpdate).toHaveBeenCalledWith([
                { id: 21, data: { location: 'deck', discardOrder: null, playerId: null } },
                { id: 22, data: { location: 'deck', discardOrder: null, playerId: null } },
            ]);
        });
    });
});