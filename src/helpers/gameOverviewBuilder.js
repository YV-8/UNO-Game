export const gameOverviewBuilder = ({ unoDeck, turnRegistryBuilder }) => {
    const buildHands = (activePlayers, handsByPlayerId, viewerPlayerId) =>
        Object.fromEntries(
            activePlayers.map((p) => {
                const info = handsByPlayerId[p.playerId];
                if (p.playerId === viewerPlayerId) {
                    return [p.username, info.cards];
                }
                return [p.username, { cardCount: info.count, sayOne: p.hasSaidUno ?? p.sayOne ?? false }];
            })
        );

    const build = ({ game, activePlayers, topDiscard, handsByPlayerId, moves = [], viewerPlayerId }) => {
        const currentPlayer = activePlayers.find((p) => p.playerId === game.currentPlayerId);
        const result = turnRegistryBuilder.build({ moves, activePlayers });
        const historyList = result.registry || result.history || [];

        return {
            state: game.state,
            currentPlayer: currentPlayer?.username ?? null,
            topCard: topDiscard ? topDiscard : null,
            hands: buildHands(activePlayers, handsByPlayerId, viewerPlayerId),
            history: historyList,
        };
    };

    return { build };
};