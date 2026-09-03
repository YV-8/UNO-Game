import { playerService as createPlayerService } from '../../../logic/services/player.service.js';
import Result from '../../../logic/monads/respond.js';

describe('PlayerService Unit Tests', () => {
    let playerRepository, playerRules, hashProvider, config, playerService;

    beforeEach(() => {
        playerRepository = { findAll: jest.fn(), update: jest.fn(), delete: jest.fn() };
        hashProvider = { hash: jest.fn() };
        config = { saltRounds: 10 };
        playerRules = {
            validateGetPlayer: jest.fn(),
            validateUpdatePlayer: jest.fn(),
            validateDeletePlayer: jest.fn(),
        };

        playerService = createPlayerService({ playerRepository, playerRules, hashProvider, config, respond: Result });
    });

    describe('getAllPlayers', () => {
        test('returns Ok with all players', async () => {
            playerRepository.findAll.mockResolvedValue([{ id: 1, username: 'ale' }]);
            const result = await playerService.getAllPlayers();
            expect(result.value).toEqual([{ id: 1, username: 'ale' }]);
        });
    });

    describe('getPlayerById', () => {
        test('returns Err if the player does not exist', async () => {
            playerRules.validateGetPlayer.mockResolvedValue(Result.Err({ statusCode: 404, message: 'Not found' }));
            const result = await playerService.getPlayerById(99);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok with the player', async () => {
            playerRules.validateGetPlayer.mockResolvedValue(Result.Ok({ player: { id: 1, username: 'ale' } }));
            const result = await playerService.getPlayerById(1);
            expect(result.value).toEqual({ id: 1, username: 'ale' });
        });
    });

    describe('updatePlayer', () => {
        test('keeps previous values when fields are not provided', async () => {
            playerRules.validateUpdatePlayer.mockResolvedValue(Result.Ok({
                player: { id: 1, username: 'ale', email: 'ale@test.com' },
                username: undefined, email: undefined, password: undefined,
            }));

            await playerService.updatePlayer(1, {});

            expect(playerRepository.update).toHaveBeenCalledWith(1, { username: 'ale', email: 'ale@test.com' });
        });

        test('hashes the password when a new one is provided', async () => {
            playerRules.validateUpdatePlayer.mockResolvedValue(Result.Ok({
                player: { id: 1, username: 'ale', email: 'ale@test.com' },
                username: undefined, email: undefined, password: 'newPass123',
            }));
            hashProvider.hash.mockResolvedValue('hashed123');

            await playerService.updatePlayer(1, { password: 'newPass123' });

            expect(hashProvider.hash).toHaveBeenCalledWith('newPass123', 10);
            expect(playerRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({ password: 'hashed123' }));
        });
    });

    describe('deletePlayer', () => {
        test('returns Err 404 when nothing was deleted', async () => {
            playerRules.validateDeletePlayer.mockResolvedValue(Result.Ok({}));
            playerRepository.delete.mockResolvedValue(false);
            const result = await playerService.deletePlayer(1);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok on successful delete', async () => {
            playerRules.validateDeletePlayer.mockResolvedValue(Result.Ok({}));
            playerRepository.delete.mockResolvedValue(true);
            const result = await playerService.deletePlayer(1);
            expect(result.value).toEqual({});
        });
    });
});
