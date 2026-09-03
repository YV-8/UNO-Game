export const unoCardBuilder = ({ unoDeck, unoGameRules, cardRepository }) => {
    const toCardType = (card) => {
        if (card.type) return card.type;
        if (card.color === null) return 'wild';
        return isNaN(card.value) ? 'action' : 'number';
    };

    const toCardRow = ({ gameId, playerId = null, card, location, discardOrder = null }) => ({
        gameId,
        playerId,
        color: card.color,
        value: card.value,
        type: toCardType(card),
        location,
        discardOrder,
    });

    /**
     * Arma las 108, reparte handSize a cada jugador (round-robin vía
     * unoGameRules.dealCards), separa 1 carta como tope del descarte
     * y el resto queda como mazo. Persiste todo en un solo bulkCreate,
     * respetando el orden hand -> discard -> deck.
     */
    const dealInitialCards = async ({ gameId, playerIds, handSize = 7 }) => {
        const shuffledDeck = unoDeck.shuffleDeck(unoDeck.buildDeck());
        const { hands, remainingDeck } = unoGameRules.dealCards(shuffledDeck, playerIds, handSize);
        const isPlainNumberCard = (card) => card.color !== null && !isNaN(card.value);
        const tableCardIndex = remainingDeck.findIndex(isPlainNumberCard);
        const validIndex = tableCardIndex !== -1 ? tableCardIndex : 0;
        const tableCard = remainingDeck[validIndex];
        const deckAfterTable = remainingDeck.filter((_, index) => index !== tableCardIndex);

        const handRows = playerIds.flatMap((playerId) =>
            (hands[playerId] || []).map((card) => toCardRow({ gameId, playerId, card, location: 'hand' }))
        );
        const discardRow = [toCardRow({ gameId, card: tableCard, location: 'discard', discardOrder: 1 })];
        const deckRows = deckAfterTable.map((card) => toCardRow({ gameId, card, location: 'deck' }));

        await cardRepository.bulkCreate([...handRows, ...discardRow, ...deckRows]);

        return { topCard: tableCard };
    };

    /**
     * Roba `count` cartas del mazo para playerId. Si el mazo no alcanza,
     * recicla el descarte (menos la carta tope, que nunca se toca) de
     * vuelta al mazo, barajado, antes de completar el robo.
     */
    const drawCards = async ({ gameId, playerId, count }) => {
        let deck = await cardRepository.findDeckByGameId(gameId);

        if (deck.length < count) {
            const discardPile = await cardRepository.findDiscardByGameId(gameId);
            const [, ...restOfDiscard] = discardPile; // se conserva la carta tope

            const reshuffled = unoDeck.shuffleDeck(restOfDiscard);
            await cardRepository.bulkUpdate(
                reshuffled.map((card) => ({
                    id: card.id,
                    data: { location: 'deck', discardOrder: null, playerId: null },
                }))
            );
            deck = [...deck, ...reshuffled];
        }

        const drawnCards = deck.slice(0, count);
        await cardRepository.bulkUpdate(
            drawnCards.map((card) => ({ id: card.id, data: { location: 'hand', playerId } }))
        );

        return drawnCards;
    };

    return { dealInitialCards, drawCards };
};