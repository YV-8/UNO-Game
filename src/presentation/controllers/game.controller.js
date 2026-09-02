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

export const getTopCard = async (req, res) => {
  const id = Number(req.body?.game_id);
  const result = await gameService.getTopCard(id);
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

export const getPlayersByGameId = async (req, res) => {
  const result = await gameService.getGamePlayers(req.params.id);
  return handleResult(res, result, 200);
};

export const getCurrentPlayer = async (req, res) => {
  const result = await gameService.getCurrentPlayer(req.body?.game_id);
  return handleResult(res, result, 200);
};

export const getGameScore = async (req, res, next) => {
  const result = await gameService.getScores({
    gameId: req.params.id, playerId: req.player.id
  });
  return handleResult(res, result, 200);
}

export const playCard = async (req, res) => {
  const result = await gameService.playCard({
        gameId: req.params.id,
        playerId: req.player.id,
        cardPlayedStr: req.body.cardPlayed,
        chosenColor: req.body.chosenColor,
        bodyUsername: req.body.player,
    });
  return handleResult(res, result, 200);
};

export const getMyHand = async (req, res) => {
  const gameId = req.params.id;
  const playerId = req.player.id;

  const result = await gameService.getPlayerHand({ gameId, playerId });
  return handleResult(res, result, 200);
};

export const drawCard = async (req, res) => {
  // const gameId = req.params.id;
  // const playerId = req.player.id;

  // const result = await gameService.drawCard({ gameId, playerId });
  const result = await gameService.drawCard({
        gameId: req.params.id,
        playerId: req.player.id,
        bodyUsername: req.body.player,
    });
  return handleResult(res, result, 200);
};

export const getGameOverview = async (req, res) => {
  const gameId = req.params.id;
  const playerId = req.player.id;

  const result = await gameService.getGameOverview({ gameId, playerId });
  if (result.isErr()) {
    const { statusCode, message } = result.error;
    return res.status(statusCode).json({ message });
  }
  return res.status(200).json(result.value);
};

export const getGameRegistry = async (req, res) => {
  const gameId = req.params.id;
  const playerId = req.player.id;
  const result = await gameService.getGameRegistry({ gameId, playerId });
  return handleResult(res, result, 200);
};

export const sayUno = async (req, res) => {
  // const gameId = req.params.id;
  // const playerId = req.player.id;
  // const result = await gameService.sayUno({ gameId, playerId });
  const result = await gameService.sayUno({
        gameId: req.params.id,
        playerId: req.player.id,
        bodyUsername: req.body.player,
    });
  return handleResult(res, result, 200);
};

export const challengeUno = async (req, res) => {
  // const gameId = req.params.id;
  // const playerId = req.player.id;
  // const challengedUsername = req.body.challengedPlayer;

  // const result = await gameService.challengeUno({ gameId, playerId, challengedUsername });
  const result = await gameService.challengeUno({
        gameId: req.params.id, playerId: req.player.id,
        challengedUsername: req.body.challengedPlayer,
        bodyUsername: req.body.challenger,
    });
  return handleResult(res, result, 200);
};
