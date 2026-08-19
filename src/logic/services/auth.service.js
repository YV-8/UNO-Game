import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PlayerRepository from '../../dataAccess/repositories/player.repository.js';
import { appError } from '../../middlewares/appError.js';
import { verifyAccessToken } from '../../helpers/verifyToken.js';
import { addToBlacklist } from '../../helpers/tokenBlacklist.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3h';

export const register = async ({ username, email, password }) => {
    if (!username || !email || !password) {
        throw new appError('username, email and password are required', 400);
    }

    const existingUsername = await PlayerRepository.findByUsername(username);
    if (existingUsername) {
        throw new appError('User already exists', 400);
    }

    if (!EMAIL_REGEX.test(email)) {
        throw new appError('Invalid email format', 400);
    }
    const existingEmail = await PlayerRepository.findByEmail(email);
    if (existingEmail) {
        throw new appError('Email address is already registered.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const player = await PlayerRepository.create({
        username,
        email,
        password: hashedPassword,
    });
};

export const login = async ({ username, password }) => {
    if (!username || !password) {
        throw new appError('username and password are required', 400);
    }

    const player = await PlayerRepository.findByUsername(username);
    if (!player) {
        throw new appError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
        throw new appError('Invalid credentials', 401);
    }

    const token = jwt.sign(
        { id: player.id, username: player.username },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { access_token: token };
};

export const getProfile = async (accessToken) => {
    const decoded = verifyAccessToken(accessToken);
    const player = await PlayerRepository.findById(decoded.id);
    if (!player) {
        throw new appError('Player not found', 404);
    }
    return {
        username: player.username,
        email: player.email,
    };
};

export const logout = async (accessToken) => {
    const decoded = verifyAccessToken(accessToken);
    addToBlacklist(accessToken);
    return {};
};