import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';
import * as playerValidator from './playerValidator.js';

export const validateGetPlayer = composeAsyncValidators(
    playerValidator.validateIdProvided,
    playerValidator.validatePlayerExists
);

export const validateUpdatePlayer = composeAsyncValidators(
    playerValidator.validatePlayerExists,
    playerValidator.validateEmailFormatIfProvided
);

export const validateDeletePlayer = composeAsyncValidators(
    playerValidator.validateIdProvided
);