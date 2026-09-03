import Result from '../monads/result.js';
import ScoreRepository from '../../dataAccess/repositories/score.repository.js';
import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import GameRepository from '../../dataAccess/repositories/game.repository.js';

export const validateIdProvided = async (data) => {
    if (!data.id) return Result.Err({ statusCode: 400, message: 'ID is required' });
    return Result.Ok(data);
};

export const validateScoreExists = async (data) => {
    const score = await ScoreRepository.findById(data.id);
    if (!score) return Result.Err({ statusCode: 404, message: 'Score not found' });
    return Result.Ok({ ...data, existingScore: score });
};

export const validateCreateFieldsProvided = async (data) => {
    const { playerId, gameId, score } = data;
    if (!playerId || !gameId || score === undefined) {
        return Result.Err({ statusCode: 400, message: 'playerId, gameId and score are required' });
    }
    return Result.Ok(data);
};

export const validateScoreIsNonNegativeNumber = async (data) => {
    if (data.score !== undefined && (typeof data.score !== 'number' || data.score < 0)) {
        return Result.Err({ statusCode: 400, message: 'score has to be a non-negative number' });
    }
    return Result.Ok(data);
};

export const validatePlayerExistsForScore = async (data) => {
    const player = await PlayerRepository.findById(data.playerId);
    if (!player) return Result.Err({ statusCode: 404, message: 'Referenced player does not exist' });
    return Result.Ok({ ...data, player });
};

export const validateGameExistsForScore = async (data) => {
    const game = await GameRepository.findById(data.gameId);
    if (!game) return Result.Err({ statusCode: 404, message: 'Referenced game does not exist' });
    return Result.Ok({ ...data, game });
};