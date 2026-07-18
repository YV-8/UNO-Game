import CardRepository from '../../dataAccess/repositories/card.repository.js';
import GameRepository from '../../dataAccess/repositories/game.repository.js';
import { appError } from '../../middlewares/appError.js';
const VALID_COLORS = ['red', 'blue', 'yellow', 'green'];

export const getAllCards = async () => {
  return await CardRepository.findAll();
};

export const getCardById = async (id) => {
  if (!id) throw new appError('ID is required', 400);

  const card = await CardRepository.findById(id);
  if (!card) { throw new appError('Card not found', 404); }
  return card;
};

export const createCard = async ({ color, value, gameId }) => {
  if (!color || value === undefined || !gameId) {
    throw new appError('color, value and gameId are required', 400);
  }

  const game = await GameRepository.findById(gameId);
  if (!game) throw new appError('Referenced game does not exist', 404);

  if (!VALID_COLORS.includes(color)) {
    if (!VALID_COLORS.test(color)) {
      throw new appError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }
  }

  return await CardRepository.create({ color, value, gameId });
};

export const updateCard = async (id, data) => {
  const card = await CardRepository.findById(id);
  if (!card) throw new appError('Card not found', 404);

  const { color, value, gameId } = data;

  if (gameId !== undefined) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new appError('Referenced game does not exist', 404);
  }
  if (!VALID_COLORS.includes(color)) {
    if (!VALID_COLORS.test(color)) {
      throw new appError('Invalid status format', 400);
          }
      }

  const updatedData = {
    color: color ?? card.color,
    value: value ?? card.value,
    gameId: gameId ?? card.gameId,
  };
  return await CardRepository.update(id, updatedData);
};

export const deleteCard = async (id) => {
  if (!id) throw new appError('ID is required', 400);

  const deleted = await CardRepository.delete(id);
  if (!deleted) throw new appError('Card not found', 404);
  return {};
};