import bcrypt from 'bcryptjs';
import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import Result from '../monads/result.js';
import * as playerRules from '../validators/playerRules.js';

const SALT_ROUNDS = 10;

export const getAllPlayers = async () => {
  const players = await PlayerRepository.findAll();
  return Result.Ok(players);
};

export const getPlayerById = async (id) => {
  const result = await playerRules.validateGetPlayer({ id });
  if (result.isErr()) return result;
  return Result.Ok(result.value.player);
};

export const updatePlayer = async (id, data) => {
  const result = await playerRules.validateUpdatePlayer({ id, ...data });
  if (result.isErr()) return result;

  const { player, username, email, password } = result.value;
  const updatedData = {
    username: username ?? player.username,
    email: email ?? player.email,
  };
  if (password) {
    updatedData.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  const updatedPlayer = await PlayerRepository.update(id, updatedData);
  return Result.Ok(updatedPlayer);
};

export const deletePlayer = async (id) => {
  const result = await playerRules.validateDeletePlayer({ id });
  if (result.isErr()) return result;

  const deleted = await PlayerRepository.delete(id);
  if (!deleted) return Result.Err({ statusCode: 404, message: 'Player not found' });
  return Result.Ok({});
};