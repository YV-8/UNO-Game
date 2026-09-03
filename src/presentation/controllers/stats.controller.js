import { statsService } from '../../container.js';
import { handleResult } from '../../helpers/handleResult.js';

export const getRequestStats = async (req, res) => {
    const result = await statsService.getRequest();
    return handleResult(res, result);
};

export const getResponseTimeStats = async (req, res) => {
    const result = await statsService.getResponseTime();
    return handleResult(res, result);
};

export const getStatusCodeStats = async (req, res) => {
    const result = await statsService.getStatusCode();
    return handleResult(res, result);
};

export const getPopularEndpoints = async (req, res) => {
    const result = await statsService.getPopularEndpoints();
    return handleResult(res, result);
};