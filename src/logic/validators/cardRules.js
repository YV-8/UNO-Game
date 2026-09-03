import { composeAsyncValidators } from '../../helpers/composeAsyncValidators.js';

export const cardRules = (cardValidator) => ({

    validateGetCard: composeAsyncValidators(
        cardValidator.validateIdProvided,
        cardValidator.validateCardExists
    ),

    validateCreateCard: composeAsyncValidators(
        cardValidator.validateCreateFieldsProvided,
        cardValidator.validateColorValid,
        cardValidator.validateGameExistsForCard
    ),

    validateUpdateCard: composeAsyncValidators(
        cardValidator.validateIdProvided,
        cardValidator.validateCardExists,
        cardValidator.validateColorValid,
        cardValidator.validateGameExistsIfGameIdProvided
    ),

    validateDeleteCard: composeAsyncValidators(
        cardValidator.validateIdProvided
    ),

    validateGetTopCard: composeAsyncValidators(
        cardValidator.validateIdProvided,
        cardValidator.validateGameExistsForTopCard
    ),

    validateDealInitialCards: composeAsyncValidators(
        cardValidator.validateGameIdProvided,
        cardValidator.validateGameExistsById,
        cardValidator.validateGameInProgress,
        cardValidator.validateCardsNotDealtYet
    ),

});