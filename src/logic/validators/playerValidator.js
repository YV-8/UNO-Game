import Result from '../monads/respond.js';
import PlayerRepository from '../../dataAccess/repositories/player.repository.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateIdProvided = async (data) => {
    if (!data.id) {
        return Result.Err({ statusCode: 400, message: 'ID is required' });
    }
    return Result.Ok(data);
};

export const validatePlayerExists = async (data) => {
    const player = await PlayerRepository.findById(data.id);
    if (!player) {
        return Result.Err({ statusCode: 404, message: 'Player not found' });
    }
    return Result.Ok({ ...data, player });
};

export const validateEmailFormatIfProvided = async (data) => {
    if (data.email !== undefined && !EMAIL_REGEX.test(data.email)) {
        return Result.Err({ statusCode: 400, message: 'Invalid email format' });
    }
    return Result.Ok(data);
};