import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';

export const scoreRules = (scoreValidator) => ({

    validateGetScore: composeAsyncValidators(
        scoreValidator.validateIdProvided,
        scoreValidator.validateScoreExists
    ),

    validateCreateScore: composeAsyncValidators(
        scoreValidator.validateCreateFieldsProvided,
        scoreValidator.validateScoreIsNonNegativeNumber,
        scoreValidator.validatePlayerExistsForScore,
        scoreValidator.validateGameExistsForScore
    ),
    // sin validatePlayerExistsForScore / validateGameExistsForScore acá,
// porque en un update normalmente NO vienen playerId/gameId en el body.
    validateUpdateScore: composeAsyncValidators(
        scoreValidator.validateIdProvided,
        scoreValidator.validateScoreExists,
        scoreValidator.validateScoreIsNonNegativeNumber
    ),

    validateDeleteScore: composeAsyncValidators(
        scoreValidator.validateIdProvided
    ),

});