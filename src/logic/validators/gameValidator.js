import Respond from '../monads/respond.js';
const VALID_STATUSES = ['waiting', 'in_progress', 'finished'];
const VALID_COLORS = ['red', 'blue', 'yellow', 'green'];
export const gameValidator = ({ gameRepository, gamePlayerRepository, cardRepository, unoGameRules, parseCardString }) => ({
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

    validateCardsNotCreated: async (data) => {
        const cardCount = await cardRepository.countByGameId(data.game.id);
        if (cardCount > 0) {
            return Respond.Err({
                statusCode: 400, message: 'Cards have already been created for this game'
            });
        }
        return Respond.Ok(data);
    },

    validateTopCardExists: async (data) => {
        const topCard = await cardRepository.findTopDiscardByGameId(data.game.id);
        if (!topCard) {
            return Respond.Err({ statusCode: 404, message: 'This game has no discard pile yet' });
        }
        return Respond.Ok({ ...data, topCard });
    },

    validateCardInHand: async (data) => {
        const { gameId, playerId, cardPlayedStr } = data;
        const targetCard = parseCardString(cardPlayedStr);
        if (!targetCard) {
            return Respond.Err({ statusCode: 400, message: 'Invalid card format. Use format: "Color Value" or "Wild"' });
        }

        // Buscar en la base de datos si el jugador tiene esa carta exacta en su mano
        const playerCard = await cardRepository.findByPlayerCardHand(gameId, playerId, targetCard.color, targetCard.value);
        if (!playerCard) {
            return Respond.Err({ statusCode: 400, message: 'You do not have this card in your hand' });
        }

        return Respond.Ok({ ...data, playerCard, targetCard });
    },


    validateTurnOrder: async (data) => {
        const { game, playerId } = data;

        if (game.currentPlayerId !== playerId) {
            return Respond.Err({ statusCode: 400, message: 'It is not your turn' });
        }
        return Respond.Ok(data);
    },
    validateCardCompatible: async (data) => {
        const { game, targetCard, chosenColor } = data;
        const topDiscard = await cardRepository.findTopDiscardByGameId(game.id);
        if (!topDiscard) {
            return Respond.Err({ statusCode: 400, message: 'No discard pile found for this game' });
        }
        const isValid = unoGameRules.canPlayCard(targetCard, topDiscard, chosenColor);
        if (!isValid) {
            return Respond.Err({
                statusCode: 400,
                message: 'Invalid card. Please play a card that matches the top card on the discard pile.'
            });
        }

        return Respond.Ok({ ...data, topDiscard });
    },
    validateChosenColorForWild: async (data) => {
        const { targetCard, chosenColor } = data;
        const isWild = targetCard.color === null; // wild / wild_draw_four

        if (isWild && !VALID_COLORS.includes(chosenColor)) {
            return Respond.Err({
                statusCode: 400,
                message: 'chosenColor is required for wild cards and must be one of: red, blue, yellow, green',
            });
        }
        return Respond.Ok(data);
    },
    validateNoPlayableCard: async (data) => {
        const { game, playerId } = data;

        const topDiscard = await cardRepository.findTopDiscardByGameId(game.id);
        if (!topDiscard) {
            return Respond.Err({ statusCode: 404, message: 'No discard pile found for this game' });
        }

        const hand = await cardRepository.findHandByGameAndPlayer(game.id, playerId);
        const hasPlayableCard = hand.some((card) => unoGameRules.canPlayCard(card, topDiscard, null));

        if (hasPlayableCard) {
            return Respond.Err({
                statusCode: 400,
                message: 'You have a playable card, you must play it instead of drawing',
            });
        }

        return Respond.Ok({ ...data, topDiscard });
    },
});