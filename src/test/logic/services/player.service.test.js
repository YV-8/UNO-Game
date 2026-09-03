import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import * as PlayerService from '../../../logic/services/player.service.js';

jest.mock('../../../dataAccess/repositories/player.repository.js');

describe('PlayerService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getAllPlayers', () => {
        it('should return Ok with all players', async () => {
            const mockPlayers = [{ id: 1, username: 'moni' }, { id: 2, username: 'luigi' }];
            PlayerRepository.findAll.mockResolvedValue(mockPlayers);

            const result = await PlayerService.getAllPlayers();

            expect(result.isOk()).toBe(true);
            expect(result.value).toEqual(mockPlayers);
            expect(PlayerRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getPlayerById', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await PlayerService.getPlayerById();
            expect(result.isErr()).toBe(true);
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Ok with the player using the correct id', async () => {
            const mockPlayer = { id: 1, username: 'Moni' };
            PlayerRepository.findById.mockResolvedValue(mockPlayer);

            const result = await PlayerService.getPlayerById(1);

            expect(result.value).toEqual(mockPlayer);
            expect(PlayerRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should return Err 404 if the player does not exist', async () => {
            PlayerRepository.findById.mockResolvedValue(null);
            const result = await PlayerService.getPlayerById(99);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Player not found' });
        });
    });

    describe('updatePlayer', () => {
        it('should return Err 404 if the player does not exist', async () => {
            PlayerRepository.findById.mockResolvedValue(null);
            const result = await PlayerService.updatePlayer(666, { username: 'Amore' });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Player not found' });
        });

        it('should return Err 400 if the email is invalid', async () => {
            const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com' };
            PlayerRepository.findById.mockResolvedValue(existingPlayer);

            const result = await PlayerService.updatePlayer(1, { email: 'invalid-format' });

            expect(result.error).toMatchObject({ statusCode: 400, message: 'Invalid email format' });
        });

        it('should hash the password if sent in the update', async () => {
            const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com', password: 'oldHashedPass' };
            PlayerRepository.findById.mockResolvedValue(existingPlayer);
            PlayerRepository.update.mockResolvedValue({ ...existingPlayer, password: 'newHashedPass' });

            await PlayerService.updatePlayer(1, { password: 'newPlainPassword' });

            const calledWith = PlayerRepository.update.mock.calls[0][1];
            expect(calledWith.password).toBeDefined();
            expect(calledWith.password).not.toBe('newPlainPassword');
        });

        it('should not include password in updatedData if not sent', async () => {
            const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com' };
            PlayerRepository.findById.mockResolvedValue(existingPlayer);
            PlayerRepository.update.mockResolvedValue(existingPlayer);

            await PlayerService.updatePlayer(1, { username: 'ale2' });

            const calledWith = PlayerRepository.update.mock.calls[0][1];
            expect(calledWith.password).toBeUndefined();
        });

        it('should retain previous values if no fields are sent', async () => {
            const existingPlayer = { id: 1, username: 'ale', email: 'ale@test.com' };
            PlayerRepository.findById.mockResolvedValue(existingPlayer);
            PlayerRepository.update.mockResolvedValue(existingPlayer);

            const result = await PlayerService.updatePlayer(1, {});

            expect(PlayerRepository.update).toHaveBeenCalledWith(1, {
                username: 'ale',
                email: 'ale@test.com',
            });
            expect(result.value).toEqual(existingPlayer);
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
            expect(result.value.username).toBe('marciano');
        });
    });

    describe('deletePlayer', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await PlayerService.deletePlayer();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the player does not exist', async () => {
            PlayerRepository.delete.mockResolvedValue(false);
            const result = await PlayerService.deletePlayer(1);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Player not found' });
        });

        it('should delete the player successfully', async () => {
            PlayerRepository.delete.mockResolvedValue(true);
            const result = await PlayerService.deletePlayer(1);
            expect(result.value).toEqual({});
            expect(PlayerRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});