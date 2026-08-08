import GameRepository from '../../../dataAccess/repositories/game.repository.js';
import GamePlayerRepository from '../../../dataAccess/repositories/gamePlayer.repository.js';
import { verifyAccessToken } from '../../../helpers/verifyToken.js';
import { appError } from '../../../middlewares/appError.js';
import * as GameService from '../../../logic/services/game.service.js';

jest.mock('../../../dataAccess/repositories/game.repository.js');
jest.mock('../../../dataAccess/repositories/gamePlayer.repository.js');
jest.mock('../../../dataAccess/repositories/cards.repository.js');
jest.mock('../../../helpers/verifyToken.js');

describe('GameService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllGame', () => {
        it('debe retornar todos los juegos', async () => {

            const mockGames = [{ id: 1, name: 'Uno' }, { id: 2, name: 'Lol' }];
            GameRepository.findAll.mockResolvedValue(mockGames);

            const result = await GameService.getAllGame();

            expect(result).toEqual(mockGames);
            expect(GameRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getGameById', () => {
        it('debe lanzar error 400 si no se pasa id', async () => {
            await expect(GameService.getGameById()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {

            GameRepository.findById.mockResolvedValue(null);

            await expect(GameService.getGameById(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'game not found',
            });
        });

        it('debe retornar el juego si existe', async () => {

            const mockGame = { id: 1, name: 'Partida 1' };
            GameRepository.findById.mockResolvedValue(mockGame);

            const result = await GameService.getGameById(1);

            expect(result).toEqual(mockGame);
        });
    });

    describe('createGame', () => {
        it('Should th row error 401 if its invalid token', async () => {
            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            await expect(
                GameService.createGame({name: 'Solitario', rules: 'std', accessToken: 'bad'})
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid token'
            });
        });

        it('should return error 400 if the name had already register', async () => {
            verifyAccessToken.mockReturnValue({
                id: 1,
                username: 'moni'
            });
            GameRepository.findByName.mockResolvedValue({
                id: 5,
                name: 'Partida'
            });

            await expect(
                GameService.createGame({name: 'Partida', rules: 'std', accessToken: 'valid'})
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'Name is already registered.'
            });
            expect(GameRepository.create).not.toHaveBeenCalled();
        });

        it('debe lanzar error 400 si no se pasa el nombre', async () => {
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findByName.mockResolvedValue(null);

            await expect(
                GameService.createGame({ rules: 'std', accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 400, message: 'name is required' });
        });

        it('debe crear el juego en estado waiting con el creatorId del token', async () => {
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findByName.mockResolvedValue(null);
            const createdGame = {
                id: 10, name: 'Partida',
                rules: 'std', creatorId: 1, state: 'waiting'
            };
            GameRepository.create.mockResolvedValue(createdGame);

            const result = await GameService.createGame({name: 'Partida',
                rules: 'std', accessToken: 'valid'
            });

            expect(GameRepository.create).toHaveBeenCalledWith({
                name: 'Partida',
                rules: 'std',
                creatorId: 1,
                state: 'waiting',
            });
            expect(result).toEqual(createdGame);
        });
    });

    describe('updateGame', () => {
        it('debe retornar error 401 si el token es inválido', async () => {
            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);});

            await expect(
                GameService.updateGame(1, { name: 'Nueva' }, 'bad')
            ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid token' });
        });

        it('debe retornar error 404 si el juego no existe', async () => {
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(null);
            
            await expect(
                GameService.updateGame(99, { name: 'Nueva' }, 'valid')
            ).rejects.toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('debe retornar error 400 si el state no es válido', async () => {
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Partida', rules: 'std', state: 'waiting' });

            await expect(
                GameService.updateGame(1, { state: 'archived' }, 'valid')
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'state must be one of: waiting, in_progress, finished',
            });
        });

        it('debe retornar los valores previos si no se envían campos', async () => {
            const existingGame = { id: 1, name: 'Partida', rules: 'std', state: 'waiting' };
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(existingGame);
            GameRepository.update.mockResolvedValue(existingGame);

            await GameService.updateGame(1, {}, 'valid');

            expect(GameRepository.update).toHaveBeenCalledWith(1, {
                name: 'Partida',
                rules: 'std',
                state: 'waiting',
            });
        });

        it('debe actualizar solo los campos enviados', async () => {
            const existingGame = {
                id: 1, name: 'Partida',
                rules: 'std', state: 'waiting'
            };
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(existingGame);
            GameRepository.update.mockResolvedValue({ ...existingGame, state: 'in_progress' });

            const result = await GameService.updateGame(1, { state: 'in_progress' }, 'valid');

            expect(GameRepository.update).toHaveBeenCalledWith(1, {
                name: 'Partida',
                rules: 'std',
                state: 'in_progress',
            });
            expect(result.state).toBe('in_progress');
        });
    });

    describe('deleteGame', () => {
        it('debe lanzar error 400 si no se pasa id', async () => {
            await expect(GameService.deleteGame()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {

            GameRepository.delete.mockResolvedValue(false);
            await expect(GameService.deleteGame(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('debe eliminar el juego correctamente', async () => {
            GameRepository.delete.mockResolvedValue(true);
            const result = await GameService.deleteGame(1);

            expect(result).toEqual({});
            expect(GameRepository.delete).toHaveBeenCalledWith(1);
        });
    });

    describe('getGameState', () => {
        it('debe lanzar error 400 si no se pasa id', async () => {
            await expect(GameService.getGameState()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 400 si el id no es numérico', async () => {
            await expect(GameService.getGameState('abc')).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {
            GameRepository.findById.mockResolvedValue(null);

            await expect(GameService.getGameState(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('debe retornar el id y el state del juego', async () => {

            GameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            const result = await GameService.getGameState(1);

            expect(result).toEqual({ game_id: 1, state: 'in_progress' });
        });
    });

    describe('getGamePlayers', () => {
        it('debe lanzar error 400 si no se pasa id', async () => {
            await expect(GameService.getGamePlayers()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {

            GameRepository.findById.mockResolvedValue(null);

            await expect(GameService.getGamePlayers(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('debe retornar la lista de usernames de los jugadores', async () => {

            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([
                { username: 'moni' },
                { username: 'luigi' },
            ]);

            const result = await GameService.getGamePlayers(1);

            expect(result).toEqual({ game_id: 1, players: ['moni', 'luigi'] });
        });

        it('debe retornar una lista vacía si no hay jugadores', async () => {

            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([]);

            const result = await GameService.getGamePlayers(1);

            expect(result).toEqual({ game_id: 1, players: [] });
        });
    });

    describe('getCurrentPlayer', () => {
        it('debe lanzar error 400 si no se pasa id', async () => {
            await expect(GameService.getCurrentPlayer()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {

            GameRepository.findByIdWithCurrentPlayer.mockResolvedValue(null);

            await expect(GameService.getCurrentPlayer(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('debe lanzar error 400 si el juego no tiene jugador actual', async () => {

            GameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: null });

            await expect(GameService.getCurrentPlayer(1)).rejects.toMatchObject({
                statusCode: 400,
                message: 'This game does not have a current player yet',
            });
        });

        it('debe retornar el username del jugador actual', async () => {

            GameRepository.findByIdWithCurrentPlayer.mockResolvedValue({
                id: 1,
                currentPlayer: { username: 'moni' },
            });

            const result = await GameService.getCurrentPlayer(1);

            expect(result).toEqual({ game_id: 1, current_player: 'moni' });
        });
    });

    describe('getGameScores', () => {
        it('debe lanzar error 400 si no se pasa id', async () => {
            await expect(GameService.getGameScores()).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {

            GameRepository.findById.mockResolvedValue(null);

            await expect(GameService.getGameScores(99)).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('debe retornar un objeto username -> score', async () => {

            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([
                { username: 'moni', score: 50 },
                { username: 'luigi', score: 30 },
            ]);

            const result = await GameService.getGameScores(1);

            expect(result).toEqual({
                game_id: 1, scores:
                    { moni: 50, luigi: 30 }
            });
        });
    });

    describe('startGame', () => {
        it('debe lanzar error 400 si no se pasa gameId', async () => {
            await expect(GameService.startGame(undefined, 'valid')).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('debe lanzar error 401 si el token es inválido', async () => {

            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            await expect(GameService.startGame(1, 'bad')).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid token',
            });
        });

        it('debe lanzar error 404 si el juego no existe', async () => {

            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(null);

            await expect(GameService.startGame(99, 'valid')).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('debe lanzar error 403 si quien llama no es el creador', async () => {

            verifyAccessToken.mockReturnValue({ id: 2 });
            GameRepository.findById.mockResolvedValue({
                id: 1,
                creatorId: 1, state: 'waiting'
            });

            await expect(GameService.startGame(1, 'valid')).rejects.toMatchObject({
                statusCode: 403,
                message: 'Only the creator of the game can start it',
            });
        });

        it('debe lanzar error 400 si el juego no está en waiting', async () => {

            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({
                id: 1,
                creatorId: 1, state: 'in_progress'
            });

            await expect(GameService.startGame(1, 'valid')).rejects.toMatchObject({
                statusCode: 400,
                message: 'This game cannot be started from its current state',
            });
        });

        it('debe lanzar error 400 si hay menos de 2 jugadores', async () => {

            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({
                id: 1,
                creatorId: 1, state: 'waiting'
            });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([{ playerId: 1 }]);

            await expect(GameService.startGame(1, 'valid')).rejects.toMatchObject({
                statusCode: 400,
                message: 'Minium 2 Players must have joined to start the game',
            });
        });

        it('debe iniciar el juego con el primer jugador como currentPlayerId', async () => {
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 10 },
                { playerId: 20 },
            ]);
            GameRepository.update.mockResolvedValue({});

            const result = await GameService.startGame(1, 'valid');

            expect(GameRepository.update).toHaveBeenCalledWith(1, {
                state: 'in_progress',
                currentPlayerId: 10,
            });
            expect(result).toEqual({});
        });
    });

    describe('endGame', () => {
        it('should throw error 400 if the gameId is not passed', async () => {
            await expect(GameService.endGame(undefined, 'valid')).rejects.toMatchObject({
                statusCode: 400,
                message: 'ID is required',
            });
        });

        it('should throw error 401 if the token is invalid', async () => {
            // Arrange
            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            // Act & Assert
            await expect(GameService.endGame(1, 'bad')).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid token',
            });
        });

        it('should throw error 404 if the game does not exist', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(GameService.endGame(99, 'valid')).rejects.toMatchObject({
                statusCode: 404,
                message: 'Game not found',
            });
        });

        it('should throw error 403 if the caller is not the creator', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 2 });
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'in_progress' });

            // Act & Assert
            await expect(GameService.endGame(1, 'valid')).rejects.toMatchObject({
                statusCode: 403,
                message: 'Only the creator of the game can end it',
            });
        });

        it('should throw error 400 if the game is not in_progress', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });

            // Act & Assert
            await expect(GameService.endGame(1, 'valid')).rejects.toMatchObject({
                statusCode: 400,
                message: 'This game is not in progress',
            });
        });

        it('must end the game successfully ', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'in_progress' });
            GameRepository.update.mockResolvedValue({});

            // Act
            const result = await GameService.endGame(1, 'valid');

            // Assert
            expect(GameRepository.update).toHaveBeenCalledWith(1, { state: 'finished' });
            expect(result).toEqual({});
        });
    });

    describe('joinGame', () => {
        it('should throw error 400 if the gameId is not passed', async () => {
            await expect(
                GameService.joinGame({ accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 400, message: 'game_id is required' });
        });

        it('should throw error 401 if the token is invaliddo', async () => {
            // Arrange
            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            // Act & Assert
            await expect(
                GameService.joinGame({ gameId: 1, accessToken: 'bad' })
            ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid token' });
        });

        it('should throw a 404 error if the game does not existe', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                GameService.joinGame({ gameId: 99, accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should throw error 400 if the game has already ended', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'finished' });

            // Act & Assert
            await expect(
                GameService.joinGame({ gameId: 1, accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 400, message: 'The game has already finished' });
        });

        it('should throw error 400 if the player is already active in the game', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'waiting' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: false });

            // Act & Assert
            await expect(
                GameService.joinGame({ gameId: 1, accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 400, message: 'User stays in this game' });
        });

        it('should reactivate the player if they had previously left (has Left true)', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: true });
            GamePlayerRepository.update.mockResolvedValue({});

            // Act
            const result = await GameService.joinGame({ gameId: 1, accessToken: 'valid' });

            // Assert
            expect(GamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: false });
            expect(GamePlayerRepository.create).not.toHaveBeenCalled();
            expect(result).toEqual({});
        });

        it('should throw error 400 game state => started and player has never joined before', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);

            // Act & Assert
            await expect(
                GameService.joinGame({ gameId: 1, accessToken: 'valid' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'The game started, only players who already joined can rejoin',
            });
        });

        it('should create a new gamePlayer if the game is on waiting and you never joined', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'waiting' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);
            GamePlayerRepository.countActiveByGameId.mockResolvedValue(2);
            GamePlayerRepository.create.mockResolvedValue({});

            // Act
            const result = await GameService.joinGame({ gameId: 1, accessToken: 'valid' });

            // Assert
            expect(GamePlayerRepository.create).toHaveBeenCalledWith({
                gameId: 1,
                playerId: 1,
                username: 'moni',
                turnOrder: 3,
                hasLeft: false,
            });
            expect(result).toEqual({});
        });
    });

    describe('leaveGame', () => {
        it('should throw error 400 if the gameId is not passed', async () => {
            await expect(
                GameService.leaveGame({ accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 400, message: 'game_id is required' });
        });

        it('should throw error 401 if the token is invalid', async () => {
            // Arrange
            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            // Act & Assert
            await expect(
                GameService.leaveGame({ gameId: 1, accessToken: 'bad' })
            ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid token' });
        });

        it('should throw error 404 if the game does not existe', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                GameService.leaveGame({ gameId: 99, accessToken: 'valid' })
            ).rejects.toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should throw error 400 if the player is not active in the game', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);

            // Act & Assert
            await expect(
                GameService.leaveGame({ gameId: 1, accessToken: 'valid' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'User is not an active player in this game',
            });
        });

        it('should throw error 400 if the player had already left the game', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: true });

            // Act & Assert
            await expect(
                GameService.leaveGame({ gameId: 1, accessToken: 'valid' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'User is not an active player in this game',
            });
        });

        it('should set hasLeft to true correctly', async () => {
            // Arrange
            verifyAccessToken.mockReturnValue({ id: 1 });
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: false });
            GamePlayerRepository.update.mockResolvedValue({});

            // Act
            const result = await GameService.leaveGame({ gameId: 1, accessToken: 'valid' });

            // Assert
            expect(GamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: true });
            expect(result).toEqual({});
        });
        //deja el turno a otro
    });

});
