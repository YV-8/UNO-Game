export const unoGameRules = ({ unoDeck, parseCardString }) => {
    /** deal ONE CARD to each layer, recursive, if don't get enough card don't repart more*/
    const dealOneRound = (deck, playerIds, hands, playerIndex) => {
        if (playerIndex === playerIds.length) {
            return { updatedHands: hands, remainingDeck: deck };
        }
        const [card, ...restDeck] = deck;
        const playerId = playerIds[playerIndex];
        const updatedHands = { ...hands, [playerId]: [...hands[playerId], card] };

        return dealOneRound(restDeck, playerIds, updatedHands, playerIndex + 1);
    };

    /**
    * deal -> `cardsPerPlayer` cards to player -> table
    * don't touch DB transform memory arrays
    * @param {Array} deck all deck
    * recursive method
    * @param {Array<number|string>} playerIds  order player
    * @param {number} cardsPerPlayer
    * @returns {{ hands: Record<string, Array>, remainingDeck: Array }}
    * complete "if" for all cards else  repart then */
    const dealCards = (deck, playerIds, cardsPerPlayer = 7, hands = null, round = 0) => {
        const currentHands = hands ?? Object.fromEntries(playerIds.map((id) => [id, []]));
        if (round === cardsPerPlayer) {
            return { hands: currentHands, remainingDeck: deck };
        }
        const { updatedHands, remainingDeck } = dealOneRound(deck, playerIds, currentHands, 0);

        return dealCards(remainingDeck, playerIds, cardsPerPlayer, updatedHands, round + 1);
    };

    /**Get de initial card -> wild don't revice, and try again*/
    const drawInitialTableCard = (deck) => {
        const [card, ...rest] = deck;
        if (!card) return { tableCard: null, remainingDeck: [] };
        if (card.color !== null) return { tableCard: card, remainingDeck: rest };
        return drawInitialTableCard([...rest, card]);
    };

    //Logic game
    /**Verificate  `card` can play about to `topCard`. wild play anytime
     * chosenColor`-> wild before -> is nedeed
     * don't select -> use color topCard */
    const canPlayCard = (card, topCard, chosenColor = null) => {
        if (!card || !topCard) return false;
        if (card.color === null) return true;

        const effectiveColor = chosenColor ?? topCard.color;
        return card.color === effectiveColor || card.value === topCard.value;
    };

    /**Search card with formatCard() match it*/
    const findCardInHand = (hand, cardString) => {
        if (hand.length === 0) return null;
        const [first, ...rest] = hand;
        return unoDeck.formatCard(first) === cardString ? first : findCardInHand(rest, cardString);
    };

    /** Player a card between the top cart actual
     * decided is valid  or need other card
     * or cath up  a card between valid */
    const hasPlayableCard = (hand, topCard) => {
        if (hand.length === 0) return false;
        const [first, ...rest] = hand;
        return canPlayCard(first, topCard) ? true : hasPlayableCard(rest, topCard);
    };

    /** IndexCalculate next player with direccion (1 = normal, -1 = reverse) skip turn
     * don't use index negative
     * */
    const getNextPlayerIndex = (currentIndex, totalPlayers, direction = 1, skip = false) => {
        const step = skip ? 2 : 1;
        let next = (currentIndex + direction * step) % totalPlayers;
        if (next < 0) next += totalPlayers;
        return next;
    };

    /**how many card give him for +2 or + 4*/
    const getDrawPenalty = (card) => {
        if (card.value === 'draw_two') return 2;
        if (card.value === 'wild_draw_four') return 4;
        return 0;
    };

    /** Cuando el deck se queda sin cartas: toma todo el descarte EXCEPTO la
     *  carta superior actual (que debe seguir visible como referencia de
     * juego), lo baraja, y ese resultado se convierte en el nuevo deck.
     * @param {Array} discardPile - todas las cartas en descarte, la primera
     * posición [0] debe ser la carta superior actual (topCard)
     * @returns {{ newDeck: Array, keptTopCard: Object|null }} */
    const reshuffleDiscardIntoDeck = (discardPile) => {
        if (!discardPile || discardPile.length <= 1) {
            return { newDeck: [], keptTopCard: discardPile?.[0] ?? null };
        }

        const [topCard, ...restOfDiscard] = discardPile;
        return {
            newDeck: unoDeck.shuffleDeck(restOfDiscard),
            keptTopCard: topCard,
        };
    };

    const isSkipCard = (card) => card.value === 'skip';
    const isReverseCard = (card) => card.value === 'reverse';
    const isDrawCard = (card) => card.value === 'draw_two' || card.value === 'wild_draw_four';
    const isWildCard = (card) => card.color === null;

    return {dealCards,drawInitialTableCard,canPlayCard,findCardInHand,hasPlayableCard,getNextPlayerIndex,
        getDrawPenalty, reshuffleDiscardIntoDeck,isSkipCard,isReverseCard,isDrawCard,isWildCard,
    };
};