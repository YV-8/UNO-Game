import * as GameService from '../../logic/services/game.service.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getAllGame = async (req, res) => {
  const result = await GameService.getAllGame();
  return handleResult(res, result, 200);
};

export const getGameById = async (req, res) => {
  const result = await GameService.getGameById(req.params.id);
  return handleResult(res, result, 200);
};

export const createGame = async (req, res) => {
  const { name, rules } = req.body;
  const playerId = req.player.id;
  const result = await GameService.createGame(
    { name, rules, playerId });
  return handleResult(res, result, 201);
};

export const updateGame = async (req, res) => {
  const result = await GameService.updateGame(req.params.id, req.body, req.player.id);
  return handleResult(res, result, 200);
};

export const deleteGame = async (req, res) => {
  const result = await GameService.deleteGame(req.params.id);
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
  const result = await GameService.startGame(game_id, req.player.id);
  return handleResult(res, result, 200);
};

export const endGame = async (req, res) => {
  const { game_id } = req.body || {};
  const result = await GameService.endGame(game_id, req.player.id);
  return handleResult(res, result, 200);
};

export const join = async (req, res) => {
  const gameId = Number(req.body?.game_id);
  const { id: playerId, username } = req.player;
  const result = await GameService.joinGame({ gameId, playerId, username });
  return handleResult(res, result, 200);
};

export const leave = async (req, res) => {
  const gameId = Number(req.body?.game_id);
  const result = await GameService.leaveGame(
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
  const result = await GameService.getGameState(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getGamePlayers = async (req, res) => {
  const result = await GameService.getGamePlayers(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getCurrentPlayer = async (req, res) => {
  const result = await GameService.getCurrentPlayer(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getGameScores = async (req, res) => {
  const result = await GameService.getGameScores(Number(req.body?.game_id));
  return handleResult(res, result, 200);
};
