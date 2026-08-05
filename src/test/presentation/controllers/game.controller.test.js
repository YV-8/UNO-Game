import * as GameController from '../../../presentation/controllers/game.controller.js';
import * as GameService from '../../../logic/services/game.service.js';
import { sendSuccess } from '../../../helpers/responseHandler.middleware.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers/mockExpress.js';

jest.mock('../../../logic/services/game.service.js');
jest.mock('../../../helpers/responseHandler.middleware.js');

describe('GameController', () => {
    let req, res, next;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        next = mockNext();
        jest.clearAllMocks();
    });

    describe('getAllGame', () => {
        it('should return the games list', async () => {
            const req = mockRequest();
            const mockGames = [{ id: 1, name: 'Game Solitario' }, { id: 2, name: 'Game Solitario' }];
            GameService.getAllGame.mockResolvedValue(mockGames);
            await GameController.getAllGame(req, res, next);
            expect(GameService.getAllGame).toHaveBeenCalledTimes(1);
            expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Game retrieved successfully', mockGames);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next erro() service is empty', async () => {
            const req = mockRequest();
            const error = new Error('No games found');
            GameService.getAllGame.mockRejectedValue(error);
            await GameController.getAllGame(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getGameById', () => {
        it('debe tomar el id de req.params y responder con el juego', async () => {

            const req = mockRequest({ params: { id: '5' } });
            const mockGame = { id: 5, name: 'Partida' };
            GameService.getGameById.mockResolvedValue(mockGame);

            await GameController.getGameById(req, res, next);

            expect(GameService.getGameById).toHaveBeenCalledWith('5');
            expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Game retrieved successfully', mockGame);
        });

        it('debe llamar a next(error) si el juego no existe', async () => {
            const req = mockRequest({ params: { id: '999' } });
            const error = { statusCode: 404, message: 'game not found' };
            GameService.getGameById.mockRejectedValue(error);

            await GameController.getGameById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('createGame', () => {
        it('debe convertir access_token (snake_case) a accessToken y llamar al service', async () => {
            const req = mockRequest({
                body: { name: 'Partida', rules: 'std', access_token: 'token123' },
            });
            const createdGame = { id: 1, name: 'Partida' };
            GameService.createGame.mockResolvedValue(createdGame);

            await GameController.createGame(req, res, next);

            expect(GameService.createGame).toHaveBeenCalledWith({
                name: 'Partida',
                rules: 'std',
                accessToken: 'token123',
            });
            expect(sendSuccess).toHaveBeenCalledWith(res, 201, 'Game created successfully', createdGame);
        });

        it('debe llamar a next(error) si falta el token', async () => {
            const req = mockRequest({ body: { name: 'Partida' } });
            const error = { statusCode: 400, message: 'access_token is required' };
            GameService.createGame.mockRejectedValue(error);

            await GameController.createGame(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateGame', () => {
        it('debe separar access_token del resto del body y pasar el resto como data', async () => {

            const req = mockRequest({
                params: { id: '1' },
                body: { name: 'Nueva', state: 'in_progress', access_token: 'token123' },
            });
            const updatedGame = { id: 1, name: 'Nueva', state: 'in_progress' };
            GameService.updateGame.mockResolvedValue(updatedGame);

            await GameController.updateGame(req, res, next);

            expect(GameService.updateGame).toHaveBeenCalledWith(
                '1',
                { name: 'Nueva', state: 'in_progress' },
                'token123'
            );
            expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Game updated successfully', updatedGame);
        });
    });

    describe('deleteGame', () => {
        it('debe eliminar el juego usando el id de params', async () => {
            const req = mockRequest({ params: { id: '1' } });
            GameService.deleteGame.mockResolvedValue({});

            await GameController.deleteGame(req, res, next);

            expect(GameService.deleteGame).toHaveBeenCalledWith('1');
            expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Game deleted successfully');
        });
    });

    describe('getGameState', () => {
        it('must read game_id from req.body and respond with direct res.json (without sendSuccess)', async () => {
            const req = mockRequest({ body: { game_id: 1 } });
            GameService.getGameState.mockResolvedValue({ game_id: 1, state: 'waiting' });

            await GameController.getGameState(req, res, next);

            expect(GameService.getGameState).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ game_id: 1, state: 'waiting' });
        });
    });

    describe('join', () => {
        it('debe convertir game_id a número y separar el access_token', async () => {

            const req = mockRequest({ body: { game_id: '1', access_token: 'token123' } });
            GameService.joinGame.mockResolvedValue({});

            await GameController.join(req, res, next);
            expect(GameService.joinGame).toHaveBeenCalledWith({ gameId: 1, accessToken: 'token123' });
            expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'User joined the game successfully');
        });
    });

    describe('startGame', () => {
        it('debe pasar game_id y access_token directo del body', async () => {

            const req = mockRequest({ body: { game_id: 1, access_token: 'token123' } });
            GameService.startGame.mockResolvedValue({});

            await GameController.startGame(req, res, next);
            expect(GameService.startGame).toHaveBeenCalledWith(1, 'token123');
            expect(sendSuccess).toHaveBeenCalledWith(res, 200, 'Game started successfully');
        });

        it('debe manejar req.body undefined sin explotar', async () => {

            const req = mockRequest({ body: undefined });
            const error = { statusCode: 400, message: 'ID is required' };
            GameService.startGame.mockRejectedValue(error);

            await GameController.startGame(req, res, next);

            expect(GameService.startGame).toHaveBeenCalledWith(undefined, undefined);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});