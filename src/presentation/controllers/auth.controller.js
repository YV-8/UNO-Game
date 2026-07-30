import * as AuthService from '../../logic/services/auth.service.js';
import { sendSuccess } from '../../helpers/responseHandler.middleware.js';
import { appError } from '../../middlewares/appError.js';

export const register = async (req, res, next) => {
    try {
        const player = await AuthService.register(req.body);
        return sendSuccess(res, 201, 'User registered successfully', player);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await AuthService.login(req.body);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const { access_token: accessToken } = req.body;
        const profile = await AuthService.getProfile(accessToken);
        return res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const { access_token: accessToken } = req.body;
        await AuthService.logout(accessToken);
        return sendSuccess(res, 200, 'User logged out successfully');
    } catch (error) {
        next(error);
    }
};