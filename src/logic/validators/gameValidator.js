import Result from '../monads/result.js';
import GameRepository from '../../dataAccess/repositories/game.repository.js';
import GamePlayerRepository from '../../dataAccess/repositories/gamePlayer.repository.js';

const VALID_STATUSES = ['waiting', 'in_progress', 'finished'];

export const validateNameProvided = async (data) => {
    if (!data.name) {
        return Result.Err({ statusCode: 400, message: 'name is required' });
    }
    return Result.Ok(data);
};

export const validateNameNotTaken = async (data) => {
    const existing = await GameRepository.findByName(data.name);
    if (existing) {
        return Result.Err({ statusCode: 400, message: 'Name is already registered.' });
    }
    return Result.Ok(data);
};

export const validateGameExists = async (data) => {
    const numGameId = Number(data.gameId);
    if (!numGameId) {
        return Result.Err({ statusCode: 400, message: 'game_id is required' });
    }
    const game = await GameRepository.findById(numGameId);
    if (!game) {
        return Result.Err({ statusCode: 404, message: 'Game not found' });
    }
    return Result.Ok({ ...data, gameId: numGameId, game });
};

export const validateIsCreator = async (data) => {
    if (data.game.creatorId !== data.playerId) {
        return Result.Err({ statusCode: 403, message: 'Only the creator of the game can perform this action' });
    }
    return Result.Ok(data);
};

export const validateGameStateIs = (expectedState, errorMessage) => async (data) => {
    if (data.game.state !== expectedState) {
        return Result.Err({ statusCode: 400, message: errorMessage });
    }
    return Result.Ok(data);
};

export const validateGameNotFinished = async (data) => {
    if (data.game.state === 'finished') {
        return Result.Err({ statusCode: 400, message: 'The game has already finished' });
    }
    return Result.Ok(data);
};

export const validateStatusValue = async (data) => {
    if (data.state !== undefined && !VALID_STATUSES.includes(data.state)) {
        return Result.Err({ statusCode: 400, message: `state must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    return Result.Ok(data);
};

export const validateMinPlayers = async (data) => {
    const activePlayers = await GamePlayerRepository.findAllByGameId(data.game.id);
    if (!activePlayers || activePlayers.length < 2) {
        return Result.Err({ statusCode: 400, message: 'Minium 2 Players must have joined to start the game' });
    }
    return Result.Ok({ ...data, activePlayers });
};

export const validateJoinEligibility = async (data) => {
    const existingPlayer = await GamePlayerRepository.findByGameAndPlayer(data.gameId, data.playerId);

    if (existingPlayer && !existingPlayer.hasLeft) {
        return Result.Err({ statusCode: 400, message: 'User stays in this game' });
    }
    if (!existingPlayer && data.game.state !== 'waiting') {
        return Result.Err({ statusCode: 400, message: 'The game started, only players who already joined can rejoin' });
    }
    return Result.Ok({ ...data, existingPlayer: existingPlayer ?? null });
};

export const validateActivePlayer = async (data) => {
    const gamePlayer = await GamePlayerRepository.findByGameAndPlayer(data.gameId, data.playerId);
    if (!gamePlayer || gamePlayer.hasLeft) {
        return Result.Err({ statusCode: 400, message: 'User is not an active player in this game' });
    }
    return Result.Ok({ ...data, gamePlayer });
};