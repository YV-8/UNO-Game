import { gameService } from '../../container.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getAllGame = async (req, res) => {
  const result = await gameService.getAllGame();
  return handleResult(res, result, 200);
};

export const getGameById = async (req, res) => {
  const result = await gameService.getGameById(req.params.id);
  return handleResult(res, result, 200);
};

export const createGame = async (req, res) => {
  const { name, rules } = req.body;
  const { id: playerId, username } = req.player;
  const result = await gameService.createGame(
    { name, rules, playerId, username });
  return handleResult(res, result, 201);
};

export const updateGame = async (req, res) => {
  const result = await gameService.updateGame(req.params.id, req.body, req.player.id);
  return handleResult(res, result, 200);
};

export const deleteGame = async (req, res) => {
  const result = await gameService.deleteGame(req.params.id);
  return handleResult(res, result, 200);
};

/**
 * For the start end join and leave the controller to need the game_id
 * to get the result its because theses modificated the results with they're actions
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const startGame = async (req, res) => {
  const { game_id } = req.body || {};
  const result = await gameService.startGame(game_id, req.player.id);
  return handleResult(res, result, 200);
};

export const endGame = async (req, res) => {
  const { game_id } = req.body || {};
  const result = await gameService.endGame(game_id, req.player.id);
  return handleResult(res, result, 200);
};

export const join = async (req, res) => {
  const gameId = Number(req.body?.game_id);
  const { id: playerId, username } = req.player;
  const result = await gameService.joinGame({ gameId, playerId, username });
  return handleResult(res, result, 200);
};

export const leave = async (req, res) => {
  const gameId = Number(req.body?.game_id);
  const result = await gameService.leaveGame(
    { gameId, playerId: req.player.id });
  return handleResult(res, result, 200);
};

/**
 * this case is very similar for getGameState getGamePLayers
 * getCUrrentPlayer getGameScores  user the const result use a promise await for the GameService
 * the same mod the other for req.body and is only get so don't change anything
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

export const getGameState = async (req, res) => {
  const result = await gameService.getGameState(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getGamePlayers = async (req, res) => {
  const result = await gameService.getGamePlayers(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getCurrentPlayer = async (req, res) => {
  const result = await gameService.getCurrentPlayer(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getGameScores = async (req, res) => {
  const result = await gameService.getGameScores(Number(req.body?.game_id));
  return handleResult(res, result, 200);
};
