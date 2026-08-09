import * as PlayerService from '../../logic/services/player.service.js';
import { handleResult } from '../../helpers/handleResult.js';
/**
 * 
 * @param {*} req -> caso los parametros para tenerlos
 * @param {*} res -> responde
 * @returns
 * for this case the players controllers is necesary use the handleresult
 * manage the errores and send the wait result
 */
export const getAllPlayer = async (req, res) => {
  const result = await PlayerService.getAllPlayers();
  return handleResult(res, result, 200);
};

export const getPlayerById = async (req, res) => {
  const result = await PlayerService.getPlayerById(req.params.id);
  return handleResult(res, result, 200);
};

export const updatePlayer = async (req, res) => {
  const { username, email, password } = req.body;
  const result = await PlayerService.updatePlayer(req.params.id,
    { username, email, password });
  return handleResult(res, result, 200);
};

export const deletePlayer = async (req, res) => {
  const result = await PlayerService.deletePlayer(req.params.id);
  return handleResult(res, result, 200);
};