import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';
import * as scoreValidator from './scoreValidator.js';

export const validateGetScore = composeAsyncValidators(
    scoreValidator.validateIdProvided,
    scoreValidator.validateScoreExists
);

export const validateCreateScore = composeAsyncValidators(
    scoreValidator.validateCreateFieldsProvided,
    scoreValidator.validateScoreIsNonNegativeNumber,
    scoreValidator.validatePlayerExistsForScore,
    scoreValidator.validateGameExistsForScore
);

// OJO: sin validatePlayerExistsForScore / validateGameExistsForScore acá,
// porque en un update normalmente NO vienen playerId/gameId en el body.
export const validateUpdateScore = composeAsyncValidators(
    scoreValidator.validateIdProvided,
    scoreValidator.validateScoreExists,
    scoreValidator.validateScoreIsNonNegativeNumber
);

export const validateDeleteScore = composeAsyncValidators(
    scoreValidator.validateIdProvided
);