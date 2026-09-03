import * as PlayerController from '../../../presentation/controllers/player.controller.js';
import { playerService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    playerService: {
        getAllPlayers: jest.fn(),
        getPlayerById: jest.fn(),
        updatePlayer: jest.fn(),
        deletePlayer: jest.fn(),
    },
}));

describe('PlayerController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('getAllPlayer: should respond 200', async () => {
        playerService.getAllPlayers.mockResolvedValue(Result.Ok([{ id: 1, username: 'moni' }]));
        await PlayerController.getAllPlayer(mockRequest(), res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getPlayerById: should use params.id', async () => {
        playerService.getPlayerById.mockResolvedValue(Result.Ok({ id: 1, username: 'moni' }));
        const req = mockRequest({ params: { id: '1' } });

        await PlayerController.getPlayerById(req, res);

        expect(playerService.getPlayerById).toHaveBeenCalledWith('1');
    });

    it('getPlayerById: should respond 404 with { error }', async () => {
        playerService.getPlayerById.mockResolvedValue(Result.Err({ statusCode: 404, message: 'Player not found' }));
        const req = mockRequest({ params: { id: '99' } });

        await PlayerController.getPlayerById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Player not found' });
    });

    it('updatePlayer: should pass username, email, password', async () => {
        playerService.updatePlayer.mockResolvedValue(Result.Ok({ id: 1, username: 'nuevo' }));
        const req = mockRequest({
            params: { id: '1' },
            body: { username: 'nuevo', email: 'n@test.com', password: 'abc' },
        });

        await PlayerController.updatePlayer(req, res);

        expect(playerService.updatePlayer).toHaveBeenCalledWith('1', {
            username: 'nuevo', email: 'n@test.com', password: 'abc',
        });
    });

    it('deletePlayer: should use params.id', async () => {
        playerService.deletePlayer.mockResolvedValue(Result.Ok({}));
        const req = mockRequest({ params: { id: '1' } });

        await PlayerController.deletePlayer(req, res);

        expect(playerService.deletePlayer).toHaveBeenCalledWith('1');
    });
});