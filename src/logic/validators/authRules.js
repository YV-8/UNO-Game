import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';
import * as authValidator from './authValidator.js';

export const validateRegister = composeAsyncValidators(
    authValidator.validateRegisterFieldsProvided,
    authValidator.validateUsernameNotTaken,
    authValidator.validateEmailFormat,
    authValidator.validateEmailNotTaken
);

export const validateLogin = composeAsyncValidators(
    authValidator.validateLoginFieldsProvided,
    authValidator.validateUserExists,
    authValidator.validatePasswordMatches
);

export const validateGetProfile = composeAsyncValidators(
    authValidator.validatePlayerExistsById
);