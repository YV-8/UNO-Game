import * as CardController from '../../../presentation/controllers/cards.controller.js';
import { cardService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    cardService: {
        getAllCards: jest.fn(), getCardById: jest.fn(), createCard: jest.fn(),
        updateCard: jest.fn(), deleteCard: jest.fn(), getTopCard: jest.fn(),
    },
}));

describe('CardController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('createCard: should respond 201', async () => {
        const body = { color: 'red', value: '5', gameId: 1 };
        cardService.createCard.mockResolvedValue(Result.Ok({ id: 10, ...body }));
        const req = mockRequest({ body });

        await CardController.createCard(req, res);

        expect(cardService.createCard).toHaveBeenCalledWith(body);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('getTopCard: should convert game_id to number', async () => {
        cardService.getTopCard.mockResolvedValue(Result.Ok({ game_id: 1, top_card: 'Ace of Spades' }));
        const req = mockRequest({ body: { game_id: '1' } });

        await CardController.getTopCard(req, res);

        expect(cardService.getTopCard).toHaveBeenCalledWith(1);
    });
});