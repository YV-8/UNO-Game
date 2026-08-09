import ScoreRepository from '../../dataAccess/repositories/score.repository.js';
import Result from '../monads/result.js';
import * as scoreRules from '../validators/scoreRules.js';

export const getAllScores = async () => {
    const scores = await ScoreRepository.findAll();
    return Result.Ok(scores);
};

export const getScoreById = async (id) => {
    const result = await scoreRules.validateGetScore({ id });
    if (result.isErr()) return result;
    return Result.Ok(result.value.existingScore);
};

export const createScore = async ({ playerId, gameId, score }) => {
    const result = await scoreRules.validateCreateScore({ playerId, gameId, score });
    if (result.isErr()) return result;

    const createdScore = await ScoreRepository.create({ playerId, gameId, score });
    return Result.Ok(createdScore);
};

export const updateScore = async (id, data) => {
    const result = await scoreRules.validateUpdateScore({ id, ...data });
    if (result.isErr()) return result;

    const { existingScore, playerId, gameId, score } = result.value;
    const updatedData = {
        playerId: playerId ?? existingScore.playerId,
        gameId: gameId ?? existingScore.gameId,
        score: score ?? existingScore.score,
    };

    const updatedScore = await ScoreRepository.update(id, updatedData);
    return Result.Ok(updatedScore);
};

export const deleteScore = async (id) => {
    const result = await scoreRules.validateDeleteScore({ id });
    if (result.isErr()) return result;

    const deleted = await ScoreRepository.delete(id);
    if (!deleted) return Result.Err({ statusCode: 404, message: 'Score not found' });
    return Result.Ok({});
};