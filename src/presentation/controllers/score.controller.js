import { scoreService } from '../../container.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getAllScore = async (req, res) => {
    const result = await scoreService.getAllScores();
    return handleResult(res, result, 200);
};

export const getScoreById = async (req, res) => {
    const result = await scoreService.getScores(req.params.id);
    return handleResult(res, result, 200);
};

export const createScore = async (req, res) => {
    const result = await scoreService.createScore(req.body);
    return handleResult(res, result, 201);
};

export const updateScore = async (req, res) => {
    const result = await scoreService.updateScore(req.params.id, req.body);
    return handleResult(res, result, 200);
};

export const deleteScore = async (req, res) => {
    const result = await scoreService.deleteScore(req.params.id);
    return handleResult(res, result, 200);
};