const COLORS = ['red', 'blue', 'yellow', 'green'];
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
  const initializeGameCards = async (gameId, playerIds, handSize = 7) => {
    const { cardRows, topCard } = unoCardBuilder.buildInitialCardRows({ gameId, playerIds, handSize });
    await cardRepository.bulkCreate(cardRows);
    return respond.Ok({ topCard: unoDeck.formatCard(topCard) });
  };

  // para cuando implementes las penalizaciones de robar cartas en playCard
  const drawCards = async (gameId, playerId, count) => {
    let deck = await cardRepository.findDeckByGameId(gameId);

    if (deck.length < count) {
      const discardPile = await cardRepository.findDiscardByGameId(gameId);
      const [, ...restOfDiscard] = discardPile; // conserva la carta tope
      const reshuffled = unoDeck.shuffleDeck(restOfDiscard);

      await cardRepository.bulkUpdate(
        reshuffled.map((card, index) => ({
          id: card.id,
          data: { location: 'deck', discardOrder: null, deckOrder: deck.length + index },
        }))
      );
      deck = [...deck, ...reshuffled];
    }

    const drawnCards = deck.slice(0, count);
    await cardRepository.bulkUpdate(
      drawnCards.map((card) => ({ id: card.id, data: { location: 'hand', playerId } }))
    );

    return respond.Ok(drawnCards.map(unoDeck.formatCard));
  };

  return { getAllCards, getCardById, createCard, updateCard, deleteCard, initializeGameCards, drawCards};
};
