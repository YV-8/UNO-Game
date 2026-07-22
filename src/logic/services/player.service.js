import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import { appError } from '../../middlewares/appError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

export const getAllPlayers = async () => {
  return await PlayerRepository.findAll();
};

export const getPlayerById = async (id) => {
  if (!id) {
    throw new appError('ID is required', 400);
  }

  const player = await PlayerRepository.findById(id);
  if (!player) {
    throw new appError('Player not found', 404);
  }
  return player;
};

export const updatePlayer = async (id, data) => {
  const player = await PlayerRepository.findById(id);
  if (!player) throw new appError('Player not found', 404);

  const { username, email, password } = data;

  if (email !== undefined && !EMAIL_REGEX.test(email)) {
    throw new appError('Invalid email format', 400);
  }

  const updatedData = {
    username: username ?? player.username,
    email: email ?? player.email
  };
  if (password) {
    updatedData.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  return await PlayerRepository.update(id, updatedData);
};

export const deletePlayer = async (id) => {
  if (!id) throw new appError('ID is required', 400);

  const deleted = await PlayerRepository.delete(id);
  if (!deleted) throw new appError('Player not found', 404);
  return {};
};
