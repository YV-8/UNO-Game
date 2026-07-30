import GameRepository from '../../dataAccess/repositories/game.repository.js';
import GamePlayerRepository from '../../dataAccess/repositories/gamePlayer.repository.js';
import CardRepository from '../../dataAccess/repositories/cards.repository.js';
import { appError } from '../../middlewares/appError.js';
import { verifyAccessToken } from '../../helpers/verifyToken.js';

const VALID_STATUSES = ['waiting', 'in_progress', 'finished'];
const CARDS_PER_PLAYER = 7;

export const getAllGame = async () => {
    return await GameRepository.findAll();
};

export const getGameById = async (id) => {
    if (!id) {
        throw new appError('ID is required', 400);
    }
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new appError('game not found', 404);
    }
    return game;
};

export const createGame = async ({ name, rules, accessToken }) => {

    const decoded = verifyAccessToken(accessToken);
    const existing = await GameRepository.findByName(name);
    if (existing) {
        throw new appError('Name is already registered.', 400);
    }
    if (!name) {
        throw new appError('name is required', 400);
    }
    //name, rules, state: 'waiting'
    return await GameRepository.create({
        name, rules, creatorId: decoded.id,
        state: 'waiting',
    });
};

export const updateGame = async (id, data, accessToken) => {
    verifyAccessToken(accessToken);
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new appError('Game not found', 404);
    }
    const { name, rules, state, maxPlayers } = data;

    if (state !== undefined && !VALID_STATUSES.includes(state)) {
        throw new appError(`state must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const updatedData = {
        name: name ?? game.name,
        rules: rules ?? game.rules,
        state: state ?? game.state,
    };
    return await GameRepository.update(id, updatedData);
};

export const deleteGame = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const deleted = await GameRepository.delete(id);
    if (!deleted) throw new appError('Game not found', 404);
    return {};
};

export const getGameState = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) throw new appError('ID is required', 400);

    if (isNaN(numGameId)) throw new appError('Invalid ID format', 400);
    const game = await GameRepository.findById(id);
    if (!game) throw new appError('Game not found', 404);

    return { game_id: game.id, state: game.state };
};

//list gameplayers
export const getGamePlayers = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) throw new appError('ID is required', 400);

    const game = await GameRepository.findById(numGameId);
    if (!game) throw new appError('Game not found', 404);

    const gamePlayers = await GamePlayerRepository.findAllByGameId(numGameId);
    const players = gamePlayers.map((gamePlayer) => gamePlayer.username);

    return { game_id: game.id, players };
};

export const getCurrentPlayer = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) throw new appError('ID is required', 400);

    const game = await GameRepository.findByIdWithCurrentPlayer(numGameId);
    if (!game) throw new appError('Game not found', 404);

    if (!game.currentPlayer) {
        throw new appError('This game does not have a current player yet', 400);
    }

    return { game_id: game.id, current_player: game.currentPlayer.username };
};

export const getGameScores = async (id) => {
    const numGameId = Number(id);
    if (!numGameId) throw new appError('ID is required', 400);

    const game = await GameRepository.findById(numGameId);
    if (!game) throw new appError('Game not found', 404);

    const gamePlayers = await GamePlayerRepository.findAllByGameId(numGameId);
    const scores = {};
    gamePlayers.forEach((gamePlayer) => {
        scores[gamePlayer.username] = gamePlayer.score;
    });
    //scores -> toma el usr-> puntaje add
    return { game_id: game.id, scores };
};

export const startGame = async (gameId, accessToken) => {
    const numGameId = Number(gameId);
    if (!numGameId) throw new appError('ID is required', 400);

    const decoded = verifyAccessToken(accessToken);
    const game = await GameRepository.findById(numGameId);
    if (!game) throw new appError('Game not found', 404);

    if (game.creatorId !== decoded.id) {
        throw new appError('Only the creator of the game can start it', 403);
    }

    if (game.state !== 'waiting') {
        throw new appError('This game cannot be started from its current state', 400);
    }

    const activePlayers = await GamePlayerRepository.findAllByGameId(numGameId);

    if (!activePlayers || activePlayers.length < 2) {
        throw new appError('Minium 2 Players must have joined to start the game', 400);
    }

    const firstPlayer = activePlayers[0];

    await GameRepository.update(numGameId, {
        state: 'in_progress',
        currentPlayerId: firstPlayer.playerId,
    });

    return {};
};

export const endGame = async (gameId, accessToken) => {
    const numGameId = Number(gameId);
    if (!numGameId) { throw new appError('ID is required', 400); }
    const decoded = verifyAccessToken(accessToken);

    const game = await GameRepository.findById(numGameId);
    if (!game) { throw new appError('Game not found', 404); }

    if (game.creatorId !== decoded.id) {
        throw new appError('Only the creator of the game can end it', 403);
    }

    if (game.state !== 'in_progress') {
        throw new appError('This game is not in progress', 400);
    }

    await GameRepository.update(numGameId, { state: 'finished' });
    return {};
};

/**Join Game user
* first verificate gameId exists and requirements
* then verificate has gameid and playerid for user stay in this game
*now initialice in waiting and activecount  depends the maxPlayers
*/
export const joinGame = async ({ gameId, accessToken }) => {
    const numGameId = Number(gameId);
    if (!numGameId) { throw new appError('game_id is required', 400); }
    const decoded = verifyAccessToken(accessToken);
    const game = await GameRepository.findById(numGameId);

    if (!game) throw new appError('Game not found', 404);
    if (game.state === 'finished') {
        throw new appError('The game has already finished', 400);
    }

    const existing = await GamePlayerRepository.findByGameAndPlayer(numGameId, decoded.id);

    if (existing && !existing.hasLeft) {
        throw new appError('User stays in this game', 400);
    }
    if (existing && existing.hasLeft) {
        await GamePlayerRepository.update(existing.id, { hasLeft: false });
        return {};
    }
    if (game.state !== 'waiting') {
        throw new appError('The game started, only players who already joined can rejoin', 400);
    }

    const activeCount = await GamePlayerRepository.countActiveByGameId(numGameId);

    await GamePlayerRepository.create({
        gameId: numGameId,
        playerId: decoded.id,
        username: decoded.username,
        turnOrder: activeCount + 1,
        hasLeft: false,
    });
    return {};
};

/**
 *leave Game need gameId and playerId,
 *where search gameId and the gameidandplayerid
 *Depends the gameplayer.hasleft the player is not active
 * @returns we use update to change hasleft from true to false
 */
export const leaveGame = async ({ gameId, accessToken }) => {
    const numGameId = Number(gameId);
    if (!numGameId) { throw new appError('game_id is required', 400); }
    const decoded = verifyAccessToken(accessToken);
    const game = await GameRepository.findById(numGameId);
    
    if (!game) throw new appError('Game not found', 404);

    const gamePlayer = await GamePlayerRepository.findByGameAndPlayer(numGameId, decoded.id);
    if (!gamePlayer || gamePlayer.hasLeft) {
        throw new appError('User is not an active player in this game', 400);
    }

    await GamePlayerRepository.update(gamePlayer.id, { hasLeft: true });
    return {};
};

