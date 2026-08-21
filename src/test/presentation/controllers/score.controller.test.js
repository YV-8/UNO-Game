import * as ScoreController from '../../../presentation/controllers/score.controller.js';
import { scoreService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    scoreService: {
        getAllScores: jest.fn(), getScoreById: jest.fn(), createScore: jest.fn(),
        updateScore: jest.fn(), deleteScore: jest.fn(),
    },
}));

describe('ScoreController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('createScore: should respond 201', async () => {
        const scoreData = { playerId: 1, gameId: 1, score: 260 };
        scoreService.createScore.mockResolvedValue(Result.Ok(scoreData));
        const req = mockRequest({ body: scoreData });

        await ScoreController.createScore(req, res);

        expect(scoreService.createScore).toHaveBeenCalledWith(scoreData);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('updateScore: should use params.id and body', async () => {
        scoreService.updateScore.mockResolvedValue(Result.Ok({ playerId: 1, gameId: 1, score: 450 }));
        const req = mockRequest({ params: { id: '1' }, body: { score: 450 } });

        await ScoreController.updateScore(req, res);

        expect(scoreService.updateScore).toHaveBeenCalledWith('1', { score: 450 });
    });
});