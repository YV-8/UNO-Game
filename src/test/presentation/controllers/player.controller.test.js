import * as PlayerController from '../../../presentation/controllers/player.controller.js';
import * as PlayerService from '../../../logic/services/player.service.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../logic/services/player.service.js');

describe('PlayerController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    describe('getAllPlayer', () => {
        it('should respond 200 with the list of players', async () => {
            PlayerService.getAllPlayers.mockResolvedValue(Result.Ok([{ id: 1, username: 'moni' }]));
            await PlayerController.getAllPlayer(mockRequest(), res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getPlayerById', () => {
        it('should use params.id and respond 200', async () => {
            const mockPlayer = { id: 1, username: 'moni' };
            PlayerService.getPlayerById.mockResolvedValue(Result.Ok(mockPlayer));
            const req = mockRequest({ params: { id: '1' } });

            await PlayerController.getPlayerById(req, res);

            expect(PlayerService.getPlayerById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should respond 404 with { error } if not found', async () => {
            PlayerService.getPlayerById.mockResolvedValue(
                Result.Err({ statusCode: 404, message: 'Player not found' })
            );
            const req = mockRequest({ params: { id: '99' } });

            await PlayerController.getPlayerById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Player not found' });
        });
    });

    describe('updatePlayer', () => {
        it('should pass username, email and password from body to the service', async () => {
            PlayerService.updatePlayer.mockResolvedValue(Result.Ok({ id: 1, username: 'nuevo' }));
            const req = mockRequest({
                params: { id: '1' },
                body: { username: 'nuevo', email: 'nuevo@test.com', password: 'abc123' },
            });

            await PlayerController.updatePlayer(req, res);

            expect(PlayerService.updatePlayer).toHaveBeenCalledWith('1', {
                username: 'nuevo', email: 'nuevo@test.com', password: 'abc123',
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deletePlayer', () => {
        it('should delete using params.id', async () => {
            PlayerService.deletePlayer.mockResolvedValue(Result.Ok({}));
            const req = mockRequest({ params: { id: '1' } });

            await PlayerController.deletePlayer(req, res);

            expect(PlayerService.deletePlayer).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});