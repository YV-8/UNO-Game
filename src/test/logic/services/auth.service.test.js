import CardRepository from '../../../dataAccess/repositories/cards.repository.js';
import GameRepository from '../../../dataAccess/repositories/game.repository.js';
import { formatCard } from '../../../helpers/unoDeck.js';
import * as CardService from '../../../logic/services/cards.service.js';

jest.mock('../../../dataAccess/repositories/cards.repository.js');
jest.mock('../../../dataAccess/repositories/game.repository.js');
jest.mock('../../../helpers/unoDeck.js');

describe('CardService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCards', () => {
        it('should return all cards successfully', async () => {
            // Arrange
            const mockCards = [{ id: 1, color: 'green', value: '5' }];
            CardRepository.findAll.mockResolvedValue(mockCards);

            // Act
            const result = await CardService.getAllCards();

            // Assert
            expect(result).toEqual(mockCards);
            expect(CardRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getCardById', () => {
        it('debe retornar error 400 si no se pasa id', async () => {
            await expect(CardService.getCardById()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe retornar error 404 si la carta no existe', async () => {
            // Arrange
            CardRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(CardService.getCardById(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Card not found',
            });
        });

        it('debe retornar la carta si existe', async () => {
            // Arrange
            const mockCard = { id: 1, color: 'red', value: '5' };
            CardRepository.findById.mockResolvedValue(mockCard);

            // Act
            const result = await CardService.getCardById(1);

            // Assert
            expect(result).toEqual(mockCard);
        });
    });

    describe('createCard', () => {
        it('debe retornar error 400 si falta color, value o gameId', async () => {
            await expect(
                CardService.createCard({ color: 'red', gameId: 1 })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'color, value and gameId are required',
            });
        });

        it('debe retornar error 400 si el color no es válido', async () => {
            await expect(
                CardService.createCard({ color: 'purple', value: '5', gameId: 1 })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'color must be one of: red, blue, yellow, green',
            });
        });

        it('debe retornar error 404 si el juego referenciado no existe', async () => {
            // Arrange
            GameRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                CardService.createCard({ color: 'red', value: '5', gameId: 999 })
            ).rejects.toMatchObject({
                statusCode: 404,
                message: 'Referenced game does not exist',
            });
            expect(CardRepository.create).not.toHaveBeenCalled();
        });

        it('debe crear la carta con los valores por defecto si no se pasan location/discardOrder', async () => {
            // Arrange
            GameRepository.findById.mockResolvedValue({ id: 1 });
            const createdCard = { id: 10, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
            CardRepository.create.mockResolvedValue(createdCard);

            // Act
            const result = await CardService.createCard({ color: 'red', value: '5', gameId: 1 });

            // Assert
            expect(CardRepository.create).toHaveBeenCalledWith({
                color: 'red',
                value: '5',
                gameId: 1,
                location: 'deck',
                discardOrder: null,
            });
            expect(result).toEqual(createdCard);
        });

        it('debe crear la carta con location y discardOrder personalizados', async () => {
            // Arrange
            GameRepository.findById.mockResolvedValue({ id: 1 });
            CardRepository.create.mockResolvedValue({ id: 11, color: 'blue', value: '2', gameId: 1, location: 'discard', discardOrder: 3 });

            // Act
            await CardService.createCard({ color: 'blue', value: '2', gameId: 1, location: 'discard', discardOrder: 3 });

            // Assert
            expect(CardRepository.create).toHaveBeenCalledWith({
                color: 'blue',
                value: '2',
                gameId: 1,
                location: 'discard',
                discardOrder: 3,
            });
        });
    });

    describe('updateCard', () => {
        it('Should throw error 404 if the card does not exist', async () => {
            CardRepository.findById.mockResolvedValue(null);
            await expect(CardService.updateCard(1, { color: 'red' })).rejects.toMatchObject({
                statusCode: 404,
                message: 'Card not found',
            });
        });

        it('should throw error 404 invalid color', async () => {
            CardRepository.findById.mockResolvedValue({ id: 1, color: 'red', value: '5', gameId: 1 });
            await expect(CardService.updateCard(1, { color: 'purple' })).rejects.toMatchObject({
                statusCode: 400,
                message: 'color must be one of: red, blue, yellow, green',
            });
        });

        it('should throw error 404 the game Id doesnt exist', async () => {
            const existingCard = { id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
            CardRepository.findById.mockResolvedValue(existingCard);
            GameRepository.findById.mockResolvedValue(null);

            await expect(
                CardService.updateCard(1, { gameId: 999 })
            ).rejects.toMatchObject({statusCode: 404, message: 'Referenced game does not exist',});
            expect(CardRepository.update).not.toHaveBeenCalled();
        });
    });

    it('should matain dont send previus values', async () => {
        const existingCard = { id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
        CardRepository.findById.mockResolvedValue(existingCard);
        CardRepository.update.mockResolvedValue(existingCard);

        await CardService.updateCard(1, {});

        expect(CardRepository.update).toHaveBeenCalledWith(1, {
            color: 'red',
            value: '5',
            gameId: 1,
            location: 'deck',
            discardOrder: null,
        });
    });

    it('Should change only the value sent', async () => {
        const existingCard = { id: 1, color: 'red', value: '5', gameId: 1, location: 'deck', discardOrder: null };
        CardRepository.findById.mockResolvedValue(existingCard);
        CardRepository.update.mockResolvedValue({ ...existingCard, color: 'blue' });

        const result = await CardService.updateCard(1, { color: 'blue' });

        expect(CardRepository.update).toHaveBeenCalledWith(1, {
            color: 'blue',
            value: '5',
            gameId: 1,
            location: 'deck',
            discardOrder: null,
        });
        expect(result.color).toBe('blue');
    });
});

describe('deleteCard', () => {
    it('should return error 400 dont pass id', async () => {
        await expect(CardService.deleteCard()).rejects.toMatchObject({
            statusCode: 400,
            message: 'ID is required',
        });
    });

    it('should return  error 404 doesnt exist card', async () => {

        CardRepository.delete.mockResolvedValue(false);

        await expect(CardService.deleteCard(99)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Card not found',
        });
    });

    it('should return the correct card', async () => {

        CardRepository.delete.mockResolvedValue(true);
        const result = await CardService.deleteCard(1);

        expect(result).toEqual({});
        expect(CardRepository.delete).toHaveBeenCalledWith(1);
    });
});

describe('createInitCard', () => {
    it('should create a initial leter  for discard with color and value randoms', async () => {
        GameRepository.findById.mockResolvedValue({ id: 1 });
        const createdCard = { id: 50, color: 'yellow', value: '3', gameId: 1, location: 'discard', discardOrder: 1 };
        CardRepository.create.mockResolvedValue(createdCard);
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5)
            // para elegir color: índice 2 -> 'yellow' (0,1,2,3 -> red,blue,yellow,green)
            .mockReturnValueOnce(0.3);
            // arriba el value

        const result = await CardService.createInitCard(1);
        expect(CardRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                gameId: 1,
                location: 'discard',
                discardOrder: 1,
            })
        );
        expect(result).toEqual(createdCard);

        Math.random.mockRestore();
    });

    it('should return error 404 doesnt existe te game', async () => {
        GameRepository.findById.mockResolvedValue(null);
        await expect(CardService.createInitCard(999)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Referenced game does not exist',
        });
    });
});

