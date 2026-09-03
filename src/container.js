import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import playerRepository from './dataAccess/repositories/player.repository.js';
import gameRepository from './dataAccess/repositories/game.repository.js';
import gamePlayerRepository from './dataAccess/repositories/gamePlayer.repository.js';
import cardRepository from './dataAccess/repositories/card.repository.js';
import scoreRepository from './dataAccess/repositories/score.repository.js';
import registryRepository from './dataAccess/repositories/registry.repository.js';
import apiUsageRepository from './dataAccess/repositories/apiUsage.repository.js';

import respond from './logic/monads/respond.js';
import { addToBlacklist } from './middlewares/tokenBlacklist.js';
import { unoDeck as createUnoDeck } from './helpers/unoDeck.js';
import { unoGameRules as createUnoGameRules } from './helpers/unoGameRules.js';
import { unoCardBuilder as createUnoCardBuilder, unoCardBuilder } from './helpers/unoCardBuilder.js';
import { parseCardString } from './helpers/parseCardsString.js';
import { gameOverviewBuilder as turnOverviewFactory} from './helpers/gameOverviewBuilder.js';
import { turnRegistryBuilder as turnRegistryFactory} from './helpers/turnRegistryBuilder.js';
import { getCardEffect } from './helpers/cardEffects.js';
import { turnResolver } from './helpers/turnResolver.js';
import { trackingMiddleware } from './middlewares/withTracking.middleware.js';

import { authValidator } from './logic/validators/authValidator.js';
import { playerValidator } from './logic/validators/playerValidator.js';
import { gameValidator } from './logic/validators/gameValidator.js';
import { cardValidator } from './logic/validators/cardValidator.js';
import { scoreValidator } from './logic/validators/scoreValidator.js';

import { authRules } from './logic/validators/authRules.js';
import { playerRules } from './logic/validators/playerRules.js';
import { gameRules } from './logic/validators/gameRules.js';
import { cardRules } from './logic/validators/cardRules.js';
import { scoreRules } from './logic/validators/scoreRules.js';

import { authService as createAuthService } from './logic/services/auth.service.js';
import { playerService as createPlayerService } from './logic/services/player.service.js';
import { gameService as createGameService } from './logic/services/game.service.js';
import { cardService as createCardService } from './logic/services/card.service.js';
import { scoreService as createScoreService } from './logic/services/score.service.js';
import { statsService as createStatsService} from './logic/services/stas.service.js'
import { Registry } from './dataAccess/models/index.js';

const hashProvider = {
    hash: (plain, rounds) => bcrypt.hash(plain, rounds),
    compare: (plain, hashed) => bcrypt.compare(plain, hashed),
};

const tokenProvider = {
    sign: (payload, secret, options) => jwt.sign(payload, secret, options),
    verify: (token, secret) => jwt.verify(token, secret),
};

// Auth
const builtAuthValidator = authValidator({ playerRepository, hashProvider });
const builtAuthRules = authRules(builtAuthValidator);

export const authService = createAuthService({
    playerRepository,
    authRules: builtAuthRules,
    hashProvider,
    tokenProvider,
    blacklist: { add: addToBlacklist },
    config: {
        saltRounds: 10,
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    },
    respond,
});
// Player
const builtPlayerValidator = playerValidator({ playerRepository });
const builtPlayerRules = playerRules(builtPlayerValidator);

export const playerService = createPlayerService({
    playerRepository,
    playerRules: builtPlayerRules,
    hashProvider,
    config: { saltRounds: 10 },
    respond,
});

// Game
const builtUnoDeck = createUnoDeck();
const builtUnoGameRules = createUnoGameRules({ unoDeck: builtUnoDeck, parseCardString });
const builtTurnResolver = turnResolver({ unoGameRules: builtUnoGameRules, getCardEffect });
const builtTurnRegistryBuilder = turnRegistryFactory();
const builtGameOverviewBuilder = turnOverviewFactory({
    unoDeck: builtUnoDeck,
    turnRegistryBuilder: builtTurnRegistryBuilder,
});

const builtGameValidator = gameValidator({
    gameRepository,
    gamePlayerRepository,
    cardRepository,
    unoGameRules: builtUnoGameRules,
    parseCardString,
});
const builtGameRules = gameRules(builtGameValidator);

const builtUnoCardBuilder = unoCardBuilder({
    unoDeck: builtUnoDeck,
    unoGameRules: builtUnoGameRules,
    cardRepository,
});
export const gameService = createGameService({
    gameRepository,
    cardRepository,
    gamePlayerRepository,
    registryRepository,
    scoreRepository,
    gameRules: builtGameRules,
    unoDeck: builtUnoDeck,
    unoGameRules: builtUnoGameRules,
    unoCardBuilder: builtUnoCardBuilder,
    turnResolver: builtTurnResolver,
    gameOverviewBuilder: builtGameOverviewBuilder,
    turnRegistryBuilder: builtTurnRegistryBuilder,
    respond,
});

// Cards
const builtCardValidator = cardValidator({
    cardRepository,
    gameRepository,
});
const builtCardRules = cardRules(builtCardValidator);

export const cardService = createCardService({
    cardRepository,
    gameRepository,
    gamePlayerRepository,
    registryRepository,
    cardRules: builtCardRules,
    respond,
});

// Score
const builtScoreValidator = scoreValidator({
    scoreRepository,
    playerRepository,
    gameRepository,
});
const builtScoreRules = scoreRules(builtScoreValidator);

export const scoreService = createScoreService({
    scoreRepository,
    scoreRules: builtScoreRules,
    respond,
});

//Stats
export const withTracking = trackingMiddleware({
    apiUsageRepository,
});

export const statsService = createStatsService({
    apiUsageRepository,
    respond,
});
