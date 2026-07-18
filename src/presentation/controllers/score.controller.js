import * as ScoreService from '../../logic/services/score.service.js';
import { sendSuccess } from '../../utils/responseHandler.js';

export const getAllScores = async (req, res, next) => {
    try {
        const scores = await ScoreService.getAllScores();
        return sendSuccess(res, 200, 'Scores retrieved successfully', scores);
    } catch (error) {
        next(error);
    }
};

export const getScoreById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const score = await ScoreService.getScoreById(id);
        return sendSuccess(res, 200, 'Score retrieved successfully', score);
    } catch (error) {
        next(error);
    }
};

export const createScore = async (req, res, next) => {
    try {
        const score = await ScoreService.createScore(req.body);
        return sendSuccess(res, 201, 'Score created successfully', score);
    } catch (error) {
        next(error);
    }
};

export const updateScore = async (req, res, next) => {
    const { id } = req.params;
    try {
        const score = await ScoreService.updateScore(id, req.body);
        return sendSuccess(res, 200, 'Score updated successfully', score);
    } catch (error) {
        next(error);
    }
};

export const deleteScore = async (req, res, next) => {
    const { id } = req.params;
    try {
        await ScoreService.deleteScore(id);
        return sendSuccess(res, 200, 'Score deleted successfully');
    } catch (error) {
        next(error);
    }
};