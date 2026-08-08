import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import * as PlayerService from '../../../logic/services/player.service.js';

jest.mock('../../../dataAccess/repositories/player.repository.js');

describe('PlayerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPlayers', () => {
    it('should return all players', async () => {

      const mockPlayers = [{ id: 1, username: 'moni' }, { id: 2, username: 'luigi' }];
      PlayerRepository.findAll.mockResolvedValue(mockPlayers);
      const result = await PlayerService.getAllPlayers();

      expect(result).toEqual(mockPlayers);
      expect(PlayerRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPlayerById', () => {
    it('show throw error 400 dont pass id', async () => {
      await expect(PlayerService.getPlayerById()).rejects.toMatchObject({
        statusCode: 400,
        message: 'ID is required',
      });
    });

    it('should call correct id', async () => {
      const mockPlayers = [{ id: 1, username: 'Moni' }];
      PlayerRepository.findById.mockResolvedValue(mockPlayers);
      const result = await PlayerService.getPlayerById(1);

      expect(result).toEqual(mockPlayers);
      expect(PlayerRepository.findById).toHaveBeenCalledWith(1);
    });
    it('should throw error 400 invalid email', async () => {
      const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);

      await expect(
        PlayerService.updatePlayer(1, { email: 'formato-invalido' })
      ).rejects.toMatchObject({ statusCode: 400, message: 'Invalid email format' });
    });

    it('should throw error 404 the game doesnt exist', async () => {
      PlayerRepository.findById.mockResolvedValue(null);

      await expect(PlayerService.getPlayerById(99)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Player not found',
      });
    });

    it('should return the game exist', async () => {
      const mockPlayer = { id: 1, name: 'ale' };
      PlayerRepository.findById.mockResolvedValue(mockPlayer);

      const result = await PlayerService.getPlayerById(1);

      expect(result).toEqual(mockPlayer);
    });

  });

  describe('updatePlayer', () => {
    it('should return error 404 game doesnt exist', async () => {
      PlayerRepository.findById.mockResolvedValue(null);
      await expect(PlayerService.updatePlayer(666, { username: 'Amore' })).rejects.toMatchObject({
        statusCode: 404,
        message: 'Player not found',
      });
    });

    it('should hashear the password it sent the update', async () => {
      const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com', password: 'oldHashedPass' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);
      PlayerRepository.update.mockResolvedValue({ ...existingPlayer, password: 'newHashedPass' });

      await PlayerService.updatePlayer(1, { password: 'newPlainPassword' });

      const calledWith = PlayerRepository.update.mock.calls[0][1];
      expect(calledWith.password).toBeDefined();
      expect(calledWith.password).not.toBe('newPlainPassword'); // nunca en texto plano
      expect(typeof calledWith.password).toBe('string');
    });

    it(' should dont recieve password if dont update it', async () => {

      const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);
      PlayerRepository.update.mockResolvedValue(existingPlayer);

      await PlayerService.updatePlayer(1, { username: 'ale2' });

      const calledWith = PlayerRepository.update.mock.calls[0][1];
      expect(calledWith.password).toBeUndefined();
    });


    it('should retain the previous values ​​if no fields are sent', async () => {
      const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);
      PlayerRepository.update.mockResolvedValue(existingPlayer);

      const result = await PlayerService.updatePlayer(1, {});

      expect(PlayerRepository.update).toHaveBeenCalledWith(1, {
        username: 'ale',
        email: 'ale@test.com',
      });
      expect(result).toEqual(existingPlayer);
    });

    it('should update only the fields sent', async () => {
      const existingPlayer = { id: 1, username: 'mario', email: 'mario@test.com' };
      PlayerRepository.findById.mockResolvedValue(existingPlayer);
      PlayerRepository.update.mockResolvedValue({ ...existingPlayer, username: 'marciano' });
      const result = await PlayerService.updatePlayer(1, { username: 'marciano' });

      expect(PlayerRepository.update).toHaveBeenCalledWith(1, {
        username: 'marciano',
        email: 'mario@test.com',
      });
      expect(result.username).toBe('marciano');
    });
  });

  describe('deletePlayer', () => {
    it('should return error 400 dont pass id', async () => {
      await expect(PlayerService.deletePlayer()).rejects.toMatchObject({
        statusCode: 400,
        message: 'ID is required',
      });
    });

    it('should return error 404 id exist', async () => {
      PlayerRepository.delete.mockResolvedValue(false);
      await expect(PlayerService.deletePlayer(1)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Player not found',
      });
    });

    it('should delete the player', async () => {
      PlayerRepository.delete.mockResolvedValue(true);
      const result = await PlayerService.deletePlayer(1);

      expect(result).toEqual({});
      expect(PlayerRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
