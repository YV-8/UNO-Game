import CardRepository from '../../dataAccess/repositories/cards.repository.js';
import Result from '../monads/respond.js';
import { formatCard } from '../../helpers/unoDeck.js';
import * as cardRules from '../validators/cardsRules.js';

export const getAllCards = async () => {
  const cards = await CardRepository.findAll();
  return Result.Ok(cards);
};

export const getCardById = async (id) => {
  const result = await cardRules.validateGetCard({ id });
  if (result.isErr()) return result;
  return Result.Ok(result.value.card);
};

export const createCard = async ({ color, value, gameId, location = 'deck', discardOrder = null }) => {
  const result = await cardRules.validateCreateCard({ color, value, gameId, location, discardOrder });
  if (result.isErr()) return result;

  const card = await CardRepository.create({ color, value, gameId, location, discardOrder });
  return Result.Ok(card);
};

export const updateCard = async (id, data) => {
  const result = await cardRules.validateUpdateCard({ id, ...data });
  if (result.isErr()) return result;

  const { card, color, value, gameId, location, discardOrder } = result.value;
  const updatedData = {
    color: color ?? card.color,
    value: value ?? card.value,
    gameId: gameId ?? card.gameId,
    location: location ?? card.location,
    discardOrder: discardOrder ?? card.discardOrder,
  };

  const updatedCard = await CardRepository.update(id, updatedData);
  return Result.Ok(updatedCard);
};

export const deleteCard = async (id) => {
  const result = await cardRules.validateDeleteCard({ id });
  if (result.isErr()) return result;

  const deleted = await CardRepository.delete(id);
  if (!deleted) return Result.Err({ statusCode: 404, message: 'Card not found' });
  return Result.Ok({});
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

  return await createCard({
    color: randomColor,
    value: randomValue,
    gameId: numGameId,
    location: 'discard',
    discardOrder: 1,
  });
};

/**
 * Obtiene la carta superior del descarte.
 * Si no existe, la crea dinámicamente en ese instante.
 */
export const getTopCard = async (id) => {
  const result = await cardRules.validateGetTopCard({ id });
  if (result.isErr()) return result;

  const { game } = result.value;
  let topCard = await CardRepository.findTopDiscardByGameId(id);

  if (!topCard) {
    const initResult = await createInitCard(game.id);
    if (initResult.isErr()) return initResult;
    topCard = initResult.value;
  }

  return Result.Ok({
    game_id: game.id,
    top_card: formatCard(topCard),
  });
};
