import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';

export const gameRules = (gameValidator) => ({
    validateCreateGame: composeAsyncValidators(
        gameValidator.validateNameProvided,
        gameValidator.validateNameNotTaken
    ),

    validateUpdateGame: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateStatusValue
    ),

    validateStartGame: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateIsCreator,
        gameValidator.validateGameStateIs('waiting', 'This game cannot be started from its current state'),
        gameValidator.validateMinPlayers,
        gameValidator.validateCardsNotCreated
    ),

    validateEndGame: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateIsCreator,
        gameValidator.validateGameStateIs('in_progress', 'This game is not in progress')
    ),

    validateJoinGame: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateGameNotFinished,
        gameValidator.validateJoinEligibility
    ),

    validateLeaveGame: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateActivePlayer
    ),
    validateGetTopCard: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateTopCardExists
    ),
        validateGetGameScores: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateActivePlayer
    ),
    validateSuggestCard: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateGameNotFinished,
        gameValidator.validateActivePlayer
    ),
    validatePlayCard: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateGameNotFinished,
        gameValidator.validateActivePlayer,
        gameValidator.validateBodyPlayerMatchesToken,
        gameValidator.validateTurnOrder,
        gameValidator.validateCardInHand,
        gameValidator.validateChosenColorForWild,
        gameValidator.validateCardCompatible
    ),
    validateGetPlayerHand: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateActivePlayer
    ),
    validateDrawCard: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateGameNotFinished,
        gameValidator.validateActivePlayer,
        gameValidator.validateBodyPlayerMatchesToken,
        gameValidator.validateTurnOrder,
        gameValidator.validateNoPlayableCard
    ),
    validateGetGameOverview: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateActivePlayer
    ),
    validateSayUno: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateGameNotFinished,
        gameValidator.validateActivePlayer,
        gameValidator.validateBodyPlayerMatchesToken,
        gameValidator.validateCanSayUno
    ),
    validateChallengeUno: composeAsyncValidators(
        gameValidator.validateGameExists,
        gameValidator.validateGameNotFinished,
        gameValidator.validateActivePlayer,
        gameValidator.validateChallengedPlayerExists,
        gameValidator.validateNotSelfChallenge,
        gameValidator.validateChallengeIsValid
    ),
});
