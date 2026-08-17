import Respond from '../monads/respond.js';

export const scoreValidator = ({ scoreRepository, playerRepository, gameRepository }) => ({

    validateIdProvided: async (data) => {
        if (!data.id) return Respond.Err({ statusCode: 400, message: 'ID is required' });
        return Respond.Ok(data);
    },

    validateScoreExists: async (data) => {
        const score = await scoreRepository.findById(data.id);
        if (!score) return Respond.Err({ statusCode: 404, message: 'Score not found' });
        return Respond.Ok({ ...data, existingScore: score });
    },

    validateCreateFieldsProvided: async (data) => {
        const { playerId, gameId, score } = data;
        if (!playerId || !gameId || score === undefined) {
            return Respond.Err({ statusCode: 400, message: 'playerId, gameId and score are required' });
        }
        return Respond.Ok(data);
    },

    validateScoreIsNonNegativeNumber: async (data) => {
        if (data.score !== undefined && (typeof data.score !== 'number' || data.score < 0)) {
            return Respond.Err({ statusCode: 400, message: 'score has to be a non-negative number' });
        }
        return Respond.Ok(data);
    },

    validatePlayerExistsForScore: async (data) => {
        const player = await playerRepository.findById(data.playerId);
        if (!player) return Respond.Err({ statusCode: 404, message: 'Referenced player does not exist' });
        return Respond.Ok({ ...data, player });
    },

    validateGameExistsForScore: async (data) => {
        const game = await gameRepository.findById(data.gameId);
        if (!game) return Respond.Err({ statusCode: 404, message: 'Referenced game does not exist' });
        return Respond.Ok({ ...data, game });
    },

});