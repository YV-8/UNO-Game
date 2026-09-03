import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';
import * as gameValidator from './gameValidator.js';

export const validateCreateGame = composeAsyncValidators(
    gameValidator.validateNameProvided,
    gameValidator.validateNameNotTaken
);

export const validateUpdateGame = composeAsyncValidators(
    gameValidator.validateGameExists,
    gameValidator.validateStatusValue
);

export const validateStartGame = composeAsyncValidators(
    gameValidator.validateGameExists,
    gameValidator.validateIsCreator,
    gameValidator.validateGameStateIs('waiting', 'This game cannot be started from its current state'),
    gameValidator.validateMinPlayers
);

export const validateEndGame = composeAsyncValidators(
    gameValidator.validateGameExists,
    gameValidator.validateIsCreator,
    gameValidator.validateGameStateIs('in_progress', 'This game is not in progress')
);

export const validateJoinGame = composeAsyncValidators(
    gameValidator.validateGameExists,
    gameValidator.validateGameNotFinished,
    gameValidator.validateJoinEligibility
);

export const validateLeaveGame = composeAsyncValidators(
    gameValidator.validateGameExists,
    gameValidator.validateActivePlayer
);