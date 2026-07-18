import { jest } from '@jest/globals';

jest.unstable_mockModule('../../dataAccess/repositories/card.repository.js', () => ({
    default: { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
}));
jest.unstable_mockModule('../../dataAccess/repositories/game.repository.js', () => ({
    default: { findById: jest.fn() },
}));

const CardRepository = (await import('../../dataAccess/repositories/card.repository.js')).default;
const GameRepository = (await import('../../dataAccess/repositories/game.repository.js')).default;
const CardService = await import('../../logic/services/card.service.js');

describe('CardService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('createCard', () => {
        it('lanza 400 si falta un campo', async () => {
            await expect(CardService.createCard({ color: 'red' })).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 400 si el color es inválido', async () => {
            await expect(
                CardService.createCard({ color: 'purple', value: '3', gameId: 1 })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 404 si el gameId referenciado no existe', async () => {
            GameRepository.findById.mockResolvedValue(null);
            await expect(
                CardService.createCard({ color: 'red', value: '3', gameId: 99 })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it('crea la carta si todo es válido', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, title: 'UNO' });
            const newCard = { id: 1, color: 'blue', value: '3', gameId: 1 };
            CardRepository.create.mockResolvedValue(newCard);

            const result = await CardService.createCard({ color: 'blue', value: '3', gameId: 1 });

            expect(result).toEqual(newCard);
        });

        it('acepta el color wild', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1 });
            CardRepository.create.mockResolvedValue({ id: 2, color: 'wild', value: '+4', gameId: 1 });

            const result = await CardService.createCard({ color: 'wild', value: '+4', gameId: 1 });

            expect(result.color).toBe('wild');
        });
    });

    describe('deleteCard', () => {
        it('lanza 404 si no existe', async () => {
            CardRepository.delete.mockResolvedValue(false);
            await expect(CardService.deleteCard(1)).rejects.toMatchObject({ statusCode: 404 });
        });
    });
});