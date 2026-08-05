import ScoreRepository from '../../../dataAccess/repositories/score.repository.js';
import * as ScoreService from '../../../logic/services/score.service.js';
import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import GameRepository from '../../../dataAccess/repositories/game.repository.js';

jest.mock('../../../dataAccess/repositories/score.repository.js');
jest.mock('../../../dataAccess/repositories/player.repository.js');
jest.mock('../../../dataAccess/repositories/game.repository.js');

describe('ScoreService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllScores', () => {
        it('should return the score for a given all scores', async () => {
            const mockScore = [{ playerId: 1, gameId: 1, score: 100 }, { playerId: 2, gameId: 1, score: 300 }];
            ScoreRepository.findAll.mockResolvedValue(mockScore);

            const result = await ScoreService.getAllScores();
            expect(ScoreRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockScore);
        });
    });

    describe('getScore', () => {
        it('should return the score for a given Id scores', async () => {
            const mockScore = { playerId: 1, gameId: 1, score: 160 };
            ScoreRepository.findById.mockResolvedValue(mockScore);

            const result = await ScoreService.getScoreById(1, 1);
            expect(ScoreRepository.findById).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockScore);
        });

        it('should throw an error if the score is not found', async () => {
            ScoreRepository.findById.mockResolvedValue(null);

            await expect(ScoreService.getScoreById(1, 1)).rejects.toThrow('Score not found');
        });
        it('should throw an error if the playerId or gameId is not provided', async () => {
            await expect(ScoreService.getScoreById(null, 1)).rejects.toThrow('ID is required');
            await expect(ScoreService.getScoreById(1, null)).rejects.toThrow('Score not found');
        });
    });

    /** Use valid.jwt.token for the game needs the token but I cant generate in the test*/
    describe('createScore', () => {
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

    describe('updateScore',() => {

    });
});
