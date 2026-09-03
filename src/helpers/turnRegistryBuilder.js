export const turnRegistryBuilder = () => {
    const formatRegistryAction = (entry) => {
        if (entry.move === 'play_card') return `Played ${entry.details?.card}`;
        if (entry.move === 'draw_card') return 'Drew a card';
        if (entry.move === 'say_uno') return 'Said UNO';
        if (entry.move === 'challenge_uno') return `Challenged ${entry.details?.challenged} for not saying UNO`;
        return entry.move;
    };

    const buildEntries = (moves, usernameByPlayerId) =>
        (moves ?? []).map((entry) => ({
            player: usernameByPlayerId[entry.playerId] ?? `Player ${entry.playerId}`,
            action: formatRegistryAction(entry),
        }));

    const build = ({ moves = [], activePlayers = [] } = {}) => {
        const usernameByPlayerId = Object.fromEntries(
            (activePlayers ?? []).map((p) => [p.playerId, p.username])
        );
        return { registry: buildEntries(moves, usernameByPlayerId) };
    };

    return { build, buildEntries };
};