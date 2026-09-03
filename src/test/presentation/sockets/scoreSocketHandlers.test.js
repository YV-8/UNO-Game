jest.mock('../../../container.js', () => ({
    scoreService: {
        getAllScores: jest.fn(), getScoreById: jest.fn(), createScore: jest.fn(),
        updateScore: jest.fn(), deleteScore: jest.fn(),
    },
}));

import { scoreService } from '../../../container.js';
import { registerScoreSocketHandlers } from '../../../presentation/sockets/scoreSocketHandlers.js';
import Respond from '../../../logic/monads/respond.js';

describe('scoreSocketHandlers', () => {
    let io, connectionCb, socket;

    beforeEach(() => {
        jest.clearAllMocks();
        io = { on: jest.fn((event, cb) => { if (event === 'connection') connectionCb = cb; }) };
        socket = { handlers: {}, on: jest.fn(function (event, cb) { this.handlers[event] = cb; }), emit: jest.fn() };
        registerScoreSocketHandlers(io);
        connectionCb(socket);
    });

    describe('get-all-scores', () => {
        test('emits all scores on success', async () => {
            scoreService.getAllScores.mockResolvedValue(Respond.Ok([{ playerId: 1, score: 100 }]));
            await socket.handlers['get-all-scores']();
            expect(socket.emit).toHaveBeenCalledWith('get-all-scores', [{ playerId: 1, score: 100 }]);
        });
    });

    describe('get-score', () => {
        test('emits the score by id', async () => {
            scoreService.getScoreById.mockResolvedValue(Respond.Ok({ id: 1, score: 260 }));
            await socket.handlers['get-score']({ id: 1 });
            expect(scoreService.getScoreById).toHaveBeenCalledWith(1);
            expect(socket.emit).toHaveBeenCalledWith('get-score', { id: 1, score: 260 });
        });
    });

    describe('create-score', () => {
        test('creates and emits the score', async () => {
            const payload = { playerId: 1, gameId: 1, score: 100 };
            scoreService.createScore.mockResolvedValue(Respond.Ok(payload));
            await socket.handlers['create-score'](payload);
            expect(scoreService.createScore).toHaveBeenCalledWith(payload);
            expect(socket.emit).toHaveBeenCalledWith('create-score', payload);
        });
    });

    describe('update-score', () => {
        test('splits id from the rest of the payload', async () => {
            scoreService.updateScore.mockResolvedValue(Respond.Ok({ id: 1, score: 450 }));
            await socket.handlers['update-score']({ id: 1, score: 450 });
            expect(scoreService.updateScore).toHaveBeenCalledWith(1, { score: 450 });
        });
    });

    describe('delete-score', () => {
        test('emits the result on success', async () => {
            scoreService.deleteScore.mockResolvedValue(Respond.Ok({}));
            await socket.handlers['delete-score']({ id: 1 });
            expect(socket.emit).toHaveBeenCalledWith('delete-score', {});
        });

        test('emits an error when nothing was deleted', async () => {
            scoreService.deleteScore.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Score not found' }));
            await socket.handlers['delete-score']({ id: 99 });
            expect(socket.emit).toHaveBeenCalledWith('error', { event: 'delete-score', message: 'Score not found' });
        });
    });
});