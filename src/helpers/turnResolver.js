export const turnResolver = ({ unoGameRules }) => {
    const resolveDirection = (currentDirection, card) =>
        unoGameRules.isReverseCard(card) ? currentDirection * -1 : currentDirection;

    const resolveSkip = (card, drawPenalty, totalPlayers, isReverse) =>
        unoGameRules.isSkipCard(card) || drawPenalty > 0 || (isReverse && totalPlayers === 2);

    /** Turno después de jugar una carta con posible efecto (skip/reverse/+2/+4). */
    const resolveNextTurn = ({ activePlayers, currentIndex, direction, targetCard }) => {
        const totalPlayers = activePlayers.length;
        const isReverse = unoGameRules.isReverseCard(targetCard);
        const newDirection = resolveDirection(direction, targetCard);
        const drawPenalty = unoGameRules.getDrawPenalty(targetCard);
        const skipTurn = resolveSkip(targetCard, drawPenalty, totalPlayers, isReverse);

        const penalizedIndex = drawPenalty > 0
            ? unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, newDirection, false)
            : null;
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, newDirection, skipTurn);

        return {
            newDirection,
            drawPenalty,
            penalizedPlayerId: penalizedIndex !== null ? activePlayers[penalizedIndex].playerId : null,
            nextPlayerId: activePlayers[nextIndex].playerId,
        };
    };

    /** Turno simple (robar carta, sin efectos): solo avanza al siguiente. */
    const resolveNextPlayer = (activePlayers, currentIndex, direction) => {
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, activePlayers.length, direction, false);
        return activePlayers[nextIndex].playerId;
    };

    return { resolveNextTurn, resolveNextPlayer };
};