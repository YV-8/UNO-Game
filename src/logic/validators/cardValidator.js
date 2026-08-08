import Result from '../monads/result.js';
import CardRepository from '../../dataAccess/repositories/cards.repository.js';
import GameRepository from '../../dataAccess/repositories/game.repository.js';

const VALID_COLORS = ['red', 'blue', 'yellow', 'green'];

export const validateIdProvided = async (data) => {
    if (!data.id) {
        return Result.Err({ statusCode: 400, message: 'ID is required' });
    }
    return Result.Ok(data);
};

export const validateCardExists = async (data) => {
    const card = await CardRepository.findById(data.id);
    if (!card) {
        return Result.Err({ statusCode: 404, message: 'Card not found' });
    }
    return Result.Ok({ ...data, card });
};

export const validateCreateFieldsProvided = async (data) => {
    const { color, value, gameId } = data;
    if (!color || value === undefined || !gameId) {
        return Result.Err({ statusCode: 400, message: 'color, value and gameId are required' });
    }
    return Result.Ok(data);
};

export const validateColorValid = async (data) => {
    if (data.color !== undefined && !VALID_COLORS.includes(data.color)) {
        return Result.Err({ statusCode: 400, message: `color must be one of: ${VALID_COLORS.join(', ')}` });
    }
    return Result.Ok(data);
};

export const validateGameExistsForCard = async (data) => {
    const game = await GameRepository.findById(data.gameId);
    if (!game) {
        return Result.Err({ statusCode: 404, message: 'Referenced game does not exist' });
    }
    return Result.Ok({ ...data, game });
};

export const validateGameExistsIfGameIdProvided = async (data) => {
    if (data.gameId === undefined) return Result.Ok(data);
    const game = await GameRepository.findById(data.gameId);
    if (!game) {
        return Result.Err({ statusCode: 404, message: 'Referenced game does not exist' });
    }
    return Result.Ok({ ...data, game });
};

export const validateGameExistsForTopCard = async (data) => {
    const game = await GameRepository.findById(data.id);
    if (!game) {
        return Result.Err({ statusCode: 404, message: 'Game not found' });
    }
    return Result.Ok({ ...data, game });
};