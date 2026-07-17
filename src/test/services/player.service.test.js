import { jest } from '@jest/globals';

jest.unstable_mockModule('../../dataAccess/repositories/player.repository.js', () => ({
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const PlayerRepository = (await import('../../dataAccess/repositories/player.repository.js')).default;
const PlayerService = await import('../../logic/services/player.service.js');

describe('PlayerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPlayers', () => {
    it('debe retornar todos los jugadores', async () => {
      const mockPlayers = [{ id: 1, name: 'Mario' }];
      PlayerRepository.findAll.mockResolvedValue(mockPlayers);

      const result = await PlayerService.getAllPlayers();

      expect(result).toEqual(mockPlayers);
      expect(PlayerRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPlayerById', () => {
    it('debe lanzar error 400 si no se pasa id', async () => {
      await expect(PlayerService.getPlayerById()).rejects.toMatchObject({
        statusCode: 400,
        message: 'ID is required',
      });
    });

    it('debe lanzar error 404 si el jugador no existe', async () => {
      PlayerRepository.findById.mockResolvedValue(null);

      await expect(PlayerService.getPlayerById(99)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Player not found',
      });
    });

    it('debe retornar el jugador si existe', async () => {
      const mockPlayer = { id: 1, name: 'Luigi' };
      PlayerRepository.findById.mockResolvedValue(mockPlayer);

      const result = await PlayerService.getPlayerById(1);

      expect(result).toEqual(mockPlayer);
    });
  });

  describe('createPlayer', () => {
    it('debe lanzar error 400 si falta un campo requerido', async () => {
      await expect(PlayerService.createPlayer({ name: 'Mario' })).rejects.toMatchObject({
        statusCode: 400,
        message: 'Name, age and email are required',
      });
    });

    it('debe lanzar error 400 si age no es positivo', async () => {
      await expect(
        PlayerService.createPlayer({ name: 'Mario', age: -5, email: 'mario@test.com' })
      ).rejects.toMatchObject({ statusCode: 400, message: 'Age has to be a positive number' });
    });

    it('debe lanzar error 400 si el email es inválido', async () => {
      await expect(
        PlayerService.createPlayer({ name: 'Mario', age: 20, email: 'mario-arroba-test' })
      ).rejects.toMatchObject({ statusCode: 400, message: 'Invalid email format' });
    });

    it('debe lanzar error 400 si el email ya existe', async () => {
      PlayerRepository.findByEmail.mockResolvedValue({ id: 5, email: 'mario@test.com' });

      await expect(
        PlayerService.createPlayer({ name: 'Mario', age: 20, email: 'mario@test.com' })
      ).rejects.toMatchObject({ statusCode: 400, message: 'Email address is already registered.' });
    });

    it('debe crear el jugador si todo es válido', async () => {
      const newPlayer = { id: 1, name: 'Mario', age: 20, email: 'mario@test.com' };
      PlayerRepository.findByEmail.mockResolvedValue(null);
      PlayerRepository.create.mockResolvedValue(newPlayer);

      const result = await PlayerService.createPlayer({ name: 'Mario', age: 20, email: 'mario@test.com' });

      expect(result).toEqual(newPlayer);
      expect(PlayerRepository.create).toHaveBeenCalledWith({ name: 'Mario', age: 20, email: 'mario@test.com' });
    });
  });

  describe('updatePlayer', () => {
    it('debe lanzar error 404 si el jugador no existe', async () => {
      PlayerRepository.findById.mockResolvedValue(null);

      await expect(PlayerService.updatePlayer(1, { name: 'X' })).rejects.toMatchObject({
        statusCode: 404,
        message: 'Player not found',
      });
    });

    it('debe lanzar error 400 si la nueva age es inválida', async () => {
      PlayerRepository.findById.mockResolvedValue({ id: 1, name: 'Mario', age: 20, email: 'mario@test.com' });

      await expect(PlayerService.updatePlayer(1, { age: -1 })).rejects.toMatchObject({
        statusCode: 400,
        message: 'Age has to be a positive number',
      });
    });

    it('debe mantener los valores previos si no se envían campos', async () => {
      const existingPlayer = { id: 1, name: 'Mario', age: 20, email: 'mario@test.com' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);
      PlayerRepository.update.mockResolvedValue(existingPlayer);

      await PlayerService.updatePlayer(1, {});

      expect(PlayerRepository.update).toHaveBeenCalledWith(1, existingPlayer);
    });

    it('debe actualizar solo los campos enviados', async () => {
      const existingPlayer = { id: 1, name: 'Mario', age: 20, email: 'mario@test.com' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);
      PlayerRepository.update.mockResolvedValue({ ...existingPlayer, age: 25 });

      const result = await PlayerService.updatePlayer(1, { age: 25 });

      expect(PlayerRepository.update).toHaveBeenCalledWith(1, { name: 'Mario', age: 25, email: 'mario@test.com' });
      expect(result.age).toBe(25);
    });
  });

  describe('deletePlayer', () => {
    it('debe lanzar error 400 si no se pasa id', async () => {
      await expect(PlayerService.deletePlayer()).rejects.toMatchObject({
        statusCode: 400,
        message: 'ID is required',
      });
    });

    it('debe lanzar error 404 si el jugador no existe', async () => {
      PlayerRepository.delete.mockResolvedValue(false);

      await expect(PlayerService.deletePlayer(99)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Player not found',
      });
    });

    it('debe eliminar el jugador correctamente', async () => {
      PlayerRepository.delete.mockResolvedValue(true);

      const result = await PlayerService.deletePlayer(1);

      expect(result).toEqual({});
      expect(PlayerRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});