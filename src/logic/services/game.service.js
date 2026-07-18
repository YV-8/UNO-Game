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

export const createGame = async ({ title, status, maxPlayers }) => {
    if (!title || status === undefined || !maxPlayers) {
        throw new appError('title, status and maxPlayers are required', 400);
    }
    
    if (typeof maxPlayers !== 'number' || maxPlayers <= 0) {
        throw new appError('maxPlayers has to be a positive number', 400);
    }
    
    if (!VALID_STATUSES.includes(status)) {
        throw new appError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    
    const existing = await GameRepository.findByTitle(title);
    if (existing) {
        throw new appError('Title is already registered.', 400);
    }
    return await GameRepository.create({ title, status, maxPlayers});
};

export const updateGame = async (id, data) => {
    const game = await GameRepository.getGameById(id);
    if (!game) {
        throw new appError('Game not found', 404);}
    const { title, status, maxPlayers } = data;
    
    if (maxPlayers !== undefined && (typeof maxPlayers !== 'number' || maxPlayers <= 0)) {
        throw new appError('maxPlayers has to be a positive number', 400);
    }
    
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        throw new appError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    
    const updatedData = {
        title: title ?? game.title,
        status: status ?? game.status,
        maxPlayers: maxPlayers ?? game.maxPlayers,
    };
    return await GameRepository.update(id, updatedData);
};

export const deleteGame = async (id) => {
    if (!id) throw new appError('ID is required', 400);
    
    const deleted = await GameRepository.delete(id);
    if (!deleted) throw new appError('Player not found', 404);
    return {};
};
