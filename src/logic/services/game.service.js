import { socketEmitter } from '../../utils/socketEmitter.js';
const VALID_COLORS = ['red', 'blue', 'yellow', 'green'];
export const gameService = ({ gameRepository, cardRepository, registryRepository, gameRules, gamePlayerRepository, scoreRepository, unoCardBuilder, unoDeck, unoGameRules, parseCardString, gameOverviewBuilder, turnResolver, turnRegistryBuilder, respond }) => {
    const getAllGame = async () => {
        const games = await gameRepository.findAll();
        return respond.Ok(games);
    };

    const getGameById = async (id) => {
        if (!id) return respond.Err({
            statusCode: 400, message: 'ID is required'
        });
        const game = await gameRepository.findById(id);
        if (!game) return respond.Err({
            statusCode: 404,
            message: 'game not found'
        });
        return respond.Ok(game);
    };

    const createGame = async ({ name, rules, playerId, username }) => {
        const validation = await gameRules.validateCreateGame({ name, rules, playerId });
        if (validation.isErr()) return validation;

        const game = await gameRepository.create({
            name,
            rules,
            creatorId: playerId,
            state: 'waiting',
        });

        await gamePlayerRepository.create({
            gameId: game.id,
            playerId,
            username,
            turnOrder: 1,
            hasLeft: false,
        });
        return respond.Ok({ message: 'Game created successfully', game_id: game.id });
    };

    const updateGame = async (gameId, data, playerId) => {
        const validation = await gameRules.validateUpdateGame({ gameId, ...data, playerId });
        if (validation.isErr()) return validation;

        const { game, name, rules, state } = validation.value;
        const updatedGame = await gameRepository.update(game.id, {
            name: name ?? game.name,
            rules: rules ?? game.rules,
            state: state ?? game.state,
        });
        return respond.Ok({ message: 'Game updated successfully', game_id: game.id });
    };

    const deleteGame = async (id) => {
        if (!id) return respond.Err({ statusCode: 400, message: 'ID is required' });
        const deleted = await gameRepository.delete(id);
        if (!deleted) return respond.Err({ statusCode: 404, message: 'Game not found' });
        return respond.Ok({ message: 'Game delete successfully' });
    };

    const getGameState = async (id) => {
        const numGameId = Number(id);
        if (!numGameId) return respond.Err({ statusCode: 400, message: 'ID is required' });

        const game = await gameRepository.findById(id);
        if (!game) return respond.Err({ statusCode: 404, message: 'Game not found' });
        return respond.Ok({ game_id: game.id, state: game.state });
    };

    //list gameplayers
    const getGamePlayers = async (id) => {
        const numGameId = Number(id);
        if (!numGameId) return respond.Err({ statusCode: 400, message: 'ID is required' });
        const game = await gameRepository.findById(numGameId);
        if (!game) return respond.Err({ statusCode: 404, message: 'Game not found' });
        const gamePlayers = await gamePlayerRepository.findAllPlayersIncludingLeftByGameId(numGameId);
        return respond.Ok({ 
            game_id: game.id, 
            playerCount: gamePlayers.length,
            players: gamePlayers.map((gp) => ({ username: gp.username, hasLeft: gp.hasLeft })) 
        });
    };

    const getCurrentPlayer = async (id) => {
        const numGameId = Number(id);
        if (!numGameId) return respond.Err({ statusCode: 400, message: 'ID is required' });

        const game = await gameRepository.findByIdWithCurrentPlayer(numGameId);

        if (!game) return respond.Err({ statusCode: 404, message: 'Game not found' });
        if (!game.currentPlayer) {
            return respond.Err({ statusCode: 400, message: 'This game does not have a current player yet' });
        }
        return respond.Ok({ game_id: game.id, current_player: game.currentPlayer.username });
    };

    const getScores = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateGetGameScores({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { game } = validation.value;
        const [activePlayers, scoreRows] = await Promise.all([
            gamePlayerRepository.findAllByGameId(game.id),
            scoreRepository.findAllByGameId(game.id),
        ]);

        const scoreByPlayerId = Object.fromEntries(scoreRows.map((row) => [row.playerId, row.score]));
        const scores = Object.fromEntries(
            activePlayers.map((p) => [p.username, scoreByPlayerId[p.playerId] ?? 0])
        );

        return respond.Ok({ scores });
    };

    const startGame = async (gameId, playerId) => {
        const validation = await gameRules.validateStartGame({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { game, activePlayers } = validation.value;
        const playerIds = activePlayers.map((p) => p.playerId);

        const { topCard } = await unoCardBuilder.dealInitialCards({ gameId: game.id, playerIds });

        const firstPlayer = activePlayers[0];
        await gameRepository.update(game.id, {
            state: 'in_progress',
            currentPlayerId: firstPlayer.playerId,
            direction: 1,
        });

        return respond.Ok({
            message: 'Game started successfully',
        });
    };

    const endGame = async (gameId, playerId) => {
        const validation = await gameRules.validateEndGame({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { game } = validation.value;
        await gameRepository.update(game.id, { state: 'finished' });

        return validation.map(() => ({ message: 'Game ended successfully' }));
    };

    /**Join Game user
    * first verificate gameId exists and requirements
    * then verificate has gameid and playerid for user stay in this game
    *now initialice in waiting and activecount  depends the maxPlayers
    */
    //usar el middleware en decoded
    const joinGame = async ({ gameId, playerId, username }) => {
        const validation = await gameRules.validateJoinGame({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { game, existingPlayer } = validation.value;

        if (existingPlayer && !existingPlayer.hasLeft) {
            return validation.map(() => ({ message: 'User is already in the game' }));
        }

        if (existingPlayer && existingPlayer.hasLeft) {
            await gamePlayerRepository.update(existingPlayer.id, { hasLeft: false });
            return validation.map(() => ({ message: 'User rejoined the game successfully' }));
        }

        const activeCount = await gamePlayerRepository.countActiveByGameId(game.id);
        await gamePlayerRepository.create({
            gameId: game.id,
            playerId,
            username,
            turnOrder: activeCount + 1,
            hasLeft: false,
        });

        return validation.map(() => ({ message: 'User joined the game successfully' }));
    };

    /**
     *leave Game need gameId and playerId,
     *where search gameId and the gameidandplayerid
     *Depends the gameplayer.hasleft the player is not active
     * @returns we use update to change hasleft from true to false
     */
    const leaveGame = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateLeaveGame({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { gamePlayer } = validation.value;
        await gamePlayerRepository.update(gamePlayer.id, { hasLeft: true });

        return validation.map(() => ({ message: 'User left the game successfully' }));
    };
    /** CardWild -> color -> null then topDoscard exist 1 else 0
     * update card's location
     * review activePlayer, currentIndex, and total players
     * direction card reverse, drwaPenalty, skipTurn
    */
    const playCard = async ({ gameId, playerId, cardPlayedStr, chosenColor = null, bodyUsername }) => {
        const validation = await gameRules.validatePlayCard({ gameId, playerId, cardPlayedStr, chosenColor, bodyUsername });
        if (validation.isErr()) return validation;

        const { game, playerCard, targetCard, topDiscard, chosenColor: validColor } = validation.value;
        const isWild = targetCard.color === null;
        const nextDiscardOrder = (topDiscard?.discardOrder || 0) + 1;

        await cardRepository.update(playerCard.id, {
            location: 'discard',
            discardOrder: nextDiscardOrder,
            ...(isWild ? { color: validColor } : {}),
        });
        const activePlayers = await gamePlayerRepository.findAllByGameId(game.id);
        const currentIndex = activePlayers.findIndex((p) => p.playerId === playerId);
        const totalPlayers = activePlayers.length;

        let newDirection = game.direction;
        const isReverse = unoGameRules.isReverseCard(targetCard);
        if (isReverse) { newDirection *= -1; }

        const drawPenalty = unoGameRules.getDrawPenalty(targetCard);
        const isSkip = unoGameRules.isSkipCard(targetCard) || drawPenalty > 0;
        const skipTurn = isSkip || drawPenalty > 0 || (isReverse && totalPlayers === 2);

        // the next person draw has card penalty
        if (drawPenalty > 0) {
            const penalizedIndex = unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, newDirection, false);
            const penalizedPlayerId = activePlayers[penalizedIndex].playerId;
            await unoCardBuilder.drawCards({ gameId: game.id, playerId: penalizedPlayerId, count: drawPenalty });
        }

        // Spick the person
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, newDirection, skipTurn);
        const nextPlayerId = activePlayers[nextIndex].playerId;

        const remainingCards = await cardRepository.countByGameAndPlayer(game.id, playerId, 'hand');
        const updateData = { currentPlayerId: nextPlayerId, direction: newDirection };
        if (remainingCards === 0) { updateData.state = 'finished' };
        await gameRepository.update(game.id, updateData);

        let pointsEarned = 0;
        if (remainingCards === 0) {
            pointsEarned = await awardWinnerScore({ gameId: game.id, winnerPlayerId: playerId, activePlayers });
        }
        await registryRepository.create({
            gameId: game.id,
            playerId,
            move: 'play_card',
            details: { card: unoDeck.formatCard(targetCard), chosenColor: validColor },
        });

        socketEmitter.emitToGame(game.id, 'gameStateUpdated');

        return respond.Ok({
            message: remainingCards === 0
                ? `You played your last card! You win! You earned ${pointsEarned} points`
                : 'Card played successfully',
            nextPlayer: activePlayers.find((p) => p.playerId === nextPlayerId)?.username,
        });
    };

    /**Obtiene la carta superior del descarte.
     * Si no existe, la crea dinámicamente en ese instante.*/
    const getTopCard = async (id) => {
        const validation = await gameRules.validateGetTopCard({ gameId: id });
        if (validation.isErr()) return validation;

        const { game, topCard } = validation.value;
        return respond.Ok({ game_id: game.id, top_card: unoDeck.formatCard(topCard) });
    };

    const drawCard = async ({ gameId, playerId, bodyUsername }) => {
        const validation = await gameRules.validateDrawCard({ gameId, playerId, bodyUsername });
        if (validation.isErr()) return validation;

        const { game } = validation.value;
        const [drawnCard] = await unoCardBuilder.drawCards({ gameId: game.id, playerId, count: 1 });

        const activePlayers = await gamePlayerRepository.findAllByGameId(game.id);
        const currentIndex = activePlayers.findIndex((p) => p.playerId === playerId);
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, activePlayers.length, game.direction, false);
        const nextPlayerId = activePlayers[nextIndex].playerId;

        await gameRepository.update(game.id, { currentPlayerId: nextPlayerId });
        await registryRepository.create({
            gameId: game.id,
            playerId,
            move: 'draw_card',
            details: { card: unoDeck.formatCard(drawnCard) },
        });

        socketEmitter.emitToGame(game.id, 'gameStateUpdated');

        return respond.Ok({
            message: `${activePlayers[currentIndex].username} drew a card from the deck.`,
            cardDrawn: unoDeck.formatCard(drawnCard),
        });
    };

    const getPlayerHand = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateGetPlayerHand({ gameId, playerId });
        if (validation.isErr()) return validation;
        const { game, gamePlayer } = validation.value;
        const hand = await cardRepository.findHandByGameAndPlayer(game.id, playerId);

        return respond.Ok({
            player: gamePlayer.username,
            hand: hand.map(unoDeck.formatCard),
        });
    };

    const fetchRegistryContext = async (gameId) => {
        const [activePlayers, moves] = await Promise.all([
            gamePlayerRepository.findAllByGameId(gameId),
            registryRepository.findByGameId(gameId),
        ]);
        return { activePlayers, moves };
    };

    /** use the promise all because finAllByGameId, finTop Discard By Id and findGaeById
     * they're separates, so await block then promise responde
     */
    const getGameOverview = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateGetGameOverview({ gameId, playerId });
        if (validation.isErr()) return validation;
        const { game } = validation.value;

        const [{ activePlayers, moves }, topDiscard] = await Promise.all([
            fetchRegistryContext(game.id),
            cardRepository.findTopDiscardByGameId(game.id),
        ]);

        const handsEntries = await Promise.all(
            activePlayers.map(async (p) => {
                if (p.playerId === playerId) {
                    const cards = await cardRepository.findHandByGameAndPlayer(game.id, p.playerId);
                    return [p.playerId, { count: cards.length, cards }];
                }
                const count = await cardRepository.countByGameAndPlayer(game.id, p.playerId, 'hand');
                return [p.playerId, { count, cards: null }];
            })
        );
        const handsByPlayerId = Object.fromEntries(handsEntries);

        return respond.Ok(
            gameOverviewBuilder.build({
                game,
                activePlayers,
                topDiscard,
                handsByPlayerId,
                moves,
                viewerPlayerId: playerId,
            })
        );
    };

    const getGameRegistry = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateGetGameOverview({ gameId, playerId });
        if (validation.isErr()) return validation;
        const { game } = validation.value;

        const { activePlayers, moves } = await fetchRegistryContext(game.id);
        return respond.Ok(turnRegistryBuilder.build({ moves, activePlayers }));
    };

    const sayUno = async ({ gameId, playerId, bodyUsername }) => {
        const validation = await gameRules.validateSayUno({ gameId, playerId, bodyUsername });
        if (validation.isErr()) return validation;

        const { game, gamePlayer } = validation.value;
        await gamePlayerRepository.update(gamePlayer.id, { hasSaidUno: true });

        await registryRepository.create({ gameId: game.id, playerId, move: 'say_uno' });

        socketEmitter.emitToGame(game.id, 'gameStateUpdated');

        return respond.Ok({ message: `${gamePlayer.username} said UNO successfully.` });
    };

    const challengeUno = async ({ gameId, playerId, challengedUsername, bodyUsername }) => {
        const validation = await gameRules.validateChallengeUno({ gameId, playerId, challengedUsername, bodyUsername });
        if (validation.isErr()) return validation;

        const { game, challengedPlayer } = validation.value;

        await unoCardBuilder.drawCards({ gameId: game.id, playerId: challengedPlayer.playerId, count: 2 });
        await gamePlayerRepository.update(challengedPlayer.id, { hasSaidUno: false });

        await registryRepository.create({
            gameId: game.id,
            playerId,
            move: 'challenge_uno',
            details: { challenged: challengedPlayer.username, result: 'success' },
        });

        const currentPlayerRow = await gamePlayerRepository.findByGameAndPlayer(game.id, game.currentPlayerId);

        socketEmitter.emitToGame(game.id, 'gameStateUpdated');

        return respond.Ok({
            message: `Challenge successful. ${challengedPlayer.username} forgot to say UNO and draws 2 cards.`,
            nextPlayer: currentPlayerRow?.username ?? null,
        });
    };

    const awardWinnerScore = async ({ gameId, winnerPlayerId, activePlayers }) => {
        const opponentIds = activePlayers
            .filter((p) => p.playerId !== winnerPlayerId)
            .map((p) => p.playerId);

        const opponentHands = await Promise.all(
            opponentIds.map((pid) => cardRepository.findHandByGameAndPlayer(gameId, pid))
        );

        const pointsEarned = opponentHands
            .flat()
            .reduce((total, card) => total + unoDeck.getCardPoints(card.value), 0);

        const existingScore = await scoreRepository.findByGameAndPlayer(gameId, winnerPlayerId);
        if (existingScore) {
            await scoreRepository.update(existingScore.id, { score: existingScore.score + pointsEarned });
        } else {
            await scoreRepository.create({ gameId, playerId: winnerPlayerId, score: pointsEarned });
        }

        return pointsEarned;
    };

    return {
        getAllGame, getGameById, createGame, updateGame, deleteGame, getGameState, getGamePlayers, getCurrentPlayer,
        startGame, endGame, joinGame, leaveGame, getTopCard, playCard, getPlayerHand, drawCard, getGameOverview, getGameRegistry, sayUno, challengeUno, getScores
    };
};
