export const gameService = ({ gameRepository, cardRepository,registryRepository, gameRules, gamePlayerRepository, unoCardBuilder, unoDeck, unoGameRules, parseCardString, respond }) => {
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
        const gamePlayers = await gamePlayerRepository.findAllByGameId(numGameId);
        return respond.Ok({ game_id: game.id, players: gamePlayers.map((gp) => gp.username) });
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

    const getGameScores = async (id) => {
        const numGameId = Number(id);
        if (!numGameId) return respond.Err({ statusCode: 400, message: 'ID is required' });
        const game = await gameRepository.findById(numGameId);

        if (!game) return respond.Err({ statusCode: 404, message: 'Game not found' });
        const gamePlayers = await gamePlayerRepository.findAllByGameId(numGameId);
        const scores = {};
        gamePlayers.forEach((gp) => { scores[gp.username] = gp.score; });
        return respond.Ok({ game_id: game.id, scores });
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
            top_card: unoDeck.formatCard(topCard),
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

    const playCard = async ({ gameId, playerId, cardPlayedStr, chosenColor = null }) => {
        const validation = await gameRules.validatePlayCard({ gameId, playerId, cardPlayedStr, chosenColor });
        if (validation.isErr()) return validation;

        const { game, playerCard, targetCard, topDiscard } = validation.value;
        const isWild = targetCard.color === null;
        const nextDiscardOrder = (topDiscard?.discardOrder || 0) + 1;

        // Si es wild, el color elegido queda como el color "real" de la carta
        // en la mesa -> así el próximo canPlayCard compara contra un color válido,
        // sin tener que tratar el wild como caso especial en ningún otro lado.
        await cardRepository.update(playerCard.id, {
            location: 'discard',
            discardOrder: nextDiscardOrder,
            ...(isWild ? { color: chosenColor } : {}),
        });

        const activePlayers = await gamePlayerRepository.findAllByGameId(game.id);
        const currentIndex = activePlayers.findIndex((p) => p.playerId === playerId);
        const totalPlayers = activePlayers.length;

        let newDirection = game.direction;
        if (unoGameRules.isReverseCard(targetCard)) newDirection *= -1;

        const drawPenalty = unoGameRules.getDrawPenalty(targetCard); // 0, 2 (draw_two) o 4 (wild_draw_four)
        const skipTurn = unoGameRules.isSkipCard(targetCard) || drawPenalty > 0;

        // Quien está inmediatamente después en el orden (sin saltar) es quien
        // roba las cartas de la penalización, si corresponde.
        if (drawPenalty > 0) {
            const penalizedIndex = unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, newDirection, false);
            const penalizedPlayerId = activePlayers[penalizedIndex].playerId;
            await unoCardBuilder.drawCards({ gameId: game.id, playerId: penalizedPlayerId, count: drawPenalty });
        }

        // Quien realmente juega a continuación: salta al penalizado/skipeado si aplica.
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, newDirection, skipTurn);
        const nextPlayerId = activePlayers[nextIndex].playerId;

        const remainingCards = await cardRepository.countByGameAndPlayer(gameId, playerId, 'hand');
        const updateData = { currentPlayerId: nextPlayerId, direction: newDirection };
        if (remainingCards === 0) updateData.state = 'finished';
        await gameRepository.update(game.id, updateData);

        await gameRepository.update(game.id, updateData);

        await registryRepository.create({
            gameId: game.id,
            playerId,
            move: 'play_card',
            details: { card: unoDeck.formatCard(targetCard), chosenColor },
        });
        return respond.Ok({
            message: remainingCards === 0 ? 'You played your last card! You win!' : 'Card played successfully.',
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

    const drawCard = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateDrawCard({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { game } = validation.value;
        const [drawnCard] = await unoCardBuilder.drawCards({ gameId: game.id, playerId, count: 1 });

        const activePlayers = await gamePlayerRepository.findAllByGameId(game.id);
        const currentIndex = activePlayers.findIndex((p) => p.playerId === playerId);
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, activePlayers.length, game.direction, false);
        const nextPlayerId = activePlayers[nextIndex].playerId;

        await gameRepository.update(game.id, { currentPlayerId: nextPlayerId });

        await gameRepository.update(game.id, updateData);

        await registryRepository.create({
            gameId: game.id,
            playerId,
            move: 'play_card',
            details: { card: unoDeck.formatCard(targetCard), chosenColor },
        });
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

        await gameRepository.update(game.id, { currentPlayerId: nextPlayerId });
        return respond.Ok({
            player: gamePlayer.username,
            hand: hand.map(unoDeck.formatCard),
        });
    };

    const formatRegistryAction = (entry) => {
        if (entry.move === 'play_card') return `Played ${entry.details?.card}`;
        if (entry.move === 'draw_card') return 'Drew a card';
        return entry.move;
    };

    const getGameOverview = async ({ gameId, playerId }) => {
        const validation = await gameRules.validateGetGameOverview({ gameId, playerId });
        if (validation.isErr()) return validation;

        const { game } = validation.value;

        const [activePlayers, topDiscard, moves] = await Promise.all([
            gamePlayerRepository.findAllByGameId(game.id),
            cardRepository.findTopDiscardByGameId(game.id),
            registryRepository.findByGameId(game.id),
        ]);

        const usernameByPlayerId = Object.fromEntries(activePlayers.map((p) => [p.playerId, p.username]));

        const hands = {};
        await Promise.all(
            activePlayers.map(async (player) => {
                const hand = await cardRepository.findHandByGameAndPlayer(game.id, player.playerId);
                hands[player.username] = hand.map(unoDeck.formatCard);
            })
        );

        const currentPlayer = activePlayers.find((p) => p.playerId === game.currentPlayerId);

        return respond.Ok({
            currentPlayer: currentPlayer?.username ?? null,
            topCard: topDiscard ? unoDeck.formatCard(topDiscard) : null,
            hands,
            turnHistory: moves.map((entry) => ({
                player: usernameByPlayerId[entry.playerId] ?? `Player ${entry.playerId}`,
                action: formatRegistryAction(entry),
            })),
        });
    };

    // /**
    //    * Crea las 108 cartas, reparte 7 a cada jugador (recursivo, round-robin)
    //    * y deja la siguiente carta no-wild como carta de mesa. Se llama desde
    //    * el controller justo después de que gameService.startGame pase el
    //    * juego a 'in_progress'.
    //    */
    // const dealInitialCards = async ({ gameId, playerIds, cardRepository, resgistryRepository }) => {
    //     const validation = await cardRules.validateDealInitialCards({ gameId });
    //     if (validation.isErr()) return validation;
    //     const { gameId: numGameId } = validation.value;

    //     const deck = unoDeck.shuffleDeck(buildDeck());
    //     const { hands, remainingDeck } = dealCards(deck, playerIds, 7);
    //     const { tableCard, remainingDeck: deckAfterTable } = drawInitialTableCard(remainingDeck);

    //     const handRows = playerIds.flatMap((playerId) =>
    //         hands[playerId].map((card) => ({
    //             color: card.color, value: card.value, gameId: numGameId, playerId, location: 'hand',
    //         }))
    //     );
    //     const deckRows = deckAfterTable.map((card, index) => ({
    //         color: card.color, value: card.value, gameId: numGameId, location: 'deck', deckOrder: index,
    //     }));
    //     const discardRow = {
    //         color: tableCard.color, value: tableCard.value, gameId: numGameId, location: 'discard', discardOrder: 1,
    //     };

    //     await cardRepository.bulkCreate([...handRows, ...deckRows, discardRow]);
    //     await registryRepository.create({
    //         move: 'deal_initial_cards',
    //         gameId: numGameId,
    //         playerId: playerIds[0],
    //         details: { cardsPerPlayer: 7, topCard: formatCard(tableCard) },
    //     });

    //     return respond.Ok({
    //         message: 'Cards dealt successfully.',
    //         players: Object.fromEntries(Object.entries(hands).map(([id, cards]) => [id, cards.map(formatCard)])),
    //         topCard: formatCard(tableCard),
    //     });
    // };

    // /**
    //  * Roba `count` cartas. Si el mazo no alcanza, rearma el mazo desde
    //  * el descarte (menos la carta tope) y reescribe esas filas en BD.
    //  */
    // const drawFromDeck = async (gameId, count) => {
    //     let deck = await cardRepository.findDeckByGameId(gameId);

    //     if (deck.length < count) {
    //         const discardPile = await cardRepository.findDiscardByGameId(gameId);
    //         const [, ...restOfDiscard] = discardPile;
    //         const reshuffled = shuffleDeck(restOfDiscard);

    //         await cardRepository.bulkUpdate(
    //             reshuffled.map((card, index) => ({
    //                 id: card.id,
    //                 data: { location: 'deck', discardOrder: null, deckOrder: deck.length + index },
    //             }))
    //         );
    //         deck = [...deck, ...reshuffled];
    //     }
    //     return deck.slice(0, count);
    // };
    return {
        getAllGame, getGameById, createGame, updateGame, deleteGame, getGameState, getGamePlayers, getCurrentPlayer, getGameScores,
        startGame, endGame, joinGame, leaveGame, getTopCard, playCard, getPlayerHand, drawCard, getGameOverview
    };
};



