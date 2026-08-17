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
        gameValidator.validateMinPlayers
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
});
