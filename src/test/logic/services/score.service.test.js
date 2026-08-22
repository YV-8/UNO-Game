import { scoreService as createScoreService } from '../../../logic/services/score.service.js';
import Result from '../../../logic/monads/respond.js';

describe('ScoreService Unit Tests', () => {
    let scoreRepository, scoreRules, scoreService;

    beforeEach(() => {
        scoreRepository = { findAll: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
        scoreRules = {
            validateGetScore: jest.fn(),
            validateCreateScore: jest.fn(),
            validateUpdateScore: jest.fn(),
            validateDeleteScore: jest.fn(),
        };

        scoreService = createScoreService({ scoreRepository, scoreRules, respond: Result });
    });

    describe('getAllScores', () => {
        test('returns Ok with all scores', async () => {
            scoreRepository.findAll.mockResolvedValue([{ playerId: 1, gameId: 1, score: 100 }]);
            const result = await scoreService.getAllScores();
            expect(result.value).toEqual([{ playerId: 1, gameId: 1, score: 100 }]);
        });
    });

    describe('getScoreById', () => {
        test('returns Err if the score does not exist', async () => {
            scoreRules.validateGetScore.mockResolvedValue(Result.Err({ statusCode: 404, message: 'Not found' }));
            const result = await scoreService.getScoreById(99);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok with the existing score', async () => {
            scoreRules.validateGetScore.mockResolvedValue(Result.Ok({ existingScore: { id: 1, score: 100 } }));
            const result = await scoreService.getScoreById(1);
            expect(result.value).toEqual({ id: 1, score: 100 });
        });
    });

    describe('createScore', () => {
        test('returns Err if validation fails', async () => {
            scoreRules.validateCreateScore.mockResolvedValue(Result.Err({ statusCode: 400, message: 'Err' }));
            const result = await scoreService.createScore({ playerId: 1, gameId: 1 });
            expect(result.isErr()).toBe(true);
        });

        test('creates the score', async () => {
            const scoreData = { playerId: 1, gameId: 1, score: 260 };
            scoreRules.validateCreateScore.mockResolvedValue(Result.Ok(scoreData));
            scoreRepository.create.mockResolvedValue(scoreData);

            const result = await scoreService.createScore(scoreData);

            expect(scoreRepository.create).toHaveBeenCalledWith(scoreData);
            expect(result.value).toEqual(scoreData);
        });
    });

    describe('updateScore', () => {
        test('keeps previous values when fields are not provided', async () => {
            scoreRules.validateUpdateScore.mockResolvedValue(Result.Ok({
                existingScore: { playerId: 1, gameId: 1, score: 260 },
                playerId: undefined, gameId: undefined, score: 450,
            }));
            scoreRepository.update.mockResolvedValue({ playerId: 1, gameId: 1, score: 450 });

            const result = await scoreService.updateScore(1, { score: 450 });

            expect(scoreRepository.update).toHaveBeenCalledWith(1, { playerId: 1, gameId: 1, score: 450 });
            expect(result.value.score).toBe(450);
        });
    });

    describe('deleteScore', () => {
        test('returns Err 404 when nothing was deleted', async () => {
            scoreRules.validateDeleteScore.mockResolvedValue(Result.Ok({}));
            scoreRepository.delete.mockResolvedValue(false);
            const result = await scoreService.deleteScore(1);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok on successful delete', async () => {
            scoreRules.validateDeleteScore.mockResolvedValue(Result.Ok({}));
            scoreRepository.delete.mockResolvedValue(true);
            const result = await scoreService.deleteScore(1);
            expect(result.value).toEqual({});
        });
    });
});
