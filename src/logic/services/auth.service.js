import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import Result from '../monads/result.js';
import { addToBlacklist } from '../../helpers/tokenBlacklist.js';
import * as authRules from '../validators/authRules.js';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3h';

export const register = async ({ username, email, password }) => {
    const result = await authRules.validateRegister({ username, email, password });
    if (result.isErr()) return result;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const player = await PlayerRepository.create({ username, email, password: hashedPassword });

    return Result.Ok({ id: player.id, username: player.username, email: player.email });
};

export const login = async ({ username, password }) => {
    const result = await authRules.validateLogin({ username, password });
    if (result.isErr()) return result;

    const { player } = result.value;
    const token = jwt.sign(
        { id: player.id, username: player.username },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return Result.Ok({ access_token: token });
};

export const getProfile = async (playerId) => {
    const result = await authRules.validateGetProfile({ playerId });
    if (result.isErr()) return result;

    const { player } = result.value;
    return Result.Ok({ username: player.username, email: player.email });
};

export const logout = async (token) => {
    addToBlacklist(token);
    return Result.Ok({ message: 'User logged out successfully' });
};