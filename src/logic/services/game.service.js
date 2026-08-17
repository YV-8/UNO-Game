export const gameService = ({ gameRepository, gameRules, gamePlayerRepository, respond }) => {
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
        const firstPlayer = activePlayers[0];

        await gameRepository.update(game.id, {
            state: 'in_progress',
            currentPlayerId: firstPlayer.playerId,
        });

        return validation.map(() => ({ message: 'Game started successfully' }));
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
    return { getAllGame, getGameById, createGame, updateGame, deleteGame, getGameState, getGamePlayers, getCurrentPlayer, getGameScores, startGame, endGame, joinGame, leaveGame };
};



