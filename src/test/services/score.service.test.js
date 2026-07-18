import { jest } from '@jest/globals';

jest.unstable_mockModule('../../dataAccess/repositories/score.repository.js', () => ({
    default: { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
}));
jest.unstable_mockModule('../../dataAccess/repositories/player.repository.js', () => ({
    default: { findById: jest.fn() },
}));
jest.unstable_mockModule('../../dataAccess/repositories/game.repository.js', () => ({
    default: { findById: jest.fn() },
}));

const ScoreRepository = (await import('../../dataAccess/repositories/score.repository.js')).default;
const PlayerRepository = (await import('../../dataAccess/repositories/player.repository.js')).default;
const GameRepository = (await import('../../dataAccess/repositories/game.repository.js')).default;
const ScoreService = await import('../../logic/services/score.service.js');

describe('ScoreService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('createScore', () => {
        it('lanza 400 si falta un campo', async () => {
            await expect(ScoreService.createScore({ playerId: 1 })).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 400 si score es negativo', async () => {
            await expect(
                ScoreService.createScore({ playerId: 1, gameId: 1, score: -10 })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 404 si el player no existe', async () => {
            PlayerRepository.findById.mockResolvedValue(null);
            await expect(
                ScoreService.createScore({ playerId: 99, gameId: 1, score: 200 })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it('lanza 404 si el game no existe', async () => {
            PlayerRepository.findById.mockResolvedValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(null);
            await expect(
                ScoreService.createScore({ playerId: 1, gameId: 99, score: 200 })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it('crea el score si todo es válido', async () => {
            PlayerRepository.findById.mockResolvedValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1 });
            const newScore = { id: 1, playerId: 1, gameId: 1, score: 200 };
            ScoreRepository.create.mockResolvedValue(newScore);

            const result = await ScoreService.createScore({ playerId: 1, gameId: 1, score: 200 });

            expect(result).toEqual(newScore);
        });
    });

    describe('deleteScore', () => {
        it('lanza 404 si no existe', async () => {
            ScoreRepository.delete.mockResolvedValue(false);
            await expect(ScoreService.deleteScore(1)).rejects.toMatchObject({ statusCode: 404 });
        });
    });
});