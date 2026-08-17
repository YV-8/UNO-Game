import { authService } from '../../container.js';
import { handleResult } from '../../helpers/handleResult.js';

export const register = async (req, res) => {
    const result = await authService.register(req.body);
    return handleResult(res, result, 201);
};

export const login = async (req, res) => {
    const result = await authService.login(req.body);
    return handleResult(res, result, 200);
};

export const getProfile = async (req, res) => {
    const result = await authService.getProfile(req.player.id);
    return handleResult(res, result, 200);
};

export const logout = async (req, res) => {
    const result = await authService.logout(req.token);
    return handleResult(res, result, 200);
};