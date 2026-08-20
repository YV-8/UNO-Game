export const gameRegistryBuilder = ({ unoDeck }) => {
    const formatRegistryAction = (entry) => {
        if (entry.move === 'play_card') return `Played ${entry.details?.card}`;
        if (entry.move === 'draw_card') return 'Drew a card';
        if (entry.move === 'say_uno') return 'Said UNO';
        if (entry.move === 'challenge_uno') return `Challenged ${entry.details?.challenged} for not saying UNO`;
        return entry.move;
    };

    const buildHands = (activePlayers, handsByPlayerId) =>
        Object.fromEntries(
            activePlayers.map((p) => [p.username, (handsByPlayerId[p.playerId] || []).map(unoDeck.formatCard)])
        );

    const buildTurnHistory = (moves, usernameByPlayerId) =>
        moves.map((entry) => ({
            player: usernameByPlayerId[entry.playerId] ?? `Player ${entry.playerId}`,
            action: formatRegistryAction(entry),
        }));

    const build = ({ game, activePlayers, topDiscard, handsByPlayerId, moves }) => {
        const usernameByPlayerId = Object.fromEntries(activePlayers.map((p) => [p.playerId, p.username]));
        const currentPlayer = activePlayers.find((p) => p.playerId === game.currentPlayerId);

        return {
            currentPlayer: currentPlayer?.username ?? null,
            topCard: topDiscard ? unoDeck.formatCard(topDiscard) : null,
            hands: buildHands(activePlayers, handsByPlayerId),
            turnHistory: buildTurnHistory(moves, usernameByPlayerId),
        };
    };

    return { build, buildTurnHistory };
};