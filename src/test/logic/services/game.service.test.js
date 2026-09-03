import GameRepository from '../../../dataAccess/repositories/game.repository.js';
import GamePlayerRepository from '../../../dataAccess/repositories/gamePlayer.repository.js';
import * as GameService from '../../../logic/services/game.service.js';

jest.mock('../../../dataAccess/repositories/game.repository.js');
jest.mock('../../../dataAccess/repositories/gamePlayer.repository.js');

describe('GameService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getAllGame', () => {
        it('should return Ok with all games', async () => {
            const mockGames = [{ id: 1, name: 'Uno' }, { id: 2, name: 'Lol' }];
            GameRepository.findAll.mockResolvedValue(mockGames);

            const result = await GameService.getAllGame();

            expect(result.value).toEqual(mockGames);
            expect(GameRepository.findAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('getGameById', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await GameService.getGameById();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.getGameById(99);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'game not found' });
        });

        it('should return Ok with the game if it exists', async () => {
            const mockGame = { id: 1, name: 'Partida 1' };
            GameRepository.findById.mockResolvedValue(mockGame);
            const result = await GameService.getGameById(1);
            expect(result.value).toEqual(mockGame);
        });
    });

    describe('createGame', () => {
        it('should return Err 400 if name is not provided', async () => {
            GameRepository.findByName.mockResolvedValue(null);
            const result = await GameService.createGame({ rules: 'std', playerId: 1 });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'name is required' });
        });

        it('should return Err 400 if the name is already registered', async () => {
            GameRepository.findByName.mockResolvedValue({ id: 5, name: 'Partida' });
            const result = await GameService.createGame({ name: 'Partida', rules: 'std', playerId: 1 });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'Name is already registered.' });
            expect(GameRepository.create).not.toHaveBeenCalled();
        });

        it('should create the game in waiting state with message and game_id', async () => {
            GameRepository.findByName.mockResolvedValue(null);
            GameRepository.create.mockResolvedValue({ id: 10, name: 'Partida', creatorId: 1, state: 'waiting' });

            const result = await GameService.createGame({ name: 'Partida', rules: 'std', playerId: 1 });

            expect(GameRepository.create).toHaveBeenCalledWith({
                name: 'Partida', rules: 'std', creatorId: 1, state: 'waiting',
            });
            expect(result.value).toEqual({ message: 'Game created successfully', game_id: 10 });
        });
    });

    describe('updateGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.updateGame(99, { name: 'Nueva' }, 1);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return Err 400 if state is not valid', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, name: 'Partida', rules: 'std', state: 'waiting' });
            const result = await GameService.updateGame(1, { state: 'archived' }, 1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'state must be one of: waiting, in_progress, finished',
            });
        });

        it('should update the game and return message with game_id', async () => {
            const existingGame = { id: 1, name: 'Partida', rules: 'std', state: 'waiting' };
            GameRepository.findById.mockResolvedValue(existingGame);
            GameRepository.update.mockResolvedValue({ ...existingGame, state: 'in_progress' });

            const result = await GameService.updateGame(1, { state: 'in_progress' }, 1);

            expect(GameRepository.update).toHaveBeenCalledWith(1, {
                name: 'Partida', rules: 'std', state: 'in_progress',
            });
            expect(result.value).toEqual({ message: 'Game updated successfully', game_id: 1 });
        });
    });

    describe('deleteGame', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await GameService.deleteGame();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.delete.mockResolvedValue(false);
            const result = await GameService.deleteGame(99);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should delete the game and return a success message', async () => {
            GameRepository.delete.mockResolvedValue(true);
            const result = await GameService.deleteGame(1);
            expect(result.value).toEqual({ message: 'Game delete successfully' });
        });
    });

    describe('startGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.startGame(99, 1);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return Err 403 if the caller is not the creator', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            const result = await GameService.startGame(1, 2);
            expect(result.error).toMatchObject({
                statusCode: 403,
                message: 'Only the creator of the game can perform this action',
            });
        });

        it('should return Err 400 if the game is not in waiting state', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'in_progress' });
            const result = await GameService.startGame(1, 1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'This game cannot be started from its current state',
            });
        });

        it('should return Err 400 if there are fewer than 2 players', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([{ playerId: 1 }]);
            const result = await GameService.startGame(1, 1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'Minium 2 Players must have joined to start the game',
            });
        });

        it('should start the game and return a success message', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([{ playerId: 10 }, { playerId: 20 }]);
            GameRepository.update.mockResolvedValue({});

            const result = await GameService.startGame(1, 1);

            expect(GameRepository.update).toHaveBeenCalledWith(1, {
                state: 'in_progress', currentPlayerId: 10,
            });
            expect(result.value).toEqual({ message: 'Game started successfully' });
        });
    });

    describe('endGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.endGame(99, 1);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return Err 403 if the caller is not the creator', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'in_progress' });
            const result = await GameService.endGame(1, 2);
            expect(result.error).toMatchObject({
                statusCode: 403,
                message: 'Only the creator of the game can perform this action',
            });
        });

        it('should return Err 400 if the game is not in_progress', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            const result = await GameService.endGame(1, 1);
            expect(result.error).toMatchObject({ statusCode: 400, message: 'This game is not in progress' });
        });

        it('should end the game and return a success message', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'in_progress' });
            GameRepository.update.mockResolvedValue({});

            const result = await GameService.endGame(1, 1);

            expect(GameRepository.update).toHaveBeenCalledWith(1, { state: 'finished' });
            expect(result.value).toEqual({ message: 'Game ended successfully' });
        });
    });

    describe('joinGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.joinGame({ gameId: 99, playerId: 1, username: 'moni' });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return Err 400 if the game has already finished', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'finished' });
            const result = await GameService.joinGame({ gameId: 1, playerId: 1, username: 'moni' });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'The game has already finished' });
        });

        it('should return Err 400 if the player is already active in the game', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'waiting' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: false });
            const result = await GameService.joinGame({ gameId: 1, playerId: 1, username: 'moni' });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'User stays in this game' });
        });

        it('should reactivate the player if they had previously left', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: true });
            GamePlayerRepository.update.mockResolvedValue({});

            const result = await GameService.joinGame({ gameId: 1, playerId: 1, username: 'moni' });

            expect(GamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: false });
            expect(GamePlayerRepository.create).not.toHaveBeenCalled();
            expect(result.value).toEqual({ message: 'User rejoined the game successfully' });
        });

        it('should return Err 400 if the game started and the player never joined before', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);

            const result = await GameService.joinGame({ gameId: 1, playerId: 1, username: 'moni' });

            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'The game started, only players who already joined can rejoin',
            });
        });

        it('should create a new gamePlayer if the game is waiting and the player never joined', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'waiting' });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);
            GamePlayerRepository.countActiveByGameId.mockResolvedValue(2);
            GamePlayerRepository.create.mockResolvedValue({});

            const result = await GameService.joinGame({ gameId: 1, playerId: 1, username: 'moni' });

            expect(GamePlayerRepository.create).toHaveBeenCalledWith({
                gameId: 1, playerId: 1, username: 'moni', turnOrder: 3, hasLeft: false,
            });
            expect(result.value).toEqual({ message: 'User joined the game successfully' });
        });
    });

    describe('leaveGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.leaveGame({ gameId: 99, playerId: 1 });
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return Err 400 if the player is not active in the game', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);

            const result = await GameService.leaveGame({ gameId: 1, playerId: 1 });

            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'User is not an active player in this game',
            });
        });

        it('should return Err 400 if the player had already left', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: true });

            const result = await GameService.leaveGame({ gameId: 1, playerId: 1 });

            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'User is not an active player in this game',
            });
        });

        it('should set hasLeft to true and return a success message', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: false });
            GamePlayerRepository.update.mockResolvedValue({});

            const result = await GameService.leaveGame({ gameId: 1, playerId: 1 });

            expect(GamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: true });
            expect(result.value).toEqual({ message: 'User left the game successfully' });
        });
    });

    describe('getGameState', () => {
        it('should return Err 400 if id is not provided', async () => {
            const result = await GameService.getGameState();
            expect(result.error).toMatchObject({ statusCode: 400, message: 'ID is required' });
        });

        it('should return Err 404 if the game does not exist', async () => {
            GameRepository.findById.mockResolvedValue(null);
            const result = await GameService.getGameState(99);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return the game id and state', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            const result = await GameService.getGameState(1);
            expect(result.value).toEqual({ game_id: 1, state: 'in_progress' });
        });
    });

    describe('getGamePlayers', () => {
        it('should return the list of player usernames', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([{ username: 'moni' }, { username: 'luigi' }]);

            const result = await GameService.getGamePlayers(1);

            expect(result.value).toEqual({ game_id: 1, players: ['moni', 'luigi'] });
        });
    });

    describe('getCurrentPlayer', () => {
        it('should return Err 400 if the game has no current player', async () => {
            GameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: null });
            const result = await GameService.getCurrentPlayer(1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'This game does not have a current player yet',
            });
        });

        it('should return the current player username', async () => {
            GameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: { username: 'moni' } });
            const result = await GameService.getCurrentPlayer(1);
            expect(result.value).toEqual({ game_id: 1, current_player: 'moni' });
        });
    });

    describe('getGameScores', () => {
        it('should return a username -> score map', async () => {
            GameRepository.findById.mockResolvedValue({ id: 1 });
            GamePlayerRepository.findAllByGameId.mockResolvedValue([
                { username: 'moni', score: 50 },
                { username: 'luigi', score: 30 },
            ]);

            const result = await GameService.getGameScores(1);

            expect(result.value).toEqual({ game_id: 1, scores: { moni: 50, luigi: 30 } });
        });
    });
});