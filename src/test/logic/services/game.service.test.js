import { gameService as createGameService } from '../../../logic/services/game.service.js';
import Result from '../../../logic/monads/respond.js';

describe('GameService Unit Tests', () => {
    let gameRepository, cardRepository, registryRepository, gamePlayerRepository, scoreRepository,
        unoCardBuilder, unoDeck, unoGameRules, gameOverviewBuilder, turnResolver, turnRegistryBuilder,
        gameRules, gameService;

    beforeEach(() => {
        gameRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByIdWithCurrentPlayer: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        cardRepository = {
            update: jest.fn(),
            countByGameAndPlayer: jest.fn(),
            findHandByGameAndPlayer: jest.fn(),
            findTopDiscardByGameId: jest.fn(),
        };

        registryRepository = {
            create: jest.fn(),
            findByGameId: jest.fn(),
        };

        gamePlayerRepository = {
            findAllByGameId: jest.fn(),
            findByGameAndPlayer: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            countActiveByGameId: jest.fn(),
        };

        scoreRepository = {
            findAllByGameId: jest.fn(),
            findByGameAndPlayer: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };

        unoCardBuilder = {
            dealInitialCards: jest.fn(),
            drawCards: jest.fn(),
        };

        unoDeck = {
            formatCard: jest.fn((c) => `${c?.color ?? ''} ${c?.value ?? ''}`.trim()),
            getCardPoints: jest.fn(() => 0),
        };

        unoGameRules = {
            isReverseCard: jest.fn(() => false),
            isSkipCard: jest.fn(() => false),
            getDrawPenalty: jest.fn(() => 0),
            getNextPlayerIndex: jest.fn((i) => i + 1),
        };

        gameOverviewBuilder = { build: jest.fn() };
        turnResolver = { resolveNextTurn: jest.fn(), resolveNextPlayer: jest.fn() };
        turnRegistryBuilder = { build: jest.fn() };

        gameRules = {
            validateCreateGame: jest.fn(),
            validateUpdateGame: jest.fn(),
            validateStartGame: jest.fn(),
            validateEndGame: jest.fn(),
            validateJoinGame: jest.fn(),
            validateLeaveGame: jest.fn(),
            validatePlayCard: jest.fn(),
            validateGetTopCard: jest.fn(),
            validateDrawCard: jest.fn(),
            validateGetPlayerHand: jest.fn(),
            validateGetGameOverview: jest.fn(),
            validateSayUno: jest.fn(),
            validateChallengeUno: jest.fn(),
            validateGetGameScores: jest.fn(),
        };

        gameService = createGameService({
            gameRepository, cardRepository, registryRepository, gameRules, gamePlayerRepository,
            scoreRepository, unoCardBuilder, unoDeck, unoGameRules, gameOverviewBuilder,
            turnResolver, turnRegistryBuilder, respond: Result,
        });
    });

    describe('getAllGame', () => {
        test('returns Ok with all games', async () => {
            gameRepository.findAll.mockResolvedValue([{ id: 1 }]);
            const result = await gameService.getAllGame();
            expect(result.value).toEqual([{ id: 1 }]);
        });
    });

    describe('getGameById', () => {
        test('returns Err 400 when id is missing', async () => {
            const result = await gameService.getGameById(undefined);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok with the game', async () => {
            gameRepository.findById.mockResolvedValue({ id: 1, name: 'Test' });
            const result = await gameService.getGameById(1);
            expect(result.value).toEqual({ id: 1, name: 'Test' });
        });
    });

    describe('createGame', () => {
        test('returns Err if the validation fails', async () => {
            gameRules.validateCreateGame.mockResolvedValue(Result.Err({ statusCode: 400, message: 'Err' }));
            const result = await gameService.createGame({ name: '', rules: '', playerId: 1, username: 'ale' });
            expect(result.isErr()).toBe(true);
        });

        test('creates the game and registers the creator as first player', async () => {
            gameRules.validateCreateGame.mockResolvedValue(Result.Ok({ name: 'G1', rules: null, playerId: 1 }));
            gameRepository.create.mockResolvedValue({ id: 10 });

            const result = await gameService.createGame({ name: 'G1', rules: null, playerId: 1, username: 'ale' });

            expect(gamePlayerRepository.create).toHaveBeenCalledWith({
                gameId: 10, playerId: 1, username: 'ale', turnOrder: 1, hasLeft: false,
            });
            expect(result.value).toEqual({ message: 'Game created successfully', game_id: 10 });
        });
    });

    describe('updateGame', () => {
        test('keeps previous values when fields are not provided', async () => {
            gameRules.validateUpdateGame.mockResolvedValue(Result.Ok({
                game: { id: 1, name: 'Old', rules: 'r1', state: 'waiting' },
                name: undefined, rules: undefined, state: 'in_progress',
            }));

            const result = await gameService.updateGame(1, { state: 'in_progress' }, 1);

            expect(gameRepository.update).toHaveBeenCalledWith(1, { name: 'Old', rules: 'r1', state: 'in_progress' });
            expect(result.value).toEqual({ message: 'Game updated successfully', game_id: 1 });
        });
    });

    describe('deleteGame', () => {
        test('returns Err 404 when nothing was deleted', async () => {
            gameRepository.delete.mockResolvedValue(false);
            const result = await gameService.deleteGame(1);
            expect(result.isErr()).toBe(true);
        });

        test('returns Ok on successful delete', async () => {
            gameRepository.delete.mockResolvedValue(true);
            const result = await gameService.deleteGame(1);
            expect(result.value).toEqual({ message: 'Game delete successfully' });
        });
    });

    describe('getGameState', () => {
        test('returns the current state', async () => {
            gameRepository.findById.mockResolvedValue({ id: 1, state: 'waiting' });
            const result = await gameService.getGameState(1);
            expect(result.value).toEqual({ game_id: 1, state: 'waiting' });
        });
    });

    describe('getGamePlayers', () => {
        test('returns usernames of active players', async () => {
            gameRepository.findById.mockResolvedValue({ id: 1 });
            gamePlayerRepository.findAllByGameId.mockResolvedValue([{ username: 'ale' }, { username: 'lis' }]);
            const result = await gameService.getGamePlayers(1);
            expect(result.value).toEqual({ game_id: 1, players: ['ale', 'lis'] });
        });
    });

    describe('getCurrentPlayer', () => {
        test('returns Err 400 when there is no current player yet', async () => {
            gameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: null });
            const result = await gameService.getCurrentPlayer(1);
            expect(result.isErr()).toBe(true);
        });

        test('returns the current player username', async () => {
            gameRepository.findByIdWithCurrentPlayer.mockResolvedValue({ id: 1, currentPlayer: { username: 'ale' } });
            const result = await gameService.getCurrentPlayer(1);
            expect(result.value).toEqual({ game_id: 1, current_player: 'ale' });
        });
    });

    describe('getScores', () => {
        test('maps scores by username, defaulting missing scores to 0', async () => {
            gameRules.validateGetGameScores.mockResolvedValue(Result.Ok({ game: { id: 1 } }));
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 1, username: 'ale' }, { playerId: 2, username: 'lis' },
            ]);
            scoreRepository.findAllByGameId.mockResolvedValue([{ playerId: 1, score: 40 }]);

            const result = await gameService.getScores({ gameId: 1, playerId: 1 });

            expect(result.value).toEqual({ scores: { ale: 40, lis: 0 } });
        });
    });

    describe('startGame', () => {
        test('deals cards and moves the game to in_progress', async () => {
            const activePlayers = [{ playerId: 1 }, { playerId: 2 }];
            gameRules.validateStartGame.mockResolvedValue(Result.Ok({ game: { id: 1 }, activePlayers }));
            unoCardBuilder.dealInitialCards.mockResolvedValue({ topCard: { color: 'red', value: '3' } });

            const result = await gameService.startGame(1, 1);

            expect(unoCardBuilder.dealInitialCards).toHaveBeenCalledWith({ gameId: 1, playerIds: [1, 2] });
            expect(gameRepository.update).toHaveBeenCalledWith(1, { state: 'in_progress', currentPlayerId: 1, direction: 1 });
            expect(result.value).toEqual({ message: 'Game started successfully' });
        });
    });

    describe('endGame', () => {
        test('finishes the game', async () => {
            gameRules.validateEndGame.mockResolvedValue(Result.Ok({ game: { id: 1 } }));
            const result = await gameService.endGame(1, 1);
            expect(gameRepository.update).toHaveBeenCalledWith(1, { state: 'finished' });
            expect(result.value).toEqual({ message: 'Game ended successfully' });
        });
    });

    describe('joinGame', () => {
        test('reactivates a player who previously left', async () => {
            gameRules.validateJoinGame.mockResolvedValue(Result.Ok({
                game: { id: 1 }, existingPlayer: { id: 5, hasLeft: true },
            }));
            const result = await gameService.joinGame({ gameId: 1, playerId: 1, username: 'ale' });
            expect(gamePlayerRepository.update).toHaveBeenCalledWith(5, { hasLeft: false });
            expect(result.value).toEqual({ message: 'User rejoined the game successfully' });
        });

        test('adds a new player at the end of the turn order', async () => {
            gameRules.validateJoinGame.mockResolvedValue(Result.Ok({ game: { id: 1 }, existingPlayer: null }));
            gamePlayerRepository.countActiveByGameId.mockResolvedValue(2);
            const result = await gameService.joinGame({ gameId: 1, playerId: 3, username: 'gus' });
            expect(gamePlayerRepository.create).toHaveBeenCalledWith({
                gameId: 1, playerId: 3, username: 'gus', turnOrder: 3, hasLeft: false,
            });
            expect(result.value).toEqual({ message: 'User joined the game successfully' });
        });
    });

    describe('leaveGame', () => {
        test('marks the player as having left', async () => {
            gameRules.validateLeaveGame.mockResolvedValue(Result.Ok({ game: { id: 1 }, gamePlayer: { id: 7 } }));
            const result = await gameService.leaveGame({ gameId: 1, playerId: 1 });
            expect(gamePlayerRepository.update).toHaveBeenCalledWith(7, { hasLeft: true });
            expect(result.value).toEqual({ message: 'User left the game successfully' });
        });
    });

    describe('playCard', () => {
        test('plays a standard card and advances the turn', async () => {
            gameRules.validatePlayCard.mockResolvedValue(Result.Ok({
                game: { id: 1, direction: 1 },
                playerCard: { id: 100 },
                targetCard: { color: 'red', value: '7' },
                topDiscard: { discardOrder: 3 },
                chosenColor: null,
            }));
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 1, username: 'ale' }, { playerId: 2, username: 'lis' },
            ]);
            unoGameRules.getNextPlayerIndex.mockReturnValue(1);
            cardRepository.countByGameAndPlayer.mockResolvedValue(3);

            const result = await gameService.playCard({ gameId: 1, playerId: 1, cardPlayedStr: 'Red 7' });

            expect(cardRepository.update).toHaveBeenCalledWith(100, { location: 'discard', discardOrder: 4 });
            expect(gameRepository.update).toHaveBeenCalledWith(1, { currentPlayerId: 2, direction: 1 });
            expect(result.value.nextPlayer).toBe('lis');
        });

        test('applies the draw penalty to the immediate next player, then skips to the one after', async () => {
            gameRules.validatePlayCard.mockResolvedValue(Result.Ok({
                game: { id: 1, direction: 1 },
                playerCard: { id: 1 },
                targetCard: { color: 'red', value: 'draw_two' },
                topDiscard: { discardOrder: 1 },
                chosenColor: null,
            }));
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 1, username: 'ale' }, { playerId: 2, username: 'lis' }, { playerId: 3, username: 'gus' },
            ]);
            unoGameRules.getDrawPenalty.mockReturnValue(2);
            unoGameRules.getNextPlayerIndex.mockReturnValueOnce(1).mockReturnValueOnce(2);
            cardRepository.countByGameAndPlayer.mockResolvedValue(5);

            const result = await gameService.playCard({ gameId: 1, playerId: 1, cardPlayedStr: 'Red Draw Two' });

            expect(unoCardBuilder.drawCards).toHaveBeenCalledWith({ gameId: 1, playerId: 2, count: 2 });
            expect(result.value.nextPlayer).toBe('gus');
        });

        test('awards points to the winner based on opponents’ remaining cards', async () => {
            gameRules.validatePlayCard.mockResolvedValue(Result.Ok({
                game: { id: 1, direction: 1 },
                playerCard: { id: 1 },
                targetCard: { color: 'red', value: '5' },
                topDiscard: { discardOrder: 1 },
                chosenColor: null,
            }));
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 1, username: 'ale' }, { playerId: 2, username: 'lis' },
            ]);
            unoGameRules.getNextPlayerIndex.mockReturnValue(1);
            cardRepository.countByGameAndPlayer.mockResolvedValue(0);
            cardRepository.findHandByGameAndPlayer.mockResolvedValue([{ value: '8' }, { value: 'draw_two' }]);
            unoDeck.getCardPoints.mockImplementation((v) => (v === '8' ? 8 : 20));
            scoreRepository.findByGameAndPlayer.mockResolvedValue(null);

            const result = await gameService.playCard({ gameId: 1, playerId: 1, cardPlayedStr: 'Red 5' });

            expect(scoreRepository.create).toHaveBeenCalledWith({ gameId: 1, playerId: 1, score: 28 });
            expect(result.value.message).toContain('You earned 28 points');
        });
    });

    describe('getTopCard', () => {
        test('formats and returns the top card', async () => {
            gameRules.validateGetTopCard.mockResolvedValue(Result.Ok({ game: { id: 1 }, topCard: { color: 'red', value: '7' } }));
            unoDeck.formatCard.mockReturnValue('Red 7');
            const result = await gameService.getTopCard(1);
            expect(result.value).toEqual({ game_id: 1, top_card: 'Red 7' });
        });
    });

    describe('drawCard', () => {
        test('draws a card and advances the turn', async () => {
            gameRules.validateDrawCard.mockResolvedValue(Result.Ok({ game: { id: 1, direction: 1 } }));
            unoCardBuilder.drawCards.mockResolvedValue([{ color: 'blue', value: '4' }]);
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 1, username: 'ale' }, { playerId: 2, username: 'lis' },
            ]);
            unoGameRules.getNextPlayerIndex.mockReturnValue(1);

            const result = await gameService.drawCard({ gameId: 1, playerId: 1 });

            expect(gameRepository.update).toHaveBeenCalledWith(1, { currentPlayerId: 2 });
            expect(result.value.cardDrawn).toBeDefined();
        });
    });

    describe('getPlayerHand', () => {
        test("returns the player's own hand formatted", async () => {
            gameRules.validateGetPlayerHand.mockResolvedValue(Result.Ok({ game: { id: 1 }, gamePlayer: { username: 'ale' } }));
            cardRepository.findHandByGameAndPlayer.mockResolvedValue([{ color: 'red', value: '3' }]);
            unoDeck.formatCard.mockReturnValue('Red 3');

            const result = await gameService.getPlayerHand({ gameId: 1, playerId: 1 });

            expect(result.value).toEqual({ player: 'ale', hand: ['Red 3'] });
        });
    });

    describe('getGameOverview', () => {
        test("hides opponents' cards, exposing only the count", async () => {
            gameRules.validateGetGameOverview.mockResolvedValue(Result.Ok({ game: { id: 1, currentPlayerId: 1 } }));
            gamePlayerRepository.findAllByGameId.mockResolvedValue([
                { playerId: 1, username: 'ale' }, { playerId: 2, username: 'lis' },
            ]);
            registryRepository.findByGameId.mockResolvedValue([]);
            cardRepository.findTopDiscardByGameId.mockResolvedValue({ color: 'red', value: '3' });
            cardRepository.findHandByGameAndPlayer.mockResolvedValue([{ color: 'red', value: '3' }]);
            cardRepository.countByGameAndPlayer.mockResolvedValue(4);
            gameOverviewBuilder.build.mockReturnValue({ currentPlayer: 'ale' });

            const result = await gameService.getGameOverview({ gameId: 1, playerId: 1 });

            expect(gameOverviewBuilder.build).toHaveBeenCalledWith(expect.objectContaining({
                handsByPlayerId: {
                    1: { count: 1, cards: [{ color: 'red', value: '3' }] },
                    2: { count: 4, cards: null },
                },
                viewerPlayerId: 1,
            }));
            expect(result.value).toEqual({ currentPlayer: 'ale' });
        });
    });

    describe('getGameRegistry', () => {
        test('builds the turn history without touching card data', async () => {
            gameRules.validateGetGameOverview.mockResolvedValue(Result.Ok({ game: { id: 1 } }));
            gamePlayerRepository.findAllByGameId.mockResolvedValue([{ playerId: 1, username: 'ale' }]);
            registryRepository.findByGameId.mockResolvedValue([{ playerId: 1, move: 'play_card' }]);
            turnRegistryBuilder.build.mockReturnValue({ history: [{ player: 'ale', action: 'Played Red 3' }] });

            const result = await gameService.getGameRegistry({ gameId: 1, playerId: 1 });

            expect(result.value).toEqual({ history: [{ player: 'ale', action: 'Played Red 3' }] });
        });
    });

    describe('sayUno', () => {
        test('marks sayOne=true and logs the move', async () => {
            gameRules.validateSayUno.mockResolvedValue(Result.Ok({ game: { id: 1 }, gamePlayer: { id: 55, username: 'ale' } }));
            const result = await gameService.sayUno({ gameId: 1, playerId: 1 });
            expect(gamePlayerRepository.update).toHaveBeenCalledWith(55, { sayOne: true });
            expect(result.value).toEqual({ message: 'ale said UNO successfully.' });
        });
    });

    describe('challengeUno', () => {
        test('penalizes the challenged player and resets sayOne', async () => {
            gameRules.validateChallengeUno.mockResolvedValue(Result.Ok({
                game: { id: 1, currentPlayerId: 2 },
                challengedPlayer: { id: 9, playerId: 2, username: 'lis' },
            }));
            gamePlayerRepository.findByGameAndPlayer.mockResolvedValue({ username: 'lis' });

            const result = await gameService.challengeUno({ gameId: 1, playerId: 1, challengedUsername: 'lis' });

            expect(unoCardBuilder.drawCards).toHaveBeenCalledWith({ gameId: 1, playerId: 2, count: 2 });
            expect(gamePlayerRepository.update).toHaveBeenCalledWith(9, { sayOne: false });
            expect(result.value.message).toContain('Challenge successful');
        });
    });
});
