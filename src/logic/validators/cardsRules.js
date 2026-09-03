import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';
import * as cardValidator from './cardValidator.js';

export const validateGetCard = composeAsyncValidators(
    cardValidator.validateIdProvided,
    cardValidator.validateCardExists
);

export const validateCreateCard = composeAsyncValidators(
    cardValidator.validateCreateFieldsProvided,
    cardValidator.validateColorValid,
    cardValidator.validateGameExistsForCard
);

export const validateUpdateCard = composeAsyncValidators(
    cardValidator.validateIdProvided,
    cardValidator.validateCardExists,
    cardValidator.validateColorValid,
    cardValidator.validateGameExistsIfGameIdProvided
);

export const validateDeleteCard = composeAsyncValidators(
    cardValidator.validateIdProvided
);

export const validateGetTopCard = composeAsyncValidators(
    cardValidator.validateIdProvided,
    cardValidator.validateGameExistsForTopCard
);