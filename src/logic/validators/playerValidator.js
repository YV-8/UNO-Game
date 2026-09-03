import Respond from '../monads/respond.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const playerValidator = ({ playerRepository }) => ({

    validateIdProvided: async (data) => {
        if (!data.id) {
            return Respond.Err({ statusCode: 400, message: 'ID is required' });
        }
        return Respond.Ok(data);
    },

    validatePlayerExists: async (data) => {
        const player = await playerRepository.findById(data.id);
        if (!player) {
            return Respond.Err({ statusCode: 404, message: 'Player not found' });
        }
        return Respond.Ok({ ...data, player });
    },

    validateEmailFormatIfProvided: async (data) => {
        if (data.email !== undefined && !EMAIL_REGEX.test(data.email)) {
            return Respond.Err({ statusCode: 400, message: 'Invalid email format' });
        }
        return Respond.Ok(data);
    },

});