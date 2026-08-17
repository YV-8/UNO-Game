import Respond from '../monads/respond.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authValidator = ({ playerRepository, hashProvider }) => ({
    validateRegisterFieldsProvided: async (data) => {
        const { username, email, password } = data;
        if (!username || !email || !password) {
            return Respond.Err({ statusCode: 400, message: 'username, email and password are required' });
        }
        return Respond.Ok(data);
    },

    validateUsernameNotTaken: async (data) => {
        const existing = await playerRepository.findByUsername(data.username);
        if (existing) {
            return Respond.Err({ statusCode: 400, message: 'User already exists' });
        }
        return Respond.Ok(data);
    },

    validateEmailFormat: async (data) => {
        if (!EMAIL_REGEX.test(data.email)) {
            return Respond.Err({ statusCode: 400, message: 'Invalid email format' });
        }
        return Respond.Ok(data);
    },

    validateEmailNotTaken: async (data) => {
        const existing = await playerRepository.findByEmail(data.email);
        if (existing) {
            return Respond.Err({ statusCode: 400, message: 'Email address is already registered.' });
        }
        return Respond.Ok(data);
    },

    validateLoginFieldsProvided: async (data) => {
        const { username, password } = data;
        if (!username || !password) {
            return Respond.Err({ statusCode: 400, message: 'username and password are required' });
        }
        return Respond.Ok(data);
    },

    validateUserExists: async (data) => {
        const player = await playerRepository.findByUsername(data.username);
        if (!player) {
            return Respond.Err({ statusCode: 401, message: 'Invalid credentials' });
        }
        return Respond.Ok({ ...data, player });
    },

    validatePasswordMatches: async (data) => {
        const isMatch = await hashProvider.compare(data.password, data.player.password);
        if (!isMatch) {
            return Respond.Err({ statusCode: 401, message: 'Invalid credentials' });
        }
        return Respond.Ok(data);
    },

    validatePlayerExistsById: async (data) => {
        const player = await playerRepository.findById(data.playerId);
        if (!player) {
            return Respond.Err({ statusCode: 404, message: 'Player not found' });
        }
        return Respond.Ok({ ...data, player });
    },

});
