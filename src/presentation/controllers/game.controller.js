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
  try {
    const gameId = req.body?.game_id;
    const result = await GameService.getGameState(Number(gameId));
    return res.status(200).json(result);
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

export const startGame = async (req, res, next) => {
  const { id } = req.params;
  try {
    const game = await GameService.startGame(id, req.player.id);
    return sendSuccess(res, 200, 'Game started successfully', game);
  } catch (error) {
    next(error);
  }
};

export const endGame = async (req, res, next) => {
  const { id } = req.params;
  try {
    const game = await GameService.endGame(id, req.player.id);
    return sendSuccess(res, 200, 'Game ended successfully', game);
  } catch (error) {
    next(error);
  }
};
