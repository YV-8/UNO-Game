jest.mock('../../../container.js', () => ({
    cardService: {
        getAllCards: jest.fn(), getCardById: jest.fn(), createCard: jest.fn(),
        updateCard: jest.fn(), deleteCard: jest.fn(),
    },
}));

import { cardService } from '../../../container.js';
import * as cardController from '../../../presentation/controllers/card.controller.js';
import Respond from '../../../logic/monads/respond.js';

describe('cards.controller', () => {
    let res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    });

    describe('getAllCards', () => {
        test('responds 200 with all cards', async () => {
            cardService.getAllCards.mockResolvedValue(Respond.Ok([{ id: 1 }]));
            await cardController.getAllCards({}, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });
    });

    describe('getCardById', () => {
        test('passes req.params.id through and responds 200', async () => {
            cardService.getCardById.mockResolvedValue(Respond.Ok({ id: 5 }));
            await cardController.getCardById({ params: { id: '5' } }, res);
            expect(cardService.getCardById).toHaveBeenCalledWith('5');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('responds with the error status when the card is not found', async () => {
            cardService.getCardById.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Card not found' }));
            await cardController.getCardById({ params: { id: '99' } }, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Card not found' });
        });
    });

    describe('createCard', () => {
        test('passes req.body through and responds 201', async () => {
            const body = { color: 'red', value: '3', gameId: 1 };
            cardService.createCard.mockResolvedValue(Respond.Ok(body));
            await cardController.createCard({ body }, res);
            expect(cardService.createCard).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateCard', () => {
        test('passes id and body through and responds 200', async () => {
            cardService.updateCard.mockResolvedValue(Respond.Ok({ id: 1, location: 'hand' }));
            await cardController.updateCard({ params: { id: '1' }, body: { location: 'hand' } }, res);
            expect(cardService.updateCard).toHaveBeenCalledWith('1', { location: 'hand' });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteCard', () => {
        test('responds 200 on successful delete', async () => {
            cardService.deleteCard.mockResolvedValue(Respond.Ok({}));
            await cardController.deleteCard({ params: { id: '1' } }, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('responds with the error status when delete fails', async () => {
            cardService.deleteCard.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Card not found' }));
            await cardController.deleteCard({ params: { id: '99' } }, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});