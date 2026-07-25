import * as GameService from '../../logic/services/game.service.js';
import { sendSuccess } from '../../helpers/responseHandler.middleware.js';

export const getAllGame = async (req, res, next) => {
  try {
    const game = await GameService.getAllGame();
    return sendSuccess(res, 200, 'Game retrieved successfully', game);
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const game = await GameService.getGameById(id);
    return sendSuccess(res, 200, 'Game retrieved successfully', game);
  } catch (error) {
    next(error);
  }
};
export const createGame = async (req, res, next) => {
  try {
    const game = await GameService.createGame(req.body);
    return sendSuccess(res, 201, 'Game created successfully', game);
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req, res, next) => {
  const { id } = req.params;
  const { name, rules, state, maxPlayers } = req.body;
  try {
    const updateGame = await GameService.updateGame(id, req.body);
    return sendSuccess(res, 200, 'Game updated successfully', updateGame);
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (req, res, next) => {
  const { id } = req.params;
  try {
    await GameService.deleteGame(id);
    return sendSuccess(res, 200, 'Game deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getGameState = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await GameService.getGameState(id);
    return sendSuccess(res, 200, 'Game state retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getGamePlayers = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await GameService.getGamePlayers(id);
    return sendSuccess(res, 200, 'Game players retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentPlayer = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await GameService.getCurrentPlayer(id);
    return sendSuccess(res, 200, 'Current player retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
