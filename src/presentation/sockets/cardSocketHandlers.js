import { cardService } from '../../container.js';
import { emitResult } from './socketHelpers.js';

export const registerCardsSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        socket.on('get-all-cards', async () => {
            const result = await cardService.getAllCards();
            emitResult(socket, 'get-all-cards', result);
        });

        socket.on('get-card', async ({ id }) => {
            const result = await cardService.getCardById(id);
            emitResult(socket, 'get-card', result);
        });

        socket.on('create-card', async (payload) => {
            const result = await cardService.createCard(payload);
            emitResult(socket, 'create-card', result);
        });

        socket.on('update-card', async ({ id, ...data }) => {
            const result = await cardService.updateCard(id, data);
            emitResult(socket, 'update-card', result);
        });

        socket.on('delete-card', async ({ id }) => {
            const result = await cardService.deleteCard(id);
            emitResult(socket, 'delete-card', result);
        });
    });
};