import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';

export const createAuthRules = (authValidator) => ({

    validateRegister: composeAsyncValidators(
        authValidator.validateRegisterFieldsProvided,
        authValidator.validateUsernameNotTaken,
        authValidator.validateEmailFormat,
        authValidator.validateEmailNotTaken
    ),

    validateLogin: composeAsyncValidators(
        authValidator.validateLoginFieldsProvided,
        authValidator.validateUserExists,
        authValidator.validatePasswordMatches
    ),

    validateGetProfile: composeAsyncValidators(
        authValidator.validatePlayerExistsById
    ),

});
