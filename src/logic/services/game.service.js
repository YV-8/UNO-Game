import GameRepository from '../../dataAccess/repositories/game.repository.js';
import GamePlayerRepository from '../../dataAccess/repositories/gamePlayer.repository.js';
import Result from '../monads/result.js';
import * as gameRules from '../validators/gameRules.js';

// const VALID_STATUSES = ['waiting', 'in_progress', 'finished'];
// const CARDS_PER_PLAYER = 7;

export const getAllGame = async () => {
    const games = await GameRepository.findAll();
    return Result.Ok(games);
};

export const getGameById = async (id) => {
    if (!id) return Result.Err({
        statusCode: 400, message: 'ID is required'
    });
    const game = await GameRepository.findById(id);
    if (!game) return Result.Err({
        statusCode: 404,
        message: 'game not found'
    });
    return Result.Ok(game);
};

export const createGame = async ({ name, rules, playerId }) => {
    const result = await gameRules.validateCreateGame({ name, rules, playerId });
    if (result.isErr()) return result;

    const game = await GameRepository.create({
        name,
        rules,
        creatorId: playerId,
        state: 'waiting',
    });
    return Result.Ok(game);
};

export const updateGame = async (gameId, data, playerId) => {
    const result = await gameRules.validateUpdateGame({ gameId, ...data, playerId });
    if (result.isErr()) return result;

    const { game, name, rules, state } = result.value;
    const updatedGame = await GameRepository.update(game.id, {
        name: name ?? game.name,
        rules: rules ?? game.rules,
        state: state ?? game.state,
    });
    return Result.Ok(updatedGame);
};

export const deleteGame = async (id) => {
    if (!id) return Result.Err({ statusCode: 400, message: 'ID is required' });
    const deleted = await GameRepository.delete(id);
    if (!deleted) return Result.Err({ statusCode: 404, message: 'Game not found' });
    return Result.Ok({});
};

export const getGameState = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) return Result.Err({ statusCode: 400, message: 'ID is required' });

    const game = await GameRepository.findById(id);
    if (!game) return Result.Err({ statusCode: 404, message: 'Game not found' });
    return Result.Ok({ game_id: game.id, state: game.state });
};

//list gameplayers
export const getGamePlayers = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) return Result.Err({ statusCode: 400, message: 'ID is required' });
    const game = await GameRepository.findById(numGameId);
    if (!game) return Result.Err({ statusCode: 404, message: 'Game not found' });
    const gamePlayers = await GamePlayerRepository.findAllByGameId(numGameId);
    return Result.Ok({ game_id: game.id, players: gamePlayers.map((gp) => gp.username) });
};

export const getCurrentPlayer = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) return Result.Err({ statusCode: 400, message: 'ID is required' });

    const game = await GameRepository.findByIdWithCurrentPlayer(numGameId);

    if (!game) return Result.Err({ statusCode: 404, message: 'Game not found' });
    if (!game.currentPlayer) {
        return Result.Err({ statusCode: 400, message: 'This game does not have a current player yet' });
    }
    return Result.Ok({ game_id: game.id, current_player: game.currentPlayer.username });
};

export const getGameScores = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) return Result.Err({ statusCode: 400, message: 'ID is required' });
    const game = await GameRepository.findById(numGameId);

    if (!game) return Result.Err({ statusCode: 404, message: 'Game not found' });
    const gamePlayers = await GamePlayerRepository.findAllByGameId(numGameId);
    const scores = {};
    gamePlayers.forEach((gp) => { scores[gp.username] = gp.score; });
    return Result.Ok({ game_id: game.id, scores });
};

export const startGame = async (gameId, playerId) => {
    const result = await gameRules.validateStartGame({ gameId, playerId });
    if (result.isErr()) return result;

    const { game, activePlayers } = result.value;
    const firstPlayer = activePlayers[0];

    await GameRepository.update(game.id, {
        state: 'in_progress',
        currentPlayerId: firstPlayer.playerId,
    });

    return result.map(() => ({ message: 'Game started successfully' }));
};

export const endGame = async (gameId, playerId) => {
    const result = await gameRules.validateEndGame({ gameId, playerId });
    if (result.isErr()) return result;

    const { game } = result.value;
    await GameRepository.update(game.id, { state: 'finished' });

    return result.map(() => ({ message: 'Game ended successfully' }));
};

/**Join Game user
* first verificate gameId exists and requirements
* then verificate has gameid and playerid for user stay in this game
*now initialice in waiting and activecount  depends the maxPlayers
*/
//usar el middleware en decoded
export const joinGame = async ({ gameId, playerId, username }) => {
    const result = await gameRules.validateJoinGame({ gameId, playerId });
    if (result.isErr()) return result;

    const { game, existingPlayer } = result.value;

    if (existingPlayer && existingPlayer.hasLeft) {
        await GamePlayerRepository.update(existingPlayer.id, { hasLeft: false });
        return result.map(() => ({ message: 'User rejoined the game successfully' }));
    }

    const activeCount = await GamePlayerRepository.countActiveByGameId(game.id);
    await GamePlayerRepository.create({
        gameId: game.id,
        playerId,
        username,
        turnOrder: activeCount + 1,
        hasLeft: false,
    });

    return result.map(() => ({ message: 'User joined the game successfully' }));
};

/**
 *leave Game need gameId and playerId,
 *where search gameId and the gameidandplayerid
 *Depends the gameplayer.hasleft the player is not active
 * @returns we use update to change hasleft from true to false
 */
export const leaveGame = async ({ gameId, playerId }) => {
    const result = await gameRules.validateLeaveGame({ gameId, playerId });
    if (result.isErr()) return result;

    const { gamePlayer } = result.value;
    await GamePlayerRepository.update(gamePlayer.id, { hasLeft: true });

    return result.map(() => ({ message: 'User left the game successfully' }));
};

