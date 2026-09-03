import { scoreService } from '../../container.js';
import { emitResult } from './socketHelpers.js';

export const registerScoreSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        socket.on('get-all-scores', async () => {
            const result = await scoreService.getAllScores();
            emitResult(socket, 'get-all-scores', result);
        });

        socket.on('get-score', async ({ id }) => {
            const result = await scoreService.getScoreById(id);
            emitResult(socket, 'get-score', result);
        });

        socket.on('create-score', async (payload) => {
            const result = await scoreService.createScore(payload);
            emitResult(socket, 'create-score', result);
        });

        socket.on('update-score', async ({ id, ...data }) => {
            const result = await scoreService.updateScore(id, data);
            emitResult(socket, 'update-score', result);
        });

        socket.on('delete-score', async ({ id }) => {
            const result = await scoreService.deleteScore(id);
            emitResult(socket, 'delete-score', result);
        });
    });
};