import * as GameController from '../../../presentation/controllers/game.controller.js';
import { gameService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    gameService: {
        getAllGame: jest.fn(), getGameById: jest.fn(), createGame: jest.fn(),
        updateGame: jest.fn(), deleteGame: jest.fn(), startGame: jest.fn(),
        endGame: jest.fn(), joinGame: jest.fn(), leaveGame: jest.fn(),
        getGameState: jest.fn(), getGamePlayers: jest.fn(),
        getCurrentPlayer: jest.fn(), getGameScores: jest.fn(),
    },
}));

describe('GameController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('createGame: should use req.player.id as playerId', async () => {
        gameService.createGame.mockResolvedValue(Result.Ok({ message: 'Game created successfully', game_id: 1 }));
        const req = mockRequest({ body: { name: 'Partida', rules: 'std' }, player: { id: 1, username: 'moni' } });

        await GameController.createGame(req, res);

        expect(gameService.createGame).toHaveBeenCalledWith({
            name: 'Partida', rules: 'std', playerId: 1, username: 'moni',
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('startGame: should respond 403 if not creator', async () => {
        gameService.startGame.mockResolvedValue(
            Result.Err({ statusCode: 403, message: 'Only the creator of the game can perform this action' })
        );
        const req = mockRequest({ body: { game_id: 1 }, player: { id: 2 } });

        await GameController.startGame(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('join: should convert game_id to number', async () => {
        gameService.joinGame.mockResolvedValue(Result.Ok({ message: 'User joined the game successfully' }));
        const req = mockRequest({ body: { game_id: '1' }, player: { id: 1, username: 'moni' } });

        await GameController.join(req, res);

        expect(gameService.joinGame).toHaveBeenCalledWith({ gameId: 1, playerId: 1, username: 'moni' });
    });

    it('getGameState: should not require req.player', async () => {
        gameService.getGameState.mockResolvedValue(Result.Ok({ game_id: 1, state: 'waiting' }));
        const req = mockRequest({ body: { game_id: 1 } });

        await GameController.getGameState(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });
});