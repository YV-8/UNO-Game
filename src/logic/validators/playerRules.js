import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';

export const playerRules = (playerValidator) => ({

    validateGetPlayer: composeAsyncValidators(
        playerValidator.validateIdProvided,
        playerValidator.validatePlayerExists
    ),

    validateUpdatePlayer: composeAsyncValidators(
        playerValidator.validatePlayerExists,
        playerValidator.validateEmailFormatIfProvided
    ),

    validateDeletePlayer: composeAsyncValidators(
        playerValidator.validateIdProvided
    ),

});