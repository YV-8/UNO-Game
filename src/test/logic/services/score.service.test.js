import Result from '../../../logic/monads/respond.js';
import { createScoreValidator } from '../../../logic/validators/scoreValidator.js';
import { createScoreRules } from '../../../logic/validators/scoreRules.js';
import { createScoreService } from '../../../logic/services/score.service.js';

describe('ScoreService (DI)', () => {
    const buildService = (overrides = {}) => {
        const scoreRepository = {
            findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(),
            ...overrides.scoreRepository,
        };
        const playerRepository = { findById: jest.fn(), ...overrides.playerRepository };
        const gameRepository = { findById: jest.fn(), ...overrides.gameRepository };

        const scoreValidator = createScoreValidator({ scoreRepository, playerRepository, gameRepository });
        const scoreRules = createScoreRules(scoreValidator);
        const service = createScoreService({ scoreRepository, scoreRules, Result });

        return { service, scoreRepository, playerRepository, gameRepository };
    };

    describe('getAllScores', () => {
        it('should return Ok with all scores', async () => {
            const { service, scoreRepository } = buildService();
            scoreRepository.findAll.mockResolvedValue([{ playerId: 1, gameId: 1, score: 100 }]);
            const result = await service.getAllScores();
            expect(result.value).toEqual([{ playerId: 1, gameId: 1, score: 100 }]);
        });
    });

    describe('createScore', () => {
        it('should return Err 400 if fields are missing', async () => {
            const { service } = buildService();
            const result = await service.createScore({ playerId: 1, gameId: 1 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'playerId, gameId and score are required',
            });
        });

        it('should return Err 400 if score is negative', async () => {
            const { service } = buildService();
            const result = await service.createScore({ playerId: 1, gameId: 1, score: -10 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
        });

        it('should return Err 404 if the player does not exist', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findById.mockResolvedValue(null);
            const result = await service.createScore({ playerId: 1, gameId: 1, score: 100 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced player does not exist' });
        });

        it('should return Err 404 if the game does not exist', async () => {
            const { service, playerRepository, gameRepository } = buildService();
            playerRepository.findById.mockResolvedValue({ id: 1 });
            gameRepository.findById.mockResolvedValue(null);
            const result = await service.createScore({ playerId: 1, gameId: 1, score: 100 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced game does not exist' });
        });

        it('should create the score', async () => {
            const { service, playerRepository, gameRepository, scoreRepository } = buildService();
            const scoreData = { playerId: 1, gameId: 1, score: 260 };
            playerRepository.findById.mockResolvedValue({ id: 1 });
            gameRepository.findById.mockResolvedValue({ id: 1 });
            scoreRepository.create.mockResolvedValue(scoreData);

            const result = await service.createScore(scoreData);

            expect(scoreRepository.create).toHaveBeenCalledWith(scoreData);
            expect(result.value).toEqual(scoreData);
        });
    });

    describe('updateScore', () => {
        it('should return Err 404 if the score does not exist', async () => {
            const { service, scoreRepository } = buildService();
            scoreRepository.findById.mockResolvedValue(null);
            const result = await service.updateScore(1, { score: 500 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Score not found' });
        });

        it('should update the score keeping previous values', async () => {
            const { service, scoreRepository } = buildService();
            const existing = { playerId: 1, gameId: 1, score: 260 };
            scoreRepository.findById.mockResolvedValue(existing);
            scoreRepository.update.mockResolvedValue({ ...existing, score: 450 });

            const result = await service.updateScore(1, { score: 450 });

            expect(scoreRepository.update).toHaveBeenCalledWith(1, { playerId: 1, gameId: 1, score: 450 });
            expect(result.value.score).toBe(450);
        });
    });

    describe('deleteScore', () => {
        it('should delete the score', async () => {
            const { service, scoreRepository } = buildService();
            scoreRepository.delete.mockResolvedValue(true);
            const result = await service.deleteScore(1);
            expect(result.value).toEqual({});
        });
    });
});