import { shuffleDeck } from '../../helpers/unoDeck.js';

/**
 * Reparte `cardsPerPlayer` cartas a cada jugador desde el deck.
 * Puro: no toca la BD, solo transforma arrays en memoria.
 *
 * @param {Array} deck - mazo completo (ya barajado)
 * @param {Array<number|string>} playerIds - orden de reparto
 * @param {number} cardsPerPlayer
 * @returns {{ hands: Record<string, Array>, remainingDeck: Array }}
 */
export const dealCards = (deck, playerIds, cardsPerPlayer = 7) => {
    const remainingDeck = [...deck];
    const hands = {};

    playerIds.forEach((playerId) => {
        hands[playerId] = remainingDeck.splice(0, cardsPerPlayer);
    });

    return { hands, remainingDeck };
};

/**
 * Verifica si `card` se puede jugar sobre `topCard`.
 * Las comodín (color null) siempre son jugables.
 * `chosenColor` es el color elegido tras un wild anterior (si aplica);
 * si no hay elección activa, se usa el color real de topCard.
 */
export const canPlayCard = (card, topCard, chosenColor = null) => {
    if (!card || !topCard) return false;
    if (card.color === null) return true; // wild / wild_draw_four

    const effectiveColor = chosenColor ?? topCard.color;
    return card.color === effectiveColor || card.value === topCard.value;
};

/**
 * Calcula el índice del siguiente jugador según dirección (1 = horario,
 * -1 = reverse) y si hay que saltar un turno (skip).
 * Usa módulo seguro para nunca devolver un índice negativo.
 */
export const getNextPlayerIndex = (currentIndex, totalPlayers, direction = 1, skip = false) => {
    const step = skip ? 2 : 1;
    let next = (currentIndex + direction * step) % totalPlayers;
    if (next < 0) next += totalPlayers;
    return next;
};

/**
 * Determina cuántas cartas debe robar el siguiente jugador según la carta
 * jugada (draw_two = +2, wild_draw_four = +4). 0 si no aplica penalidad.
 */
export const getDrawPenalty = (card) => {
    if (card.value === 'draw_two') return 2;
    if (card.value === 'wild_draw_four') return 4;
    return 0;
};

/**
 * Saca `count` cartas del deck. Si el deck no alcanza, devuelve lo que
 * haya disponible (el llamador decide si reshuffle-ar el descarte antes).
 */
export const drawCards = (deck, count) => {
    const drawn = deck.slice(0, count);
    const remainingDeck = deck.slice(count);
    return { drawn, remainingDeck };
};

/**
 * Cuando el deck se queda sin cartas: toma todo el descarte EXCEPTO la
 * carta superior actual (que debe seguir visible como referencia de
 * juego), lo baraja, y ese resultado se convierte en el nuevo deck.
 *
 * @param {Array} discardPile - todas las cartas en descarte, la primera
 *   posición [0] debe ser la carta superior actual (topCard)
 * @returns {{ newDeck: Array, keptTopCard: Object|null }}
 */
export const reshuffleDiscardIntoDeck = (discardPile) => {
    if (!discardPile || discardPile.length <= 1) {
        return { newDeck: [], keptTopCard: discardPile?.[0] ?? null };
    }

    const [topCard, ...restOfDiscard] = discardPile;
    return {
        newDeck: shuffleDeck(restOfDiscard),
        keptTopCard: topCard,
    };
};

/**
 * Envuelve drawCards + reshuffle automático: si el deck no tiene
 * suficientes cartas, primero rearma el mazo desde el descarte.
 */
export const drawCardsWithReshuffle = (deck, discardPile, count) => {
    if (deck.length >= count) {
        return { ...drawCards(deck, count), discardPile };
    }

    const { newDeck, keptTopCard } = reshuffleDiscardIntoDeck(discardPile);
    const mergedDeck = [...deck, ...newDeck];
    const { drawn, remainingDeck } = drawCards(mergedDeck, count);

    return {
        drawn,
        remainingDeck,
        discardPile: keptTopCard ? [keptTopCard] : [],
    };
};

// Helpers de identificación de carta especial, útiles en el service que
// resuelve el efecto de cada jugada (playCard)
export const isSkipCard = (card) => card.value === 'skip';
export const isReverseCard = (card) => card.value === 'reverse';
export const isDrawCard = (card) => card.value === 'draw_two' || card.value === 'wild_draw_four';
export const isWildCard = (card) => card.color === null;