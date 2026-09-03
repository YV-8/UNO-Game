import ScoreRepository from '../../../dataAccess/repositories/score.repository.js';
import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import GameRepository from '../../../dataAccess/repositories/game.repository.js';
import * as ScoreService from '../../../logic/services/score.service.js';

jest.mock('../../../dataAccess/repositories/score.repository.js');
jest.mock('../../../dataAccess/repositories/player.repository.js');
jest.mock('../../../dataAccess/repositories/game.repository.js');

describe('ScoreService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getAllScores', () => {
        it('should return Ok with all scores', async () => {
            const mockScores = [{ playerId: 1, gameId: 1, score: 100 }, { playerId: 2, gameId: 1, score: 300 }];
            ScoreRepository.findAll.mockResolvedValue(mockScores);

            const result = await ScoreService.getAllScores();

            expect(ScoreRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result.value).toEqual(mockScores);
        });
    });

    describe('getScoreById', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await ScoreService.getScoreById();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the score does not exist', async () => {
            ScoreRepository.findById.mockResolvedValue(null);
            const result = await ScoreService.getScoreById(666);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Score not found' });
        });

        it('should return Ok with the score for a given id', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: 160 };
            ScoreRepository.findById.mockResolvedValue(mockScore);
            const result = await ScoreService.getScoreById(1);
            expect(result.value).toEqual(mockScore);
        });
    });

    describe('createScore', () => {
        it('should return Err 400 if required fields are missing', async () => {
            const result = await ScoreService.createScore({ playerId: 1, gameId: 3 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'playerId, gameId and score are required',
            });
        });

        it('should return Err 400 if score is negative', async () => {
            const result = await ScoreService.createScore({ playerId: 1, gameId: 1, score: -100 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
            expect(PlayerRepository.findById).not.toHaveBeenCalled();
        });

        it('should return Err 404 if the player does not exist', async () => {
            PlayerRepository.findById.mockResolvedValue(null);
            const result = await ScoreService.createScore({ playerId: 1, gameId: 1, score: 220 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced player does not exist' });
        });

        it('should return Err 404 if the game does not exist', async () => {
            PlayerRepository.findById.mockResolvedValue({ id: 1, username: 'ale' });
            GameRepository.findById.mockResolvedValue(null);
            const result = await ScoreService.createScore({ playerId: 1, gameId: 1, score: 120 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced game does not exist' });
        });

        it('should create a new score', async () => {
            const mockScoreData = { playerId: 1, gameId: 1, score: 260 };
            PlayerRepository.findById.mockResolvedValue({ id: 1, username: 'ale' });
            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Uno' });
            ScoreRepository.create.mockResolvedValue(mockScoreData);

            const result = await ScoreService.createScore(mockScoreData);

            expect(PlayerRepository.findById).toHaveBeenCalledWith(1);
            expect(GameRepository.findById).toHaveBeenCalledWith(1);
            expect(ScoreRepository.create).toHaveBeenCalledWith(mockScoreData);
            expect(result.value).toEqual(mockScoreData);
        });
    });

    describe('updateScore', () => {
        it('should return Err 404 if the score does not exist', async () => {
            ScoreRepository.findById.mockResolvedValue(null);
            const result = await ScoreService.updateScore(1, { score: 3000 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Score not found' });
        });

        it('should return Err 400 if the new score is not a number', async () => {
            ScoreRepository.findById.mockResolvedValue({ playerId: 1, gameId: 1, score: 100 });
            const result = await ScoreService.updateScore(1, { score: 'mucho' });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
        });

        it('should return Err 400 if the new score is negative', async () => {
            ScoreRepository.findById.mockResolvedValue({ playerId: 1, gameId: 1, score: 100 });
            const result = await ScoreService.updateScore(1, { score: -50 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
        });

        it('should retain previous values if empty fields are sent', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: 260 };
            ScoreRepository.findById.mockResolvedValue(mockScore);
            ScoreRepository.update.mockResolvedValue(mockScore);

            await ScoreService.updateScore(1, {});

            expect(ScoreRepository.update).toHaveBeenCalledWith(1, {
                playerId: 1, gameId: 1, score: 260,
            });
        });

        it('should update the score successfully', async () => {
            const mockScoreData = { playerId: 1, gameId: 1, score: 260 };
            ScoreRepository.findById.mockResolvedValue(mockScoreData);
            ScoreRepository.update.mockResolvedValue({ ...mockScoreData, score: 450 });

            const result = await ScoreService.updateScore(1, { score: 450 });

            expect(ScoreRepository.update).toHaveBeenCalledWith(1, {
                playerId: 1, gameId: 1, score: 450,
            });
            expect(result.value.score).toBe(450);
        });
    });

    describe('deleteScore', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await ScoreService.deleteScore();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the score does not exist', async () => {
            ScoreRepository.delete.mockResolvedValue(false);
            const result = await ScoreService.deleteScore(666);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Score not found' });
        });

        it('should delete the score successfully', async () => {
            ScoreRepository.delete.mockResolvedValue(true);
            const result = await ScoreService.deleteScore(1);
            expect(result.value).toEqual({});
            expect(ScoreRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});