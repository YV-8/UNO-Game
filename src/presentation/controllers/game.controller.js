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
    const { name, rules, access_token: accessToken } = req.body;
    const game = await GameService.createGame({ name, rules, accessToken });
    return sendSuccess(res, 201, 'Game created successfully', game);
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (req, res, next) => {
  const { id } = req.params;
  const {name, rules, state } = req.body;
  const { access_token: accessToken, ...data } = req.body;
  try {
    const updatedGame = await GameService.updateGame(id, data, accessToken);
    return sendSuccess(res, 200, 'Game updated successfully', updatedGame);
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
    const id = req.body?.game_id;
    const result = await GameService.getGameState(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getGamePlayers = async (req, res, next) => {
  try {
    const id = req.body?.game_id;
    const result = await GameService.getGamePlayers(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentPlayer = async (req, res, next) => {
  try {
    const id = req.body?.game_id;
    const result = await GameService.getCurrentPlayer(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// export const getTopCard = async (req, res, next) => {
//   try {
//     const gameId = Number(req.body?.game_id);
//     const result = await GameService.getTopCard(gameId);
//     return res.status(200).json(result);
//   } catch (error) {
//     next(error);
//   }
// };

export const getGameScores = async (req, res, next) => {
  try {
    const id = Number(req.body?.game_id);
    const result = await GameService.getGameScores(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const join = async (req, res, next) => {

    const { access_token: accessToken, ...data } = req.body;
    try {
        const id = Number(req.body?.game_id);
        await GameService.joinGame({
            gameId: id,accessToken
        });
        return sendSuccess(res, 200, 'User joined the game successfully');
    } catch (error) {
        next(error);
    }
};

export const leave = async (req, res, next) => {
    const { access_token: accessToken, ...data } = req.body;
    try {
        const id = Number(req.body?.game_id);
        await GameService.leaveGame({
            gameId:id,accessToken
        });
        return sendSuccess(res, 200, 'User left the game successfully');
    } catch (error) {
        next(error);
    }
};

export const startGame = async (req, res, next) => {
  try {
    const { game_id, access_token } = req.body || {};
    await GameService.startGame(game_id, access_token);
    return sendSuccess(res, 200, 'Game started successfully');
  } catch (error) {
    next(error);
  }
};

export const endGame = async (req, res, next) => {
  try {
    const { game_id, access_token } = req.body || {};
    const game = await GameService.endGame(game_id, access_token);
    return sendSuccess(res, 200, 'Game ended successfully');
  } catch (error) {
    next(error);
  }
};
