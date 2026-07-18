import { jest } from '@jest/globals';

jest.unstable_mockModule('../../dataAccess/repositories/game.repository.js', () => ({
    default: {
        findAll: jest.fn(),
        findById: jest.fn(),
        findByTitle: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

const GameRepository = (await import('../../dataAccess/repositories/game.repository.js')).default;
const GameService = await import('../../logic/services/game.service.js');

describe('GameService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getAllGame', () => {
        it('retorna todos los juegos', async () => {
            const mockGames = [{ id: 1, title: 'UNO' }];
            GameRepository.findAll.mockResolvedValue(mockGames);

            const result = await GameService.getAllGame();

            expect(result).toEqual(mockGames);
        });
    });

    describe('getGameById', () => {
        it('lanza 400 si falta id', async () => {
            await expect(GameService.getGameById()).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 404 si no existe', async () => {
            GameRepository.findById.mockResolvedValue(null);
            await expect(GameService.getGameById(99)).rejects.toMatchObject({ statusCode: 404 });
        });

        it('retorna el juego si existe', async () => {
            const mockGame = { id: 1, title: 'UNO' };
            GameRepository.findById.mockResolvedValue(mockGame);
            const result = await GameService.getGameById(1);
            expect(result).toEqual(mockGame);
        });
    });

    describe('createGame', () => {
        it('lanza 400 si falta un campo requerido', async () => {
            await expect(GameService.createGame({ title: 'UNO' })).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 400 si maxPlayers no es positivo', async () => {
            await expect(
                GameService.createGame({ title: 'UNO', status: 'waiting', maxPlayers: 0 })
            ).rejects.toMatchObject({ statusCode: 400, message: 'maxPlayers has to be a positive number' });
        });

        it('lanza 400 si status es inválido', async () => {
            await expect(
                GameService.createGame({ title: 'UNO', status: 'foo', maxPlayers: 4 })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 400 si el title ya existe', async () => {
            GameRepository.findByTitle.mockResolvedValue({ id: 1, title: 'UNO' });
            await expect(
                GameService.createGame({ title: 'UNO', status: 'waiting', maxPlayers: 4 })
            ).rejects.toMatchObject({ statusCode: 400, message: 'Title is already registered.' });
        });

        it('crea el juego si todo es válido', async () => {
            const newGame = { id: 1, title: 'UNO', status: 'waiting', maxPlayers: 4 };
            GameRepository.findByTitle.mockResolvedValue(null);
            GameRepository.create.mockResolvedValue(newGame);

            const result = await GameService.createGame({ title: 'UNO', status: 'waiting', maxPlayers: 4 });

            expect(result).toEqual(newGame);
            expect(GameRepository.create).toHaveBeenCalledWith({ title: 'UNO', status: 'waiting', maxPlayers: 4 });
        });
    });

    describe('updateGame', () => {
        it('lanza 404 si no existe', async () => {
            GameRepository.findById.mockResolvedValue(null);
            await expect(GameService.updateGame(1, { title: 'X' })).rejects.toMatchObject({ statusCode: 404 });
        });

        it('lanza 400 si status inválido', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, title: 'UNO', status: 'waiting', maxPlayers: 4 });
            await expect(GameService.updateGame(1, { status: 'foo' })).rejects.toMatchObject({ statusCode: 400 });
        });

        it('actualiza solo los campos enviados', async () => {
            const existing = { id: 1, title: 'UNO', status: 'waiting', maxPlayers: 4 };
            GameRepository.findById.mockResolvedValue(existing);
            GameRepository.update.mockResolvedValue({ ...existing, status: 'active' });

            const result = await GameService.updateGame(1, { status: 'active' });

            expect(GameRepository.update).toHaveBeenCalledWith(1, { title: 'UNO', status: 'active', maxPlayers: 4 });
            expect(result.status).toBe('active');
        });
    });

    describe('deleteGame', () => {
        it('lanza 400 si falta id', async () => {
            await expect(GameService.deleteGame()).rejects.toMatchObject({ statusCode: 400 });
        });

        it('lanza 404 si no existe', async () => {
            GameRepository.delete.mockResolvedValue(false);
            await expect(GameService.deleteGame(99)).rejects.toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('elimina correctamente', async () => {
            GameRepository.delete.mockResolvedValue(true);
            const result = await GameService.deleteGame(1);
            expect(result).toEqual({});
        });
    });
});