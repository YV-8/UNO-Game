import CardRepository from '../../dataAccess/repositories/cards.repository.js';
import GameRepository from '../../dataAccess/repositories/game.repository.js';
import { appError } from '../../middlewares/appError.js';
import { formatCard } from '../../helpers/unoDeck.js';
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

export const createCard = async ({ color, value, gameId, location = 'deck', discardOrder = null }) => {
  if (!color || value === undefined || !gameId) {
    throw new appError('color, value and gameId are required', 400);
  }

  if (!VALID_COLORS.includes(color)) {
    throw new appError(`color must be one of: ${VALID_COLORS.join(', ')}`, 400);
  }

  const game = await GameRepository.findById(gameId);
  if (!game) throw new appError('Referenced game does not exist', 404);

  return await CardRepository.create({ color, value, gameId, location, discardOrder });
};

export const updateCard = async (id, data) => {
  const card = await CardRepository.findById(id);
  if (!card) throw new appError('Card not found', 404);

  const { color, value, gameId,location, discardOrder} = data;

  if (color !== undefined && !VALID_COLORS.includes(color)) {
    throw new appError(`color must be one of: ${VALID_COLORS.join(', ')}`, 400);
  }

  if (gameId !== undefined) {
    const game = await GameRepository.findById(gameId);
    if (!game) throw new appError('Referenced game does not exist', 404);
  }

  const updatedData = {
    color: color ?? card.color,
    value: value ?? card.value,
    gameId: gameId ?? card.gameId,
    location: location ?? card.location,
    discardOrder: discardOrder ?? card.discardOrder,
  };
  return await CardRepository.update(id, updatedData);
};

export const deleteCard = async (id) => {
  if (!id) throw new appError('ID is required', 400);

  const deleted = await CardRepository.delete(id);
  if (!deleted) throw new appError('Card not found', 404);
  return {};
};

/**
 * Genera y guarda de forma aleatoria la primera carta del descarte para un juego.
 * @param {number} gameId
 * @returns {Promise<Object>} Carta creada
 */
export const createInitCard = async (gameId) => {
  const numGameId = Number(gameId);
  const colors = ['red', 'blue', 'yellow', 'green'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const randomValue = String(Math.floor(Math.random() * 10));
  const newCard = await createCard({
    color: randomColor,
    value: randomValue,
    gameId: numGameId,
    location: 'discard', // Asegúrate de mapear este nuevo campo si tu DB lo requiere
    discardOrder: 1
  });
  return newCard;
}

/**
 * Obtiene la carta superior del descarte.
 * Si no existe, la crea dinámicamente en ese instante.
 */
export const getTopCard = async (id) => {
  if (!id) throw new appError('ID is required', 400);

  const game = await GameRepository.findById(id);
  if (!game) throw new appError('Game not found', 404);

  let topCard = await CardRepository.findTopDiscardByGameId(id);


  if (!topCard) {
    topCard = await createInitCard(game.id);
  }

  return {
    game_id: game.id,
    top_card: formatCard(topCard)
  };
};
