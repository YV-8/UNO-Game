import Respond from '../monads/respond.js';

const VALID_COLORS = ['red', 'blue', 'yellow', 'green'];
export const cardValidator = ({ cardRepository, gameRepository, gamePlayerRepository }) => ({
    validateIdProvided: async (data) => {
        if (!data.id) {
            return Respond.Err({ statusCode: 400, message: 'ID is required' });
        }
        return Respond.Ok(data);
    },

    validateCardExists: async (data) => {
        const card = await cardRepository.findById(data.id);
        if (!card) {
            return Respond.Err({ statusCode: 404, message: 'Card not found' });
        }
        return Respond.Ok({ ...data, card });
    },

    validateCreateFieldsProvided: async (data) => {
        const { color, value, gameId } = data;
        if (!color || value === undefined || !gameId) {
            return Respond.Err({ statusCode: 400, message: 'color, value and gameId are required' });
        }
        return Respond.Ok(data);
    },

    validateColorValid: async (data) => {
        if (data.color !== undefined && !VALID_COLORS.includes(data.color)) {
            return Respond.Err({ statusCode: 400, message: `color must be one of: ${VALID_COLORS.join(', ')}` });
        }
        return Respond.Ok(data);
    },

    validateGameExistsForCard: async (data) => {
        const game = await gameRepository.findById(data.gameId);
        if (!game) {
            return Respond.Err({ statusCode: 404, message: 'Referenced game does not exist' });
        }
        return Respond.Ok({ ...data, game });
    },

    validateGameExistsIfGameIdProvided: async (data) => {
        if (data.gameId === undefined) return Respond.Ok(data);
        const game = await gameRepository.findById(data.gameId);
        if (!game) {
            return Respond.Err({ statusCode: 404, message: 'Referenced game does not exist' });
        }
        return Respond.Ok({ ...data, game });
    },

    validateGameExistsForTopCard: async (data) => {
        const game = await gameRepository.findById(data.id);
        if (!game) {
            return Respond.Err({ statusCode: 404, message: 'Game not found' });
        }
        return Respond.Ok({ ...data, game });
    },
});
