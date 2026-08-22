import { cardService as createCardService } from '../../../logic/services/card.service.js';
import Respond from '../../../logic/monads/respond.js';

describe('CardService Unit Tests', () => {
    let cardRepository, cardRules, cardService;

    beforeEach(() => {
        cardRepository = { findAll: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() };
        cardRules = {
            validateGetCard: jest.fn(),
            validateCreateCard: jest.fn(),
            validateUpdateCard: jest.fn(),
            validateDeleteCard: jest.fn(),
        };

        cardService = createCardService({ cardRepository, cardRules, respond: Respond });
    });

    describe('getAllCards', () => {
        test('returns Ok with all cards', async () => {
            cardRepository.findAll.mockResolvedValue([{ id: 1, color: 'red', value: '3' }]);
            const result = await cardService.getAllCards();
            expect(result.value).toEqual([{ id: 1, color: 'red', value: '3' }]);
        });
    });

    describe('getCardById', () => {
        test('returns Err when validation fails', async () => {
            cardRules.validateGetCard.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Card not found' }));
            const result = await cardService.getCardById(99);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok with the card', async () => {
            cardRules.validateGetCard.mockResolvedValue(Respond.Ok({ card: { id: 1, value: '3' } }));
            const result = await cardService.getCardById(1);
            expect(result.value).toEqual({ id: 1, value: '3' });
        });
    });

    describe('createCard', () => {
        test('returns Err if validation fails', async () => {
            cardRules.validateCreateCard.mockResolvedValue(Respond.Err({ statusCode: 400, message: 'Err' }));
            const result = await cardService.createCard({ color: 'red', value: '3', gameId: 1 });
            expect(result.isErr()).toBe(true);
        });

        test('creates the card', async () => {
            const cardData = { color: 'red', value: '3', gameId: 1, location: 'deck', discardOrder: null };
            cardRules.validateCreateCard.mockResolvedValue(Respond.Ok(cardData));
            cardRepository.create.mockResolvedValue(cardData);

            const result = await cardService.createCard(cardData);

            expect(cardRepository.create).toHaveBeenCalledWith(cardData);
            expect(result.value).toEqual(cardData);
        });
    });

    describe('updateCard', () => {
        test('keeps previous values when fields are not provided', async () => {
            cardRules.validateUpdateCard.mockResolvedValue(Respond.Ok({
                card: { id: 1, color: 'red', value: '3', gameId: 1, location: 'deck', discardOrder: null },
                color: undefined, value: undefined, gameId: undefined, location: 'hand', discardOrder: undefined,
            }));

            await cardService.updateCard(1, { location: 'hand' });

            expect(cardRepository.update).toHaveBeenCalledWith(1, {
                color: 'red', value: '3', gameId: 1, location: 'hand', discardOrder: null,
            });
        });
    });

    describe('deleteCard', () => {
        test('returns Err 404 when nothing was deleted', async () => {
            cardRules.validateDeleteCard.mockResolvedValue(Respond.Ok({}));
            cardRepository.delete.mockResolvedValue(false);
            const result = await cardService.deleteCard(1);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok on successful delete', async () => {
            cardRules.validateDeleteCard.mockResolvedValue(Respond.Ok({}));
            cardRepository.delete.mockResolvedValue(true);
            const result = await cardService.deleteCard(1);
            expect(result.value).toEqual({});
        });
    });
});