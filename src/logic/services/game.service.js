import GameRepository from '../../dataAccess/repositories/game.repository.js';
import { appError } from '../../middlewares/appError.js';

const VALID_STATUSES = ['active','waiting', 'inactive', 'finished'];

export const getAllGame = async () => {
    return await GameRepository.findAll();
};

export const getGameById = async (id) => {
    if (!id) {
        throw new appError('ID is required', 400);
    }
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new appError('game not found', 404);
    }
    return game;
};

export const createGame = async ({ name, status}) => {
    if (!name || status === undefined ) {
        throw new appError('name, status and maxPlayers are required', 400);
    }

    if (!name) {
        throw new appError('name is required', 400);
    }
    
    if (!VALID_STATUSES.includes(status)) {
        throw new appError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    
    const existing = await GameRepository.findByName(name);
    if (existing) {
        throw new appError('Name is already registered.', 400);
    }
    return await GameRepository.create({ name, status});
};

export const updateGame = async (id, data) => {
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new appError('Game not found', 404);}
    const { name, status } = data;
    
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        throw new appError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    
    const { name, rules } = data;

    const updatedData = {
        name: name ?? game.name,
        rules: rules ?? game.rules,
    };
    return await GameRepository.update(id, updatedData);
};

export const deleteGame = async (id) => {
    if (!id) throw new appError('ID is required', 400);
    
    const deleted = await GameRepository.delete(id);
    if (!deleted) throw new appError('Game not found', 404);
    return {};
};
