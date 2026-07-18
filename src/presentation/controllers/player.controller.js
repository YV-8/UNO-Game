import * as PlayerService from '../../logic/services/player.service.js';
import { sendSuccess } from '../../helpers/responseHandler.middleware.js';

export const getAllPlayer = async (req, res, next) => {
  try {
    const players = await PlayerService.getAllPlayers();
    return sendSuccess(res, 200, 'Players retrieved successfully', players);
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const player = await PlayerService.getPlayerById(id);
    return sendSuccess(res, 200, 'Player retrieved successfully', player);
  } catch (error) {
    next(error);
  }
};
export const createPlayer = async (req, res, next) => {
  try {
    const Player = await PlayerService.createPlayer(req.body);

    return sendSuccess(res, 201, 'Player created successfully', Player);
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  try {
    const updatedPlayer = await PlayerService.updatePlayer(id, { name, age, email });
    return sendSuccess(res, 200, 'Player updated successfully', updatedPlayer);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  const { id } = req.params;
  try {
    await PlayerService.deletePlayer(id);
    return sendSuccess(res, 200, 'Player deleted successfully');
  } catch (error) {
    next(error);
  }
};
