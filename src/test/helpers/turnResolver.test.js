import { turnResolver as createTurnResolver } from '../../../src/helpers/turnResolver.js';

describe('turnResolver', () => {
    let unoGameRules, getCardEffect, resolver;

    beforeEach(() => {
        unoGameRules = { getNextPlayerIndex: jest.fn() };
        getCardEffect = jest.fn();
        resolver = createTurnResolver({ unoGameRules, getCardEffect });
    });

    describe('resolveNextTurn', () => {
        const activePlayers = [{ playerId: 1 }, { playerId: 2 }, { playerId: 3 }];

        test('advances to the next player for a standard card', () => {
            getCardEffect.mockReturnValue(() => ({ direction: 1, skipNext: false, drawPenalty: 0 }));
            unoGameRules.getNextPlayerIndex.mockReturnValue(1);

            const result = resolver.resolveNextTurn({
                activePlayers, currentIndex: 0, direction: 1, targetCard: { color: 'red', value: '5' },
            });

            expect(result).toEqual({ newDirection: 1, drawPenalty: 0, penalizedPlayerId: null, nextPlayerId: 2 });
        });

        test('applies the draw penalty to the immediate next player, then skips to the one after', () => {
            getCardEffect.mockReturnValue(() => ({ direction: 1, skipNext: true, drawPenalty: 2 }));
            unoGameRules.getNextPlayerIndex.mockReturnValueOnce(1).mockReturnValueOnce(2);

            const result = resolver.resolveNextTurn({
                activePlayers, currentIndex: 0, direction: 1, targetCard: { color: 'red', value: 'draw_two' },
            });

            expect(result.penalizedPlayerId).toBe(2);
            expect(result.nextPlayerId).toBe(3);
            expect(result.drawPenalty).toBe(2);
        });

        test('treats a reverse card as a skip when only 2 players remain', () => {
            const twoPlayers = [{ playerId: 1 }, { playerId: 2 }];
            getCardEffect.mockReturnValue(() => ({ direction: -1, skipNext: false, drawPenalty: 0 }));
            unoGameRules.getNextPlayerIndex.mockReturnValue(0);

            resolver.resolveNextTurn({
                activePlayers: twoPlayers, currentIndex: 1, direction: 1, targetCard: { color: 'red', value: 'reverse' },
            });

            expect(unoGameRules.getNextPlayerIndex).toHaveBeenCalledWith(1, 2, -1, true);
        });
    });

    describe('resolveNextPlayer', () => {
        test('returns the playerId at the resolved index', () => {
            const activePlayers = [{ playerId: 1 }, { playerId: 2 }];
            unoGameRules.getNextPlayerIndex.mockReturnValue(1);

            const result = resolver.resolveNextPlayer(activePlayers, 0, 1);

            expect(unoGameRules.getNextPlayerIndex).toHaveBeenCalledWith(0, 2, 1, false);
            expect(result).toBe(2);
        });
    });
});