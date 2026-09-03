import * as GameController from '../../../presentation/controllers/game.controller.js';
import { gameService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    gameService: {
        getAllGame: jest.fn(),
        getGameById: jest.fn(),
        createGame: jest.fn(),
        updateGame: jest.fn(),
        deleteGame: jest.fn(),
        startGame: jest.fn(),
        endGame: jest.fn(),
        joinGame: jest.fn(),
        leaveGame: jest.fn(),
        getTopCard: jest.fn(),
        getGameState: jest.fn(),
        getGamePlayers: jest.fn(),
        getCurrentPlayer: jest.fn(),
        getGameScores: jest.fn(),
        playCard: jest.fn(),
        getPlayerHand: jest.fn(),
        drawCard: jest.fn(),
        getGameOverview: jest.fn(),
        getGameRegistry: jest.fn(),
        sayUno: jest.fn(),
        challengeUno: jest.fn(),
        getScores: jest.fn(),
    },
}));

describe('GameController', () => {
    let res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('getAllGame: should return 200 with games', async () => {
        gameService.getAllGame.mockResolvedValue(Result.Ok([]));
        const req = mockRequest();

        await GameController.getAllGame(req, res);

        expect(gameService.getAllGame).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getGameById: should return 200 with game details', async () => {
        gameService.getGameById.mockResolvedValue(Result.Ok({ id: 1 }));
        const req = mockRequest({ params: { id: '1' } });

        await GameController.getGameById(req, res);

        expect(gameService.getGameById).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('createGame: should extract body and player data and respond 201', async () => {
        gameService.createGame.mockResolvedValue(Result.Ok({ id: 1, name: 'UNO' }));
        const req = mockRequest({
            body: { name: 'UNO', rules: {} },
            player: { id: 10, username: 'player1' },
        });

        await GameController.createGame(req, res);

        expect(gameService.createGame).toHaveBeenCalledWith({
            name: 'UNO',
            rules: {},
            playerId: 10,
            username: 'player1',
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('updateGame: should pass id, body and player.id', async () => {
        gameService.updateGame.mockResolvedValue(Result.Ok({ id: 1 }));
        const req = mockRequest({
            params: { id: '1' },
            body: { name: 'UNO Updated' },
            player: { id: 10 },
        });

        await GameController.updateGame(req, res);

        expect(gameService.updateGame).toHaveBeenCalledWith('1', { name: 'UNO Updated' }, 10);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('deleteGame: should pass game id', async () => {
        gameService.deleteGame.mockResolvedValue(Result.Ok({ success: true }));
        const req = mockRequest({ params: { id: '1' } });

        await GameController.deleteGame(req, res);

        expect(gameService.deleteGame).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('startGame: should pass game_id and player.id', async () => {
        gameService.startGame.mockResolvedValue(Result.Ok({ started: true }));
        const req = mockRequest({ body: { game_id: 5 }, player: { id: 10 } });

        await GameController.startGame(req, res);

        expect(gameService.startGame).toHaveBeenCalledWith(5, 10);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('endGame: should pass game_id and player.id', async () => {
        gameService.endGame.mockResolvedValue(Result.Ok({ ended: true }));
        const req = mockRequest({ body: { game_id: 5 }, player: { id: 10 } });

        await GameController.endGame(req, res);

        expect(gameService.endGame).toHaveBeenCalledWith(5, 10);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('join: should convert game_id to number and call joinGame', async () => {
        gameService.joinGame.mockResolvedValue(Result.Ok({ joined: true }));
        const req = mockRequest({
            body: { game_id: '5' },
            player: { id: 10, username: 'player1' },
        });

        await GameController.join(req, res);

        expect(gameService.joinGame).toHaveBeenCalledWith({ gameId: 5, playerId: 10, username: 'player1' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('leave: should convert game_id to number and call leaveGame', async () => {
        gameService.leaveGame.mockResolvedValue(Result.Ok({ left: true }));
        const req = mockRequest({ body: { game_id: '5' }, player: { id: 10 } });

        await GameController.leave(req, res);

        expect(gameService.leaveGame).toHaveBeenCalledWith({ gameId: 5, playerId: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getTopCard: should call getTopCard with numeric game_id', async () => {
        gameService.getTopCard.mockResolvedValue(Result.Ok({ card: 'Red 5' }));
        const req = mockRequest({ body: { game_id: '5' } });

        await GameController.getTopCard(req, res);

        expect(gameService.getTopCard).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getGameState: should query game state', async () => {
        gameService.getGameState.mockResolvedValue(Result.Ok({ state: 'playing' }));
        const req = mockRequest({ body: { game_id: 5 } });

        await GameController.getGameState(req, res);

        expect(gameService.getGameState).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getGamePlayers: should return game players', async () => {
        gameService.getGamePlayers.mockResolvedValue(Result.Ok([]));
        const req = mockRequest({ body: { game_id: 5 } });

        await GameController.getGamePlayers(req, res);

        expect(gameService.getGamePlayers).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getCurrentPlayer: should return current player', async () => {
        gameService.getCurrentPlayer.mockResolvedValue(Result.Ok({ id: 10 }));
        const req = mockRequest({ body: { game_id: 5 } });

        await GameController.getCurrentPlayer(req, res);

        expect(gameService.getCurrentPlayer).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getGameScores: should convert game_id to number', async () => {
        gameService.getGameScores.mockResolvedValue(Result.Ok([]));
        const req = mockRequest({ body: { game_id: '5' } });

        await GameController.getGameScores(req, res);

        expect(gameService.getGameScores).toHaveBeenCalledWith(5);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('playCard: should map request fields correctly', async () => {
        gameService.playCard.mockResolvedValue(Result.Ok({ played: true }));
        const req = mockRequest({
            params: { id: 'game-1' },
            player: { id: 10 },
            body: { cardPlayed: 'RED_5', chosenColor: 'RED', player: 'player1' },
        });

        await GameController.playCard(req, res);

        expect(gameService.playCard).toHaveBeenCalledWith({
            gameId: 'game-1',
            playerId: 10,
            cardPlayedStr: 'RED_5',
            chosenColor: 'RED',
            bodyUsername: 'player1',
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getMyHand: should call getPlayerHand', async () => {
        gameService.getPlayerHand.mockResolvedValue(Result.Ok([]));
        const req = mockRequest({ params: { id: 'game-1' }, player: { id: 10 } });

        await GameController.getMyHand(req, res);

        expect(gameService.getPlayerHand).toHaveBeenCalledWith({ gameId: 'game-1', playerId: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('drawCard: should call drawCard with parameters', async () => {
        gameService.drawCard.mockResolvedValue(Result.Ok({ card: 'Blue 2' }));
        const req = mockRequest({
            params: { id: 'game-1' },
            player: { id: 10 },
            body: { player: 'player1' },
        });

        await GameController.drawCard(req, res);

        expect(gameService.drawCard).toHaveBeenCalledWith({
            gameId: 'game-1',
            playerId: 10,
            bodyUsername: 'player1',
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    describe('getGameOverview', () => {
        it('should return 200 with overview JSON on success', async () => {
            const overview = { overview: 'data' };
            gameService.getGameOverview.mockResolvedValue({
                isErr: () => false,
                value: overview,
            });
            const req = mockRequest({ params: { id: 'game-1' }, player: { id: 10 } });

            await GameController.getGameOverview(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(overview);
        });

        it('should return error status and message when result.isErr() is true', async () => {
            gameService.getGameOverview.mockResolvedValue({
                isErr: () => true,
                error: { statusCode: 404, message: 'Game not found' },
            });
            const req = mockRequest({ params: { id: 'game-1' }, player: { id: 10 } });

            await GameController.getGameOverview(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Game not found' });
        });
    });

    it('getGameRegistry: should call getGameRegistry', async () => {
        gameService.getGameRegistry.mockResolvedValue(Result.Ok([]));
        const req = mockRequest({ params: { id: 'game-1' }, player: { id: 10 } });

        await GameController.getGameRegistry(req, res);

        expect(gameService.getGameRegistry).toHaveBeenCalledWith({ gameId: 'game-1', playerId: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sayUno: should call sayUno', async () => {
        gameService.sayUno.mockResolvedValue(Result.Ok({ success: true }));
        const req = mockRequest({
            params: { id: 'game-1' },
            player: { id: 10 },
            body: { player: 'player1' },
        });

        await GameController.sayUno(req, res);

        expect(gameService.sayUno).toHaveBeenCalledWith({
            gameId: 'game-1',
            playerId: 10,
            bodyUsername: 'player1',
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('challengeUno: should call challengeUno', async () => {
        gameService.challengeUno.mockResolvedValue(Result.Ok({ success: true }));
        const req = mockRequest({
            params: { id: 'game-1' },
            player: { id: 10 },
            body: { challengedPlayer: 'player2', challenger: 'player1' },
        });

        await GameController.challengeUno(req, res);

        expect(gameService.challengeUno).toHaveBeenCalledWith({
            gameId: 'game-1',
            playerId: 10,
            challengedUsername: 'player2',
            bodyUsername: 'player1',
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getGameScore: should call getScores', async () => {
        gameService.getScores.mockResolvedValue(Result.Ok({ score: 100 }));
        const req = mockRequest({ params: { id: 'game-1' }, player: { id: 10 } });

        await GameController.getGameScore(req, res);

        expect(gameService.getScores).toHaveBeenCalledWith({ gameId: 'game-1', playerId: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
