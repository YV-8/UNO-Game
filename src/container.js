import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from './Data Access/Repositories/UserRepository.js';
import { revoke, isRevoked } from './Middleware/tokenBlacklist.js';
import { createAuthValidator } from './Logic/Validators/AuthValidator.js';
import { createAuthRules } from './Logic/Validators/AuthValidatorRules.js';
import { createAuthService } from './Logic/Services/AuthService.js';

const authValidator = createAuthValidator({ userRepository });
const authRules = createAuthRules(authValidator);

export const authService = createAuthService({
    userRepository,
    hashProvider: {
        hash: (plain, rounds) => bcrypt.hash(plain, rounds),
        compare: (plain, hashed) => bcrypt.compare(plain, hashed),
    },
    tokenProvider: {
        sign: (payload, secret, options) => jwt.sign(payload, secret, options),
        verify: (token, secret) => jwt.verify(token, secret),
    },
    blacklist: { revoke, isRevoked },
    config: {
        saltRounds: 10,
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    },
});