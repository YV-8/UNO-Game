import ScoreRepository from '../../dataAccess/repositories/score.repository.js';
import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import GameRepository from '../../dataAccess/repositories/game.repository.js';
import { appError } from '../../middlewares/appError.js';

export const getAllScores = async () => {
    return await ScoreRepository.findAll();
};

export const getScoreById = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const score = await ScoreRepository.findById(id);
    if (!score) throw new appError('Score not found', 404);
    return score;
};

export const createScore = async ({ playerId, gameId, score }) => {
    if (!playerId || !gameId || score === undefined) {
        throw new appError('playerId, gameId and score are required', 400);
    }

    if (typeof score !== 'number' || score < 0) {
        throw new appError('score has to be a non-negative number', 400);
    }

    const player = await PlayerRepository.findById(playerId);
    if (!player) throw new appError('Referenced player does not exist', 404);

    const game = await GameRepository.findById(gameId);
    if (!game) throw new appError('Referenced game does not exist', 404);

    return await ScoreRepository.create({ playerId, gameId, score });
};

export const updateScore = async (id, data) => {
    const existingScore = await ScoreRepository.findById(id);
    if (!existingScore) {throw new appError('Score not found', 404);}

    const { playerId, gameId, score } = data;

    if (score !== undefined && (typeof score !== 'number' || score < 0)) {
        throw new appError('score has to be a non-negative number', 400);
    }

    const updatedData = {
        playerId: playerId ?? existingScore.playerId,
        gameId: gameId ?? existingScore.gameId,
        score: score ?? existingScore.score,
    };
    return await ScoreRepository.update(id, updatedData);
};

export const deleteScore = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const deleted = await ScoreRepository.delete(id);
    if (!deleted) throw new appError('Score not found', 404);
    return {};
};