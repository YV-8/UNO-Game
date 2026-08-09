import * as ScoreService from '../../logic/services/score.service.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getAllScore = async (req, res) => {
    const result = await ScoreService.getAllScores();
    return handleResult(res, result, 200);
};

export const getScoreById = async (req, res) => {
    const result = await ScoreService.getScoreById(req.params.id);
    return handleResult(res, result, 200);
};

export const createScore = async (req, res) => {
    const result = await ScoreService.createScore(req.body);
    return handleResult(res, result, 201);
};

export const updateScore = async (req, res) => {
    const result = await ScoreService.updateScore(req.params.id, req.body);
    return handleResult(res, result, 200);
};

export const deleteScore = async (req, res) => {
    const result = await ScoreService.deleteScore(req.params.id);
    return handleResult(res, result, 200);
};