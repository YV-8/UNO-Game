import * as CardService from '../../logic/services/card.service.js';
import { sendSuccess } from '../../utils/responseHandler.js';

export const getAllCards = async (req, res, next) => {
    try {
        const cards = await CardService.getAllCards();
        return sendSuccess(res, 200, 'Cards retrieved successfully', cards);
    } catch (error) {
        next(error);
    }
};

export const getCardById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const card = await CardService.getCardById(id);
        return sendSuccess(res, 200, 'Card retrieved successfully', card);
    } catch (error) {
        next(error);
    }
};

export const createCard = async (req, res, next) => {
    try {
        const card = await CardService.createCard(req.body);
        return sendSuccess(res, 201, 'Card created successfully', card);
    } catch (error) {
        next(error);
    }
};

export const updateCard = async (req, res, next) => {
    const { id } = req.params;
    try {
        const card = await CardService.updateCard(id, req.body);
        return sendSuccess(res, 200, 'Card updated successfully', card);
    } catch (error) {
        next(error);
    }
};

export const deleteCard = async (req, res, next) => {
    const { id } = req.params;
    try {
        await CardService.deleteCard(id);
        return sendSuccess(res, 200, 'Card deleted successfully');
    } catch (error) {
        next(error);
    }
};