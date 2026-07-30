import jwt from 'jsonwebtoken';
import { appError } from '../middlewares/appError.js';
import { isBlacklisted } from './tokenBlacklist.js';

export const verifyAccessToken = (token) => {
    if (!token) {
        throw new appError('access_token is required', 400);
    }

    if (isBlacklisted(token)) {
        throw new appError('Token has been invalidated', 401);
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new appError('Token has expired', 401);
        }
        throw new appError('Invalid token', 401);
    }
};