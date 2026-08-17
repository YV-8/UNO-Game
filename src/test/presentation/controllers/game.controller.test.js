import * as GameController from '../../../presentation/controllers/game.controller.js';
import * as GameService from '../../../logic/services/game.service.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../logic/services/game.service.js');

describe('GameController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    describe('getAllGame', () => {
        it('should respond 200 with the game list', async () => {
            GameService.getAllGame.mockResolvedValue(Result.Ok([{ id: 1, name: 'Uno' }]));
            await GameController.getAllGame(mockRequest(), res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getGameById', () => {
        it('should respond 200 with the gameid', async () => {
            GameService.getGameById.mockResolvedValue(Result.Ok([{ id: 1, name: 'Solitario' },{ id: 2, name: 'uno' }]));
            await GameController.getGameById(mockRequest(), res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('createGame', () => {
        it('should use req.player.id as playerId and respond 201', async () => {
            GameService.createGame.mockResolvedValue(
                Result.Ok({ message: 'Game created successfully', game_id: 1 })
            );
            const req = mockRequest({
                body: { name: 'Partida', rules: 'std' },
                player: { id: 1, username: 'moni' },
            });

            await GameController.createGame(req, res);

            expect(GameService.createGame).toHaveBeenCalledWith({ name: 'Partida', rules: 'std', playerId: 1 });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Game created successfully', game_id: 1 });
        });
    });

    describe('updateGame', () => {
        it('should use params.id, req.body and req.player.id', async () => {
            GameService.updateGame.mockResolvedValue(
                Result.Ok({ message: 'Game updated successfully', game_id: 1 })
            );
            const req = mockRequest({
                params: { id: '1' },
                body: { state: 'in_progress' },
                player: { id: 1 },
            });

            await GameController.updateGame(req, res);

            expect(GameService.updateGame).toHaveBeenCalledWith('1', { state: 'in_progress' }, 1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteGame', () => {
        it('should delete using params.id', async () => {
            GameService.deleteGame.mockResolvedValue(Result.Ok({ message: 'Game deleted successfully' }));
            const req = mockRequest({ params: { id: '1' } });

            await GameController.deleteGame(req, res);

            expect(GameService.deleteGame).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('startGame', () => {
        it('should pass game_id and req.player.id', async () => {
            GameService.startGame.mockResolvedValue(Result.Ok({ message: 'Game started successfully' }));
            const req = mockRequest({ body: { game_id: 1 }, player: { id: 1 } });

            await GameController.startGame(req, res);

            expect(GameService.startGame).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should respond 403 if the caller is not the creator', async () => {
            GameService.startGame.mockResolvedValue(
                Result.Err({ statusCode: 403, message: 'Only the creator of the game can perform this action' })
            );
            const req = mockRequest({ body: { game_id: 1 }, player: { id: 2 } });

            await GameController.startGame(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('endGame', () => {
        it('should pass game_id and req.player.id', async () => {
            GameService.endGame.mockResolvedValue(Result.Ok({ message: 'Game ended successfully' }));
            const req = mockRequest({ body: { game_id: 1 }, player: { id: 1 } });

            await GameController.endGame(req, res);

            expect(GameService.endGame).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('join', () => {
        it('should convert game_id to number and use req.player', async () => {
            GameService.joinGame.mockResolvedValue(Result.Ok({ message: 'User joined the game successfully' }));
            const req = mockRequest({ body: { game_id: '1' }, player: { id: 1, username: 'moni' } });

            await GameController.join(req, res);

            expect(GameService.joinGame).toHaveBeenCalledWith({ gameId: 1, playerId: 1, username: 'moni' });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('leave', () => {
        it('should convert game_id to number and use req.player.id', async () => {
            GameService.leaveGame.mockResolvedValue(Result.Ok({ message: 'User left the game successfully' }));
            const req = mockRequest({ body: { game_id: '1' }, player: { id: 1 } });

            await GameController.leave(req, res);

            expect(GameService.leaveGame).toHaveBeenCalledWith({ gameId: 1, playerId: 1 });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getGameState', () => {
        it('does not require req.player, only game_id from body', async () => {
            GameService.getGameState.mockResolvedValue(Result.Ok({ game_id: 1, state: 'waiting' }));
            const req = mockRequest({ body: { game_id: 1 } });

            await GameController.getGameState(req, res);

            expect(GameService.getGameState).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getGamePlayers', () => {
        it('should respond 200 with the players list', async () => {
            GameService.getGamePlayers.mockResolvedValue(Result.Ok({ game_id: 1, players: ['moni'] }));
            const req = mockRequest({ body: { game_id: 1 } });

            await GameController.getGamePlayers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getCurrentPlayer', () => {
        it('should respond 200 with the current player', async () => {
            GameService.getCurrentPlayer.mockResolvedValue(Result.Ok({ game_id: 1, current_player: 'moni' }));
            const req = mockRequest({ body: { game_id: 1 } });

            await GameController.getCurrentPlayer(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getGameScores', () => {
        it('should convert game_id to number', async () => {
            GameService.getGameScores.mockResolvedValue(Result.Ok({ game_id: 1, scores: { moni: 50 } }));
            const req = mockRequest({ body: { game_id: '1' } });

            await GameController.getGameScores(req, res);

            expect(GameService.getGameScores).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});