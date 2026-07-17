import * as PlayersService from '../../logic / services/players.service.js';
import { sendSuccess } from '../../utils/responseHandler.js';

export const getPlayer = async (req, res, next) => {
  try {
    const player = await PlayersService.getPlayerById(req.params.id);
    return sendSuccess(res, 200, 'Player retrieved successfully', player);
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const player = await PlayersService.getPlayerById(id);
    return sendSuccess(res, 200, 'Player retrieved successfully', player);
  } catch (error) {
    next(error);
  }
};
export const createPlayer = async (req, res, next) => {
  try {
    const Player = await PlayersService.createPlayer(req.body);

    return sendSuccess(res, 201, 'Player created successfully', Player);
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  try {
    const updatedPlayer = await PlayersService.updatePlayer(id, { name, age, email });
    return sendSuccess(res, 200, 'Player updated successfully', updatedPlayer);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  const { id } = req.params;
  try {
    await PlayersService.deletePlayer(id);
    return sendSuccess(res, 200, 'Player deleted successfully');
  } catch (error) {
    next(error);
  }
};