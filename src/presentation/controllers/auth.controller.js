import * as AuthService from '../../logic/services/auth.service.js';
import { handleResult } from '../../helpers/handleResult.js';

export const register = async (req, res) => {
    const result = await AuthService.register(req.body);
    return handleResult(res, result, 201);
};

export const login = async (req, res) => {
    const result = await AuthService.login(req.body);
    return handleResult(res, result, 200);
};

export const getProfile = async (req, res) => {
    const result = await AuthService.getProfile(req.player.id);
    return handleResult(res, result, 200);
};

export const logout = async (req, res) => {
    const result = await AuthService.logout(req.token);
    return handleResult(res, result, 200);
};