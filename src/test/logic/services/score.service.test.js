import ScoreRepository from '../../../dataAccess/repositories/score.repository.js';
import * as ScoreService from '../../../logic/services/score.service.js';
import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import GameRepository from '../../../dataAccess/repositories/game.repository.js';
import scoreRepository from '../../../dataAccess/repositories/score.repository.js';

jest.mock('../../../dataAccess/repositories/score.repository.js');
jest.mock('../../../dataAccess/repositories/player.repository.js');
jest.mock('../../../dataAccess/repositories/game.repository.js');

describe('ScoreService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllScores', () => {
        it('should return the score for a given all scores', async () => {
            const mockScore = [
                { playerId: 1, gameId: 1, score: 100 },
                { playerId: 2, gameId: 1, score: 300 }];
            ScoreRepository.findAll.mockResolvedValue(mockScore);

            const result = await ScoreService.getAllScores();
            expect(ScoreRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockScore);
        });
    });

    describe('getScoreById', () => {
        it('should return error 400 dont pass Id', async () => {
            await expect(ScoreService.getScoreById()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('should return error 404 if the score dont exist', async () => {
            ScoreRepository.findById.mockResolvedValue(null);

            await expect(ScoreService.getScoreById(666)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Score not found',
            });
        });

        it('should return the score for a give Id scores', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: 160 };
            ScoreRepository.findById.mockResolvedValue(mockScore);

            const result = await ScoreService.getScoreById(1, 1);
            expect(ScoreRepository.findById).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockScore);
        });

    });

    /** Use valid.jwt.token for the game in score needs the token but I cant generate in the test*/
    describe('createScore', () => {
        it('should throw  an error 404 if the game and player does not existe', async () => {

            await expect(ScoreService.createScore({ playerId: 1, gameId: 3 })).rejects.toMatchObject({
                statusCode: 400,
                message: 'playerId, gameId and score are required',
            });
        });
        it('should create a new score', async () => {
            const mockPlayer = { id: 1, username: 'ale', email: 'ale@test.com', password: 'pass123' };
            const mockGame = { id: 1, name: 'Uno', rules: 'yes, next', accessToken: 'valid.jwt.token' };
            const mockScoreData = { playerId: 1, gameId: 1, score: 260 };

            PlayerRepository.findById.mockResolvedValue(mockPlayer);
            GameRepository.findById.mockResolvedValue(mockGame);
            ScoreRepository.create.mockResolvedValue(mockScoreData);

            const result = await ScoreService.createScore(mockScoreData);
            expect(PlayerRepository.findById).toHaveBeenCalledWith(mockScoreData.playerId);
            expect(GameRepository.findById).toHaveBeenCalledWith(mockScoreData.gameId);
            expect(ScoreRepository.create).toHaveBeenCalledWith(mockScoreData);
            expect(result).toEqual(expect.objectContaining(mockScoreData));
        });

        it('should throw error 400 if the new negative score', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: -100 };

            await expect(
                ScoreService.createScore(mockScore)
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
        });

        it('should throw an error if the player does not exist', async () => {
            PlayerRepository.findById.mockResolvedValue(null);
            const mockScoreData = { playerId: 1, gameId: 1, score: 220 };

            await expect(ScoreService.createScore(mockScoreData)).rejects.toThrow('Referenced player does not exist');
        });

        it('should throw an error if the game does not exist', async () => {
            const mockPlayer = { id: 1, username: 'ale', email: 'ale@gmail.com', password: 'pass123' };
            PlayerRepository.findById.mockResolvedValue(mockPlayer);
            GameRepository.findById.mockResolvedValue(null);
            const mockScoreData = { playerId: 1, gameId: 1, score: 120 };

            await expect(ScoreService.createScore(mockScoreData)).rejects.toThrow('Referenced game does not exist');
        });
    });

    describe('updateScore', () => {
        it('should throw  an error 404 if the game and player does not existe', async () => {
            ScoreRepository.findById.mockResolvedValue(null);

            await expect(ScoreService.updateScore(1, { score: 3000 })).rejects.toMatchObject({
                statusCode: 404,
                message: 'Score not found',
            });
        });

        it('should throw error 400 if the new score no it s a number', async () => {
            const existingScore = { playerId: 1, gameId: 1, score: 100 };
            ScoreRepository.findById.mockResolvedValue(existingScore);

            await expect(
                ScoreService.updateScore(1, { score: 'mucho' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
        });

        it('should throw error 400 if the new negative score', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: 100 };
            ScoreRepository.findById.mockResolvedValue(mockScore);

            await expect(
                ScoreService.updateScore(1, { score: -50 })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'score has to be a non-negative number',
            });
        });

        it('should return the actual values if to send the empty fields', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: 260 };
            ScoreRepository.findById.mockResolvedValue(mockScore);
            ScoreRepository.update.mockResolvedValue(mockScore);

            await ScoreService.updateScore(1, {})
            expect(ScoreRepository.update).toHaveBeenCalledWith(1, {
                playerId: 1,
                gameId: 1,
                score: 260,
            });
        });

        it('should return the send Score updated successfully', async () => {
            const mockScoreData = { playerId: 1, gameId: 1, score: 260 };
            ScoreRepository.findById.mockResolvedValue(mockScoreData);
            ScoreRepository.update.mockResolvedValue({ ...mockScoreData, score: 450 })
            const result = await ScoreService.updateScore(1, { score: 450 });
            expect(ScoreRepository.update).toHaveBeenCalledWith(1, {
                playerId: 1,
                gameId: 1,
                score: 450,
            });
            expect(result.score).toBe(450);
        });
    });

    describe('deleteScore', () => {
        it('should return error 400 dont pass id', async () => {
            await expect(ScoreService.deleteScore()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('should return error 404 if the score doesnt exist', async () => {
            ScoreRepository.delete.mockResolvedValue(false);

            await expect(ScoreService.deleteScore(666)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Score not found',
            });
        });

        it('should delete the score successfully', async () => {
            ScoreRepository.delete.mockResolvedValue(true);

            const result = await ScoreService.deleteScore(1);

            expect(result).toEqual({});
            expect(ScoreRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
