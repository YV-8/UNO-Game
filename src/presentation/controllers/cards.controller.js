import * as CardService from '../../logic/services/cards.service.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getAllCards = async (req, res) => {
    const result = await CardService.getAllCards();
    return handleResult(res, result, 200);
};

export const getCardById = async (req, res) => {
    const result = await CardService.getCardById(req.params.id);
    return handleResult(res, result, 200);
};

export const createCard = async (req, res) => {
    const result = await CardService.createCard(req.body);
    return handleResult(res, result, 201);
};

export const updateCard = async (req, res) => {
    const result = await CardService.updateCard(req.params.id, req.body);
    return handleResult(res, result, 200);
};

export const deleteCard = async (req, res) => {
    const result = await CardService.deleteCard(req.params.id);
    return handleResult(res, result, 200);
};

export const getTopCard = async (req, res) => {
    const id = Number(req.body?.game_id);
    const result = await CardService.getTopCard(id);
    return handleResult(res, result, 200);
};