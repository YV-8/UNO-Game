import { cardService } from '../../container.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getAllCards = async (req, res) => {
    const result = await cardService.getAllCards();
    return handleResult(res, result, 200);
};

export const getCardById = async (req, res) => {
    const result = await cardService.getCardById(req.params.id);
    return handleResult(res, result, 200);
};

export const createCard = async (req, res) => {
    const result = await cardService.createCard(req.body);
    return handleResult(res, result, 201);
};

export const updateCard = async (req, res) => {
    const result = await cardService.updateCard(req.params.id, req.body);
    return handleResult(res, result, 200);
};

export const deleteCard = async (req, res) => {
    const result = await cardService.deleteCard(req.params.id);
    return handleResult(res, result, 200);
};
