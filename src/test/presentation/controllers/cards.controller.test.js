import * as CardController from '../../../presentation/controllers/cards.controller.js';
import * as CardService from '../../../logic/services/cards.service.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../logic/services/cards.service.js');

describe('CardController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    describe('getAllCards', () => {
        it('should respond 200', async () => {
            CardService.getAllCards.mockResolvedValue(Result.Ok([{ id: 1, color: 'red', value: '5' }]));
            await CardController.getAllCards(mockRequest(), res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getCardById', () => {
        it('should use params.id', async () => {
            CardService.getCardById.mockResolvedValue(Result.Ok({ id: 3, color: 'blue' }));
            const req = mockRequest({ params: { id: '3' } });

            await CardController.getCardById(req, res);

            expect(CardService.getCardById).toHaveBeenCalledWith('3');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('createCard', () => {
        it('should pass the body and respond 201', async () => {
            const body = { color: 'red', value: '5', gameId: 1 };
            CardService.createCard.mockResolvedValue(Result.Ok({ id: 10, ...body }));
            const req = mockRequest({ body });

            await CardController.createCard(req, res);

            expect(CardService.createCard).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should respond 400 with { error } if color is invalid', async () => {
            CardService.createCard.mockResolvedValue(
                Result.Err({ statusCode: 400, message: 'color must be one of: red, blue, yellow, green' })
            );
            const req = mockRequest({ body: { color: 'purple', value: '5', gameId: 1 } });

            await CardController.createCard(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'color must be one of: red, blue, yellow, green' });
        });
    });

    describe('updateCard', () => {
        it('should use params.id and the body', async () => {
            CardService.updateCard.mockResolvedValue(Result.Ok({ id: 1, color: 'blue' }));
            const req = mockRequest({ params: { id: '1' }, body: { color: 'blue' } });

            await CardController.updateCard(req, res);

            expect(CardService.updateCard).toHaveBeenCalledWith('1', { color: 'blue' });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteCard', () => {
        it('should delete using params.id', async () => {
            CardService.deleteCard.mockResolvedValue(Result.Ok({}));
            const req = mockRequest({ params: { id: '1' } });

            await CardController.deleteCard(req, res);

            expect(CardService.deleteCard).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getTopCard', () => {
        it('should convert game_id to number', async () => {
            const topCardData = { game_id: 1, top_card: 'Ace of Spades' };
            CardService.getTopCard.mockResolvedValue(Result.Ok(topCardData));
            const req = mockRequest({ body: { game_id: '1' } });

            await CardController.getTopCard(req, res);

            expect(CardService.getTopCard).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});