import * as ScoreController from '../../../presentation/controllers/score.controller.js';
import * as ScoreService from '../../../logic/services/score.service.js';
import Result from '../../../logic/monads/result.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../logic/services/score.service.js');

describe('ScoreController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    describe('getAllScore', () => {
        it('should respond 200', async () => {
            ScoreService.getAllScores.mockResolvedValue(Result.Ok([{ playerId: 1, gameId: 1, score: 100 }]));
            await ScoreController.getAllScore(mockRequest(), res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getScoreById', () => {
        it('should respond 404 with { error } if not found', async () => {
            ScoreService.getScoreById.mockResolvedValue(
                Result.Err({ statusCode: 404, message: 'Score not found' })
            );
            const req = mockRequest({ params: { id: '99' } });

            await ScoreController.getScoreById(req, res);

            expect(ScoreService.getScoreById).toHaveBeenCalledWith('99');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Score not found' });
        });
    });

    describe('createScore', () => {
        it('should respond 201 with the created score', async () => {
            const scoreData = { playerId: 1, gameId: 1, score: 260 };
            ScoreService.createScore.mockResolvedValue(Result.Ok(scoreData));
            const req = mockRequest({ body: scoreData });

            await ScoreController.createScore(req, res);

            expect(ScoreService.createScore).toHaveBeenCalledWith(scoreData);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateScore', () => {
        it('should use params.id and the body', async () => {
            ScoreService.updateScore.mockResolvedValue(Result.Ok({ playerId: 1, gameId: 1, score: 450 }));
            const req = mockRequest({ params: { id: '1' }, body: { score: 450 } });

            await ScoreController.updateScore(req, res);

            expect(ScoreService.updateScore).toHaveBeenCalledWith('1', { score: 450 });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteScore', () => {
        it('should delete using params.id', async () => {
            ScoreService.deleteScore.mockResolvedValue(Result.Ok({}));
            const req = mockRequest({ params: { id: '1' } });

            await ScoreController.deleteScore(req, res);

            expect(ScoreService.deleteScore).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});