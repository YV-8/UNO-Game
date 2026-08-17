import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Result from './logic/monads/respond.js';

import PlayerRepository from './dataAccess/repositories/player.repository.js';
import GameRepository from './dataAccess/repositories/game.repository.js';
import GamePlayerRepository from './dataAccess/repositories/gamePlayer.repository.js';
import CardRepository from './dataAccess/repositories/cards.repository.js';
import ScoreRepository from './dataAccess/repositories/score.repository.js';

import { addToBlacklist } from './middlewares/tokenBlacklist.js';
import { formatCard } from './helpers/unoDeck.js';

import { createAuthValidator } from './logic/validators/authValidator.js';
import { createPlayerValidator } from './logic/validators/playerValidator.js';
import { createGameValidator } from './logic/validators/gameValidator.js';
import { createCardValidator } from './logic/validators/cardValidator.js';
import { createScoreValidator } from './logic/validators/scoreValidator.js';

import { createAuthRules } from './logic/validators/authRules.js';
import { createPlayerRules } from './logic/validators/playerRules.js';
import { createGameRules } from './logic/validators/gameRules.js';
import { createCardRules } from './logic/validators/cardsRules.js';
import { createScoreRules } from './logic/validators/scoreRules.js';

import { createAuthService } from './logic/services/auth.service.js';
import { createPlayerService } from './logic/services/player.service.js';
import { createGameService } from './logic/services/game.service.js';
import { createCardService } from './logic/services/cards.service.js';
import { createScoreService } from './logic/services/score.service.js';


const hashProvider = {
    hash: (plain, rounds) => bcrypt.hash(plain, rounds),
    compare: (plain, hashed) => bcrypt.compare(plain, hashed),
};

const tokenProvider = {
    sign: (payload, secret, options) => jwt.sign(payload, secret, options),
    verify: (token, secret) => jwt.verify(token, secret),
};

// Auth
const authValidator = createAuthValidator({ playerRepository: PlayerRepository, hashProvider });
const authRules = createAuthRules(authValidator);

export const authService = createAuthService({
    playerRepository: PlayerRepository,
    authRules,
    hashProvider,
    tokenProvider,
    blacklist: { add: addToBlacklist },
    config: {
        saltRounds: 10,
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '3h',
    },
    Result,
});

// Player
const playerValidator = createPlayerValidator({ playerRepository: PlayerRepository });
const playerRules = createPlayerRules(playerValidator);

export const playerService = createPlayerService({
    playerRepository: PlayerRepository,
    playerRules,
    hashProvider,
    config: { saltRounds: 10 },
    Result,
});

//Game
const gameValidator = createGameValidator({
    gameRepository: GameRepository,
    gamePlayerRepository: GamePlayerRepository,
});
const gameRules = createGameRules(gameValidator);

export const gameService = createGameService({
    gameRepository: GameRepository,
    gamePlayerRepository: GamePlayerRepository,
    gameRules,
    Result,
});

// Cards
const cardValidator = createCardValidator({
    cardRepository: CardRepository,
    gameRepository: GameRepository,
});
const cardRules = createCardRules(cardValidator);

export const cardService = createCardService({
    cardRepository: CardRepository,
    cardRules,
    formatCard,
    Result,
});

//Score
const scoreValidator = createScoreValidator({
    scoreRepository: ScoreRepository,
    playerRepository: PlayerRepository,
    gameRepository: GameRepository,
});
const scoreRules = createScoreRules(scoreValidator);

export const scoreService = createScoreService({
    scoreRepository: ScoreRepository,
    scoreRules,
    Result,
});