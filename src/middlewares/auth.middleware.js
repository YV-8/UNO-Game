import jwt from 'jsonwebtoken';
import { appError } from './appError.js';
import { isBlacklisted } from './tokenBlacklist.js';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new appError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        if (isBlacklisted(token)) {
            throw new appError('Token has been invalidated', 401);
        }

        const decoded = verifyAccessToken(token);
        req.player = decoded;
        req.token = token;
        next();
    } catch (error) {
        next(error);
    }
};

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
//func
//api/game/update
//headers