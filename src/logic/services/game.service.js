import GameRepository from '../../dataAccess/repositories/game.repository.js';
import { appError } from '../../middlewares/appError.js';

const VALID_STATUSES = ['waiting', 'Inprogress', 'finished'];

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

export const createGame = async ({ name, rules, maxPlayers }) => {
    if (!name || maxPlayers === undefined) {
        throw new appError('name, status and maxPlayers are required', 400);
    }

    const existing = await GameRepository.findByName(name);
    if (existing) {
        throw new appError('Name is already registered.', 400);
    }
    if (!name) {
        throw new appError('name is required', 400);
    }
    if (typeof maxPlayers !== 'number' || maxPlayers <= 0) {
        throw new appError('maxPlayers has to be a positive number', 400);
    }

    const existing = await GameRepository.findByName(name);
    if (existing) {
        throw new appError('Name is already registered.', 400);
    }
    return await GameRepository.create({ name, rules, maxPlayers, state: 'waiting' });
};

export const updateGame = async (id, data) => {
    const game = await GameRepository.findById(id);
    if (!game) {
        throw new appError('Game not found', 404);
    }
    const { name, rules, state, maxPlayers } = data;

    if (status !== undefined && !VALID_STATUSES.includes(state)) {
        throw new appError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
    if (maxPlayers !== undefined && (typeof maxPlayers !== 'number' || maxPlayers <= 0)) {
        throw new appError('maxPlayers has to be a positive number', 400);
    }

    const { name, rules } = data;

    const updatedData = {
        name: name ?? game.name,
        rules: rules ?? game.rules,
        state: state ?? game.state,
    };
    return await GameRepository.update(id, updatedData);
};

export const deleteGame = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const deleted = await GameRepository.delete(id);
    if (!deleted) throw new appError('Game not found', 404);
    return {};
};

export const getGameState = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const game = await GameRepository.findById(id);
    if (!game) throw new appError('Game not found', 404);

    return { game_id: game.id, state: game.state };
};

export const getGamePlayers = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const game = await GameRepository.findById(id);
    if (!game) throw new appError('Game not found', 404);

    const gamePlayers = await GamePlayerRepository.findAllByGameId(id);
    const players = gamePlayers.map((gamePlayer) => gamePlayer.username);

    return { game_id: game.id, players };
};

export const getCurrentPlayer = async (id) => {
    if (!id) throw new appError('ID is required', 400);

    const game = await GameRepository.findByIdWithCurrentPlayer(id);
    if (!game) throw new appError('Game not found', 404);

    if (!game.currentPlayer) {
        throw new appError('This game does not have a current player yet', 400);
    }

    return { game_id: game.id, current_player: game.currentPlayer.username };
};
