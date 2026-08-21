import Result from '../../../logic/monads/respond.js';
import { createCardValidator } from '../../../logic/validators/cardValidator.js';
import { createCardRules } from '../../../logic/validators/cardRules.js';
import { createCardService } from '../../../logic/services/cards.service.js';

describe('CardService (DI)', () => {
    const buildService = (overrides = {}) => {
        const cardRepository = {
            findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(),
            delete: jest.fn(), findTopDiscardByGameId: jest.fn(),
            ...overrides.cardRepository,
        };
        const gameRepository = { findById: jest.fn(), ...overrides.gameRepository };
        const formatCard = jest.fn((card) => `formatted:${card.value}`);

        const cardValidator = createCardValidator({ cardRepository, gameRepository });
        const cardRules = createCardRules(cardValidator);
        const service = createCardService({ cardRepository, cardRules, formatCard, Result });

        return { service, cardRepository, gameRepository, formatCard };
    };

    describe('getAllCards', () => {
        it('should return Ok with all cards', async () => {
            const { service, cardRepository } = buildService();
            cardRepository.findAll.mockResolvedValue([{ id: 1, color: 'red', value: '5' }]);
            const result = await service.getAllCards();
            expect(result.value).toEqual([{ id: 1, color: 'red', value: '5' }]);
        });
    });

    describe('createCard', () => {
        it('should return Err 400 if fields are missing', async () => {
            const { service } = buildService();
            const result = await service.createCard({ color: 'red', gameId: 1 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'color, value and gameId are required',
            });
        });

        it('should return Err 400 if color is invalid', async () => {
            const { service } = buildService();
            const result = await service.createCard({ color: 'purple', value: '5', gameId: 1 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'color must be one of: red, blue, yellow, green',
            });
        });

        it('should return Err 404 if the game does not exist', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue(null);
            const result = await service.createCard({ color: 'red', value: '5', gameId: 999 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced game does not exist' });
        });

        it('should create the card with default values', async () => {
            const { service, gameRepository, cardRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            cardRepository.create.mockResolvedValue({ id: 10, color: 'red', value: '5' });

            const result = await service.createCard({ color: 'red', value: '5', gameId: 1 });

            expect(cardRepository.create).toHaveBeenCalledWith({
                color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null,
            });
            expect(result.value).toEqual({ id: 10, color: 'red', value: '5' });
        });
    });

    describe('updateCard', () => {
        it('should return Err 404 if the card does not exist', async () => {
            const { service, cardRepository } = buildService();
            cardRepository.findById.mockResolvedValue(null);
            const result = await service.updateCard(1, { color: 'red' });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Card not found' });
        });

        it('should update only the fields sent', async () => {
            const { service, cardRepository } = buildService();
            const existingCard = { id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
            cardRepository.findById.mockResolvedValue(existingCard);
            cardRepository.update.mockResolvedValue({ ...existingCard, color: 'blue' });

            const result = await service.updateCard(1, { color: 'blue' });

            expect(cardRepository.update).toHaveBeenCalledWith(1, {
                color: 'blue', value: '5', gameId: 1, location: 'deck', discardOrder: null,
            });
            expect(result.value.color).toBe('blue');
        });
    });

    describe('deleteCard', () => {
        it('should delete the card', async () => {
            const { service, cardRepository } = buildService();
            cardRepository.delete.mockResolvedValue(true);
            const result = await service.deleteCard(1);
            expect(result.value).toEqual({});
        });
    });

    describe('getTopCard', () => {
        it('should return Err 404 if the game does not exist', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue(null);
            const result = await service.getTopCard(999);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return the existing top card formatted', async () => {
            const { service, gameRepository, cardRepository, formatCard } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            cardRepository.findTopDiscardByGameId.mockResolvedValue({ id: 5, value: '7' });

            const result = await service.getTopCard(1);

            expect(formatCard).toHaveBeenCalledWith({ id: 5, value: '7' });
            expect(result.value).toEqual({ game_id: 1, top_card: 'formatted:7' });
        });

        it('should create an init card if none exists in discard', async () => {
            const { service, gameRepository, cardRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            cardRepository.findTopDiscardByGameId.mockResolvedValue(null);
            cardRepository.create.mockResolvedValue({ id: 99, color: 'green', value: '4' });

            const result = await service.getTopCard(1);

            expect(cardRepository.create).toHaveBeenCalledTimes(1);
            expect(result.value.game_id).toBe(1);
        });
    });
});