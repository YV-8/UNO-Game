import * as ScoreController from '../../../presentation/controllers/score.controller.js';
import { scoreService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    scoreService: {
        getAllScores: jest.fn(),
        getScoreById: jest.fn(),
        createScore: jest.fn(),
        updateScore: jest.fn(),
        deleteScore: jest.fn(),
    },
}));

describe('ScoreController', () => {
    let res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('getAllScore: should return 200 with all scores', async () => {
        const mockScores = [{ id: 1, points: 100 }];
        scoreService.getAllScores.mockResolvedValue(Result.Ok(mockScores));
        const req = mockRequest();

        await ScoreController.getAllScore(req, res);

        expect(scoreService.getAllScores).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockScores);
    });

    it('getScoreById: should return 200 with score details', async () => {
        const mockScore = { id: 1, points: 100 };
        scoreService.getScoreById.mockResolvedValue(Result.Ok(mockScore));
        const req = mockRequest({ params: { id: '1' } });

        await ScoreController.getScoreById(req, res);

        expect(scoreService.getScoreById).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockScore);
    });

    it('createScore: should return 201 with created score', async () => {
        const scoreData = { points: 200, userId: 1 };
        scoreService.createScore.mockResolvedValue(Result.Ok(scoreData));
        const req = mockRequest({ body: scoreData });

        await ScoreController.createScore(req, res);

        expect(scoreService.createScore).toHaveBeenCalledWith(scoreData);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(scoreData);
    });

    it('updateScore: should return 200 with updated score', async () => {
        const scoreData = { points: 300 };
        scoreService.updateScore.mockResolvedValue(Result.Ok(scoreData));
        const req = mockRequest({ params: { id: '1' }, body: scoreData });

        await ScoreController.updateScore(req, res);

        expect(scoreService.updateScore).toHaveBeenCalledWith('1', scoreData);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(scoreData);
    });

    it('deleteScore: should return 200 on deletion', async () => {
        scoreService.deleteScore.mockResolvedValue(Result.Ok({ message: 'Score deleted' }));
        const req = mockRequest({ params: { id: '1' } });

        await ScoreController.deleteScore(req, res);

        expect(scoreService.deleteScore).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Score deleted' });
    });
});