describe('getTopCard', () => {
    it('should return error 400 dont pass id', async () => {
        await expect(CardService.getTopCard()).rejects.toMatchObject({
            statusCode: 400,
            message: 'ID is required',
        });
    });

    it('should return  error 404 the game don exist', async () => {
        GameRepository.findById.mockResolvedValue(null);
        await expect(CardService.getTopCard(999)).rejects.toMatchObject({
            statusCode: 404,
            message: 'Game not found',
        });
    });

    it('should return the leeter if exist in the discard ', async () => {
        const mockGame = { id: 1 };
        const mockTopCard = { id: 5, color: 'red', value: '7' };
        GameRepository.findById.mockResolvedValue(mockGame);
        CardRepository.findTopDiscardByGameId.mockResolvedValue(mockTopCard);
        formatCard.mockReturnValue({ display: 'Red 7' });

        const result = await CardService.getTopCard(1);
        expect(CardRepository.findTopDiscardByGameId).toHaveBeenCalledWith(1);
        expect(formatCard).toHaveBeenCalledWith(mockTopCard);
        expect(result).toEqual({ game_id: 1, top_card: { display: 'Red 7' } });
    });

    it('should create the initial create dont exist anything in discard', async () => {
        const mockGame = { id: 1 };
        GameRepository.findById.mockResolvedValue(mockGame);
        // se llama 2 veces para getTopCard y createCard
        CardRepository.findTopDiscardByGameId.mockResolvedValue(null);
        const generatedCard = { id: 99, color: 'green', value: '4',
            gameId: 1, location: 'discard', discardOrder: 1 };
        CardRepository.create.mockResolvedValue(generatedCard);
        formatCard.mockReturnValue({ display: 'Green 4' });

        const result = await CardService.getTopCard(1);

        expect(CardRepository.create).toHaveBeenCalledTimes(1);
        expect(formatCard).toHaveBeenCalledWith(generatedCard);
        expect(result).toEqual({ game_id: 1, top_card: { display: 'Green 4' } });
    });
});

