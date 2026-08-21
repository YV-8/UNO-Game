import Result from '../../../logic/monads/respond.js';
import { createGameValidator } from '../../../logic/validators/gameValidator.js';
import { createGameRules } from '../../../logic/validators/gameRules.js';
import { createGameService } from '../../../logic/services/game.service.js';

describe('GameService (DI)', () => {
    const buildService = (overrides = {}) => {
        const gameRepository = {
            findAll: jest.fn(), findById: jest.fn(), findByIdWithCurrentPlayer: jest.fn(),
            findByName: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(),
            ...overrides.gameRepository,
        };
        const gamePlayerRepository = {
            create: jest.fn(), update: jest.fn(), findAllByGameId: jest.fn(),
            findByGameAndPlayer: jest.fn(), countActiveByGameId: jest.fn(),
            ...overrides.gamePlayerRepository,
        };

        const gameValidator = createGameValidator({ gameRepository, gamePlayerRepository });
        const gameRules = createGameRules(gameValidator);
        const service = createGameService({ gameRepository, gamePlayerRepository, gameRules, Result });

        return { service, gameRepository, gamePlayerRepository };
    };

    describe('createGame', () => {
        it('should return Err 400 if name is missing', async () => {
            const { service } = buildService();
            const result = await service.createGame({ rules: 'std', playerId: 1, username: 'moni' });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'name is required' });
        });

        it('should return Err 400 if name is already registered', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findByName.mockResolvedValue({ id: 5, name: 'Partida' });
            const result = await service.createGame({ name: 'Partida', rules: 'std', playerId: 1, username: 'moni' });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'Name is already registered.' });
        });

        it('should create the game and register the creator as first player', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findByName.mockResolvedValue(null);
            gameRepository.create.mockResolvedValue({ id: 10 });
            gamePlayerRepository.create.mockResolvedValue({});

            const result = await service.createGame({ name: 'Partida', rules: 'std', playerId: 1, username: 'moni' });

            expect(gameRepository.create).toHaveBeenCalledWith({
                name: 'Partida', rules: 'std', creatorId: 1, state: 'waiting',
            });
            expect(gamePlayerRepository.create).toHaveBeenCalledWith({
                gameId: 10, playerId: 1, username: 'moni', turnOrder: 1, hasLeft: false,
            });
            expect(result.value).toEqual({ message: 'Game created successfully', game_id: 10 });
        });
    });

    describe('updateGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue(null);
            const result = await service.updateGame(99, { name: 'x' }, 1);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should return Err 400 if state is invalid', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, name: 'P', rules: 'std', state: 'waiting' });
            const result = await service.updateGame(1, { state: 'archived' }, 1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'state must be one of: waiting, in_progress, finished',
            });
        });

        it('should update the game and return message with game_id', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, name: 'P', rules: 'std', state: 'waiting' });
            gameRepository.update.mockResolvedValue({});

            const result = await service.updateGame(1, { state: 'in_progress' }, 1);

            expect(gameRepository.update).toHaveBeenCalledWith(1, { name: 'P', rules: 'std', state: 'in_progress' });
            expect(result.value).toEqual({ message: 'Game updated successfully', game_id: 1 });
        });
    });

    describe('deleteGame', () => {
        it('should return Err 404 if the game does not exist', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.delete.mockResolvedValue(false);
            const result = await service.deleteGame(99);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Game not found' });
        });

        it('should delete the game', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.delete.mockResolvedValue(true);
            const result = await service.deleteGame(1);
            expect(result.value).toEqual({ message: 'Game delete successfully' });
        });
    });

    describe('startGame', () => {
        it('should return Err 403 if caller is not the creator', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            const result = await service.startGame(1, 2);
            expect(result.error).toMatchObject({
                statusCode: 403,
                message: 'Only the creator of the game can perform this action',
            });
        });

        it('should return Err 400 if there are fewer than 2 players', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            gamePlayerRepository.findAllByGameId.mockResolvedValue([{ playerId: 1 }]);
            const result = await service.startGame(1, 1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'Minium 2 Players must have joined to start the game',
            });
        });

        it('should start the game with the first active player', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            gamePlayerRepository.findAllByGameId.mockResolvedValue([{ playerId: 10 }, { playerId: 20 }]);
            gameRepository.update.mockResolvedValue({});

            const result = await service.startGame(1, 1);

            expect(gameRepository.update).toHaveBeenCalledWith(1, { state: 'in_progress', currentPlayerId: 10 });
            expect(result.value).toEqual({ message: 'Game started successfully' });
        });
    });

    describe('endGame', () => {
        it('should return Err 400 if the game is not in_progress', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'waiting' });
            const result = await service.endGame(1, 1);
            expect(result.error).toMatchObject({ statusCode: 400, message: 'This game is not in progress' });
        });

        it('should end the game', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, creatorId: 1, state: 'in_progress' });
            gameRepository.update.mockResolvedValue({});

            const result = await service.endGame(1, 1);

            expect(gameRepository.update).toHaveBeenCalledWith(1, { state: 'finished' });
            expect(result.value).toEqual({ message: 'Game ended successfully' });
        });
    });

    describe('joinGame', () => {
        it('should return Err 400 if the game has already finished', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, state: 'finished' });
            const result = await service.joinGame({ gameId: 1, playerId: 1, username: 'moni' });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'The game has already finished' });
        });

        it('should reactivate a player who had left', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            gamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: true });
            gamePlayerRepository.update.mockResolvedValue({});

            const result = await service.joinGame({ gameId: 1, playerId: 1, username: 'moni' });

            expect(gamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: false });
            expect(result.value).toEqual({ message: 'User rejoined the game successfully' });
        });

        it('should create a new gamePlayer if never joined and game is waiting', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, state: 'waiting' });
            gamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);
            gamePlayerRepository.countActiveByGameId.mockResolvedValue(2);
            gamePlayerRepository.create.mockResolvedValue({});

            const result = await service.joinGame({ gameId: 1, playerId: 1, username: 'moni' });

            expect(gamePlayerRepository.create).toHaveBeenCalledWith({
                gameId: 1, playerId: 1, username: 'moni', turnOrder: 3, hasLeft: false,
            });
            expect(result.value).toEqual({ message: 'User joined the game successfully' });
        });
    });

    describe('leaveGame', () => {
        it('should return Err 400 if player is not active', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            gamePlayerRepository.findByGameAndPlayer.mockResolvedValue(null);
            const result = await service.leaveGame({ gameId: 1, playerId: 1 });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'User is not an active player in this game',
            });
        });

        it('should set hasLeft to true', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            gamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ id: 5, hasLeft: false });
            gamePlayerRepository.update.mockResolvedValue({});

            const result = await service.leaveGame({ gameId: 1, playerId: 1 });

            expect(gamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: true });
            expect(result.value).toEqual({ message: 'User left the game successfully' });
        });
    });

    describe('getGameState', () => {
        it('should return the game id and state', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1, state: 'in_progress' });
            const result = await service.getGameState(1);
            expect(result.value).toEqual({ game_id: 1, state: 'in_progress' });
        });
    });

    describe('getGamePlayers', () => {
        it('should return the list of usernames', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            gamePlayerRepository.findAllByGameId.mockResolvedValue([{ username: 'moni' }, { username: 'luigi' }]);
            const result = await service.getGamePlayers(1);
            expect(result.value).toEqual({ game_id: 1, players: ['moni', 'luigi'] });
        });
    });

    describe('getCurrentPlayer', () => {
        it('should return Err 400 if no current player', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: null });
            const result = await service.getCurrentPlayer(1);
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'This game does not have a current player yet',
            });
        });

        it('should return the current player username', async () => {
            const { service, gameRepository } = buildService();
            gameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: { username: 'moni' } });
            const result = await service.getCurrentPlayer(1);
            expect(result.value).toEqual({ game_id: 1, current_player: 'moni' });
        });
    });

    describe('getGameScores', () => {
        it('should return a username -> score map', async () => {
            const { service, gameRepository, gamePlayerRepository } = buildService();
            gameRepository.findById.mockResolvedValue({ id: 1 });
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { username: 'moni', score: 50 }, { username: 'luigi', score: 30 },
            ]);
            const result = await service.getGameScores(1);
            expect(result.value).toEqual({ game_id: 1, scores: { moni: 50, luigi: 30 } });
        });
    });
});