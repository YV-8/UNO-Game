import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import { appError } from '../../middlewares/appError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const createPlayer = async ({ name, age, email }) => {
  if (!name || age === undefined || !email) {
    throw new appError('Name, age and email are required', 400);
  }

  if (typeof age !== 'number' || age <= 0) {
    throw new appError('Age has to be a positive number', 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new appError('Invalid email format', 400);
  }

  const existing = await PlayerRepository.findByEmail(email);
  if (existing) {
    throw new appError('Email address is already registered.', 400);
  }
  return await PlayerRepository.create({ name, age, email });
};

export const updatePlayer = async (id, data) => {
  const player = await PlayerRepository.getPlayerById(id);
  if (!player) {
    throw new appError('Player not found', 404);
  }
  const { name, age,email} = data;
  if (age !== undefined) {
    if (typeof age !== 'number' || age <= 0) {
      throw new appError('Age has to be a positive number', 400);
    }
  }

  if (email !== undefined) {
    if (!EMAIL_REGEX.test(email)) {
      throw new appError('Invalid email format', 400);
    }
    // if (email !== player.email) {
    //   const existingEmail = await PlayerRepository.findByEmail(email);
    //   if (existingEmail) {
    //     throw new appError('Email address is already registered by another player.', 400);
    //   }
    // }
  }

  const updatedData = {
    name: name ?? player.name,
    age: age ?? player.age,
    email: email ?? player.email
  };
  return await PlayerRepository.update(id, updatedData);
};

export const deletePlayer = async (id) => {
  if (!id) throw new appError('ID is required', 400);

  const deleted = await PlayerRepository.delete(id);
  if (!deleted) throw new appError('Player not found', 404);
  return {};
};
