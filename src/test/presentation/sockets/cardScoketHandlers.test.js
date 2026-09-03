jest.mock('../../../container.js', () => ({
    cardService: {
        getAllCards: jest.fn(), getCardById: jest.fn(), createCard: jest.fn(),
        updateCard: jest.fn(), deleteCard: jest.fn(),
    },
}));

import { cardService } from '../../../container.js';
import { registerCardsSocketHandlers } from '../../../presentation/sockets/cardsSocketHandlers.js';
import Respond from '../../../logic/monads/respond.js';

describe('cardsSocketHandlers', () => {
    let io, connectionCb, socket;

    beforeEach(() => {
        jest.clearAllMocks();
        io = { on: jest.fn((event, cb) => { if (event === 'connection') connectionCb = cb; }) };
        socket = { handlers: {}, on: jest.fn(function (event, cb) { this.handlers[event] = cb; }), emit: jest.fn() };
        registerCardsSocketHandlers(io);
        connectionCb(socket);
    });

    describe('get-all-cards', () => {
        test('emits all cards on success', async () => {
            cardService.getAllCards.mockResolvedValue(Respond.Ok([{ id: 1 }]));
            await socket.handlers['get-all-cards']();
            expect(socket.emit).toHaveBeenCalledWith('get-all-cards', [{ id: 1 }]);
        });
    });

    describe('get-card', () => {
        test('emits the card on success', async () => {
            cardService.getCardById.mockResolvedValue(Respond.Ok({ id: 1, value: '3' }));
            await socket.handlers['get-card']({ id: 1 });
            expect(cardService.getCardById).toHaveBeenCalledWith(1);
            expect(socket.emit).toHaveBeenCalledWith('get-card', { id: 1, value: '3' });
        });

        test('emits an error when the card does not exist', async () => {
            cardService.getCardById.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Card not found' }));
            await socket.handlers['get-card']({ id: 99 });
            expect(socket.emit).toHaveBeenCalledWith('error', { event: 'get-card', message: 'Card not found' });
        });
    });

    describe('create-card', () => {
        test('creates and emits the card', async () => {
            const payload = { color: 'red', value: '3', gameId: 1 };
            cardService.createCard.mockResolvedValue(Respond.Ok(payload));
            await socket.handlers['create-card'](payload);
            expect(cardService.createCard).toHaveBeenCalledWith(payload);
            expect(socket.emit).toHaveBeenCalledWith('create-card', payload);
        });
    });

    describe('update-card', () => {
        test('splits id from the rest of the payload', async () => {
            cardService.updateCard.mockResolvedValue(Respond.Ok({ id: 1, location: 'hand' }));
            await socket.handlers['update-card']({ id: 1, location: 'hand' });
            expect(cardService.updateCard).toHaveBeenCalledWith(1, { location: 'hand' });
        });
    });

    describe('delete-card', () => {
        test('emits the result on success', async () => {
            cardService.deleteCard.mockResolvedValue(Respond.Ok({}));
            await socket.handlers['delete-card']({ id: 1 });
            expect(socket.emit).toHaveBeenCalledWith('delete-card', {});
        });

        test('emits an error when nothing was deleted', async () => {
            cardService.deleteCard.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Card not found' }));
            await socket.handlers['delete-card']({ id: 99 });
            expect(socket.emit).toHaveBeenCalledWith('error', { event: 'delete-card', message: 'Card not found' });
        });
    });
});