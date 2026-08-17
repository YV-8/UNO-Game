import Result from '../monads/respond.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createAuthValidator = ({ playerRepository, hashProvider }) => ({

    validateRegisterFieldsProvided: async (data) => {
        const { username, email, password } = data;
        if (!username || !email || !password) {
            return Result.Err({ statusCode: 400, message: 'username, email and password are required' });
        }
        return Result.Ok(data);
    },

    validateUsernameNotTaken: async (data) => {
        const existing = await playerRepository.findByUsername(data.username);
        if (existing) {
            return Result.Err({ statusCode: 400, message: 'User already exists' });
        }
        return Result.Ok(data);
    },

    validateEmailFormat: async (data) => {
        if (!EMAIL_REGEX.test(data.email)) {
            return Result.Err({ statusCode: 400, message: 'Invalid email format' });
        }
        return Result.Ok(data);
    },

    validateEmailNotTaken: async (data) => {
        const existing = await playerRepository.findByEmail(data.email);
        if (existing) {
            return Result.Err({ statusCode: 400, message: 'Email address is already registered.' });
        }
        return Result.Ok(data);
    },

    validateLoginFieldsProvided: async (data) => {
        const { username, password } = data;
        if (!username || !password) {
            return Result.Err({ statusCode: 400, message: 'username and password are required' });
        }
        return Result.Ok(data);
    },

    validateUserExists: async (data) => {
        const player = await playerRepository.findByUsername(data.username);
        if (!player) {
            return Result.Err({ statusCode: 401, message: 'Invalid credentials' });
        }
        return Result.Ok({ ...data, player });
    },

    validatePasswordMatches: async (data) => {
        const isMatch = await hashProvider.compare(data.password, data.player.password);
        if (!isMatch) {
            return Result.Err({ statusCode: 401, message: 'Invalid credentials' });
        }
        return Result.Ok(data);
    },

    validatePlayerExistsById: async (data) => {
        const player = await playerRepository.findById(data.playerId);
        if (!player) {
            return Result.Err({ statusCode: 404, message: 'Player not found' });
        }
        return Result.Ok({ ...data, player });
    },

});