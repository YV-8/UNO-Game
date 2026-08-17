export const cardService = ({ cardRepository, cardRules, formatCard, respond }) => {

  const getAllCards = async () => {
    const cards = await cardRepository.findAll();
    return respond.Ok(cards);
  };

  const getCardById = async (id) => {
    const validation = await cardRules.validateGetCard({ id });
    if (validation.isErr()) return validation;
    return respond.Ok(validation.value.card);
  };

  const createCard = async ({ color, value, gameId, location = 'deck', discardOrder = null }) => {
    const validation = await cardRules.validateCreateCard({ color, value, gameId, location, discardOrder });
    if (validation.isErr()) return validation;

    const card = await cardRepository.create({ color, value, gameId, location, discardOrder });
    return respond.Ok(card);
  };

  const updateCard = async (id, data) => {
    const validation = await cardRules.validateUpdateCard({ id, ...data });
    if (validation.isErr()) return validation;

    const { card, color, value, gameId, location, discardOrder } = validation.value;
    const updatedData = {
      color: color ?? card.color,
      value: value ?? card.value,
      gameId: gameId ?? card.gameId,
      location: location ?? card.location,
      discardOrder: discardOrder ?? card.discardOrder,
    };

    const updatedCard = await cardRepository.update(id, updatedData);
    return respond.Ok(updatedCard);
  };

  const deleteCard = async (id) => {
    const validation = await cardRules.validateDeleteCard({ id });
    if (validation.isErr()) return validation;

    const deleted = await cardRepository.delete(id);
    if (!deleted) return respond.Err({ statusCode: 404, message: 'Card not found' });
    return respond.Ok({});
  };
  /**
 * Genera y guarda de forma aleatoria la primera carta del descarte para un juego.
 * @param {number} gameId
 * @returns {Promise<Object>} Carta creada
 */
  const createInitCard = async (gameId) => {
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
  const getTopCard = async (id) => {
    const validation = await cardRules.validateGetTopCard({ id });
    if (validation.isErr()) return validation;

    const { game } = validation.value;
    let topCard = await cardRepository.findTopDiscardByGameId(id);

    if (!topCard) {
      const initResult = await createInitCard(game.id);
      if (initResult.isErr()) return initResult;
      topCard = initResult.value;
    }

    return respond.Ok({
      game_id: game.id,
      top_card: formatCard(topCard),
    });
  };

  return { getAllCards, getCardById, createCard, updateCard, deleteCard, createInitCard, getTopCard };
};
