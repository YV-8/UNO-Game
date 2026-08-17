import Respond from '../monads/respond.js';
const VALID_STATUSES = ['waiting', 'in_progress', 'finished'];
export const gameValidator = ({ gameRepository, gamePlayerRepository }) => ({
    validateNameProvided: async (data) => {
        if (!data.name) {
            return Respond.Err({ statusCode: 400, message: 'name is required' });
        }
        return Respond.Ok(data);
    },

    validateNameNotTaken: async (data) => {
        const existing = await gameRepository.findByName(data.name);
        if (existing) {
            return Respond.Err({ statusCode: 400, message: 'Name is already registered.' });
        }
        return Respond.Ok(data);
    },

    validateGameExists: async (data) => {
        const numGameId = Number(data.gameId);
        if (!numGameId) {
            return Respond.Err({ statusCode: 400, message: 'game_id is required' });
        }
        const game = await gameRepository.findById(numGameId);
        if (!game) {
            return Respond.Err({ statusCode: 404, message: 'Game not found' });
        }
        return Respond.Ok({ ...data, gameId: numGameId, game });
    },

    validateIsCreator: async (data) => {
        if (data.game.creatorId !== data.playerId) {
            return Respond.Err({ statusCode: 403, message: 'Only the creator of the game can perform this action' });
        }
        return Respond.Ok(data);
    },

    validateGameStateIs: (expectedState, errorMessage) => async (data) => {
        if (data.game.state !== expectedState) {
            return Respond.Err({ statusCode: 400, message: errorMessage });
        }
        return Respond.Ok(data);
    },

    validateGameNotFinished: async (data) => {
        if (data.game.state === 'finished') {
            return Respond.Err({ statusCode: 400, message: 'The game has already finished' });
        }
        return Respond.Ok(data);
    },

    validateStatusValue: async (data) => {
        if (data.state !== undefined && !VALID_STATUSES.includes(data.state)) {
            return Respond.Err({ statusCode: 400, message: `state must be one of: ${VALID_STATUSES.join(', ')}` });
        }
        return Respond.Ok(data);
    },

    validateMinPlayers: async (data) => {
        const activePlayers = await gamePlayerRepository.findAllByGameId(data.game.id);
        if (!activePlayers || activePlayers.length < 2) {
            return Respond.Err({ statusCode: 400, message: 'Minium 2 Players must have joined to start the game' });
        }
        return Respond.Ok({ ...data, activePlayers });
    },

    validateJoinEligibility: async (data) => {
        const existingPlayer = await gamePlayerRepository.findByGameAndPlayer(data.gameId, data.playerId);

        if (existingPlayer && !existingPlayer.hasLeft) {
            return Respond.Err({ statusCode: 400, message: 'User stays in this game' });
        }
        if (!existingPlayer && data.game.state !== 'waiting') {
            return Respond.Err({ statusCode: 400, message: 'The game started, only players who already joined can rejoin' });
        }
        return Respond.Ok({ ...data, existingPlayer: existingPlayer ?? null });
    },

    validateActivePlayer: async (data) => {
        const gamePlayer = await gamePlayerRepository.findByGameAndPlayer(data.gameId, data.playerId);
        if (!gamePlayer || gamePlayer.hasLeft) {
            return Respond.Err({ statusCode: 400, message: 'User is not an active player in this game' });
        }
        return Respond.Ok({ ...data, gamePlayer });
    },
});