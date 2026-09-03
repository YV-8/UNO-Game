export const turnResolver = ({ unoGameRules, getCardEffect }) => {
    /** turn after throw a card possible => (skip/reverse/+2/+4). */
    const resolveNextTurn = ({ activePlayers, currentIndex, direction, targetCard }) => {
        const totalPlayers = activePlayers.length;
        const effect = getCardEffect(targetCard)({ direction });

        // Caso de contexto de partida que cardEffects (puro por carta) no puede conocer
        const isTwoPlayerReverse = targetCard.value === 'reverse' && totalPlayers === 2;
        const skipTurn = effect.skipNext || isTwoPlayerReverse;

        const penalizedIndex = effect.drawPenalty > 0
            ? unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, effect.direction, false)
            : null;
        const nextIndex = unoGameRules.getNextPlayerIndex(currentIndex, totalPlayers, effect.direction, skipTurn);

        return {
            newDirection: effect.direction,
            drawPenalty: effect.drawPenalty,
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