import CardRepository from '../../../dataAccess/repositories/cards.repository.js';
import GameRepository from '../../../dataAccess/repositories/game.repository.js';
import * as CardService from '../../../logic/services/cards.service.js';
import { formatCard } from '../../../helpers/unoDeck.js';

jest.mock('../../../dataAccess/repositories/cards.repository.js');
jest.mock('../../../dataAccess/repositories/game.repository.js');
jest.mock('../../../helpers/unoDeck.js');

describe('CardService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getAllCards', () => {
        it('should return Ok with all cards', async () => {
            const mockCards = [{ id: 1, color: 'red', value: '5' }, { id: 2, color: 'blue', value: '8' }];
            CardRepository.findAll.mockResolvedValue(mockCards);

            const result = await CardService.getAllCards();

            expect(CardRepository.findAll).toHaveBeenCalledTimes(1);
            expect(result.value).toEqual(mockCards);
        });
    });

    describe('getCardById', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await CardService.getCardById();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the card does not exist', async () => {
            CardRepository.findById.mockResolvedValue(null);
            const result = await CardService.getCardById(999);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Card not found' });
        });

        it('should return Ok with the card for a given id', async () => {
            const mockCard = { id: 1, color: 'red', value: '5', gameId: 1 };
            CardRepository.findById.mockResolvedValue(mockCard);
            const result = await CardService.getCardById(1);
            expect(result.value).toEqual(mockCard);
        });
    });

    describe('createCard', () => {
        it('should return Err 400 if required fields are missing', async () => {
            const result = await CardService.createCard({ color: 'red', gameId: 1 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'color, value and gameId are required',
            });
        });

        it('should return Err 400 if color is invalid', async () => {
            const result = await CardService.createCard({ color: 'purple', value: '5', gameId: 1 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'color must be one of: red, blue, yellow, green',
            });
            expect(GameRepository.findById).not.toHaveBeenCalled();
        });

        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await CardService.createCard({ color: 'red', value: '5', gameId: 1 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced game does not exist' });
        });

        it('should create a new card with default location and discardOrder', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Uno' });
            const createdCard = { id: 10, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
            CardRepository.create.mockResolvedValue(createdCard);

            const result = await CardService.createCard({ color: 'red', value: '5', gameId: 1 });

            expect(CardRepository.create).toHaveBeenCalledWith({
                color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null,
            });
            expect(result.value).toEqual(createdCard);
        });

        it('should create a card with a custom location and discardOrder', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Uno' });
            CardRepository.create.mockResolvedValue({ id: 11, color: 'blue', value: '2', gameId: 1, location: 'discard', discardOrder: 3 });

            await CardService.createCard({ color: 'blue', value: '2', gameId: 1, location: 'discard', discardOrder: 3 });

            expect(CardRepository.create).toHaveBeenCalledWith({
                color: 'blue', value: '2', gameId: 1, location: 'discard', discardOrder: 3,
            });
        });
    });

    describe('updateCard', () => {
        it('should return Err 404 if the card does not exist', async () => {
            CardRepository.findById.mockResolvedValue(null);
            const result = await CardService.updateCard(1, { color: 'blue' });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Card not found' });
        });

        it('should return Err 400 if the new color is invalid', async () => {
            CardRepository.findById.mockResolvedValue({ id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null });
            const result = await CardService.updateCard(1, { color: 'purple' });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'color must be one of: red, blue, yellow, green',
            });
        });

        it('should return Err 404 if the new referenced game does not exist', async () => {
            CardRepository.findById.mockResolvedValue({ id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null });
            GameRepository.findById.mockResolvedValue(null);

            const result = await CardService.updateCard(1, { gameId: 99 });

            expect(result.error).toMatchObject({ statusCode: 404, message: 'Referenced game does not exist' });
        });

        it('should retain previous values if empty fields are sent', async () => {
            const mockCard = { id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
            CardRepository.findById.mockResolvedValue(mockCard);
            CardRepository.update.mockResolvedValue(mockCard);

            await CardService.updateCard(1, {});

            expect(GameRepository.findById).not.toHaveBeenCalled();
            expect(CardRepository.update).toHaveBeenCalledWith(1, {
                color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null,
            });
        });

        it('should update the card successfully', async () => {
            const mockCard = { id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
            CardRepository.findById.mockResolvedValue(mockCard);
            CardRepository.update.mockResolvedValue({ ...mockCard, color: 'green' });

            const result = await CardService.updateCard(1, { color: 'green' });

            expect(CardRepository.update).toHaveBeenCalledWith(1, {
                color: 'green', value: '5', gameId: 1, location: 'deck', discardOrder: null,
            });
            expect(result.value.color).toBe('green');
        });
    });

    describe('deleteCard', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await CardService.deleteCard();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the card does not exist', async () => {
            CardRepository.delete.mockResolvedValue(false);
            const result = await CardService.deleteCard(999);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Card not found' });
        });

        it('should delete the card successfully', async () => {
            CardRepository.delete.mockResolvedValue(true);
            const result = await CardService.deleteCard(1);
            expect(result.value).toEqual({});
            expect(CardRepository.delete).toHaveBeenCalledWith(1);
        });
    });

    describe('createInitCard', () => {
        it('should create a discard card with a random color and value', async () => {
            jest.spyOn(Math, 'random')
                .mockReturnValueOnce(0)   // color index -> 'red'
                .mockReturnValueOnce(0);  // value -> 0

            GameRepository.findById.mockResolvedValue({ id: 5, name: 'Uno' });
            CardRepository.create.mockResolvedValue({ id: 20, color: 'red', value: '0', gameId: 5, location: 'discard', discardOrder: 1 });

            const result = await CardService.createInitCard('5');

            expect(CardRepository.create).toHaveBeenCalledWith({
                color: 'red', value: '0', gameId: 5, location: 'discard', discardOrder: 1,
            });
            expect(result.value.location).toBe('discard');

            Math.random.mockRestore();
        });
    });

    describe('getTopCard', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await CardService.getTopCard();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await CardService.getTopCard(999);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return the existing top discard card without creating a new one', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Uno' });
            const existingTopCard = { id: 7, color: 'green', value: '9', gameId: 1, location: 'discard', discardOrder: 2 };
            CardRepository.findTopDiscardByGameId.mockResolvedValue(existingTopCard);
            formatCard.mockReturnValue('Green 9');

            const result = await CardService.getTopCard(1);

            expect(CardRepository.create).not.toHaveBeenCalled();
            expect(formatCard).toHaveBeenCalledWith(existingTopCard);
            expect(result.value).toEqual({ game_id: 1, top_card: 'Green 9' });
        });

        it('should create and return an init card if none exists yet', async () => {
            jest.spyOn(Math, 'random')
                .mockReturnValueOnce(0.99) // color index -> 'green' (last of 4)
                .mockReturnValueOnce(0.5); // value -> 5

            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Uno' });
            CardRepository.findTopDiscardByGameId.mockResolvedValue(null);
            const newCard = { id: 8, color: 'green', value: '5', gameId: 1, location: 'discard', discardOrder: 1 };
            CardRepository.create.mockResolvedValue(newCard);
            formatCard.mockReturnValue('Green 5');

            const result = await CardService.getTopCard(1);

            expect(CardRepository.create).toHaveBeenCalledWith({
                color: 'green', value: '5', gameId: 1, location: 'discard', discardOrder: 1,
            });
            expect(formatCard).toHaveBeenCalledWith(newCard);
            expect(result.value).toEqual({ game_id: 1, top_card: 'Green 5' });

            Math.random.mockRestore();
        });
    });
});