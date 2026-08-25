import { createAuthSocketMiddleware } from './authSocketMiddleware.js';
import { registerAuthSocketHandlers } from './authSocketHandlers.js';
import { registerPlayerSocketHandlers } from './playerSocketHandlers.js';
import { registerCardsSocketHandlers } from './cardsSocketHandlers.js';
import { registerScoreSocketHandlers } from './scoreSocketHandlers.js';
import { tokenProvider, blacklist, config, playerRepository } from '../../container.js';

export const setupSockets = (io) => {
    io.use(createAuthSocketMiddleware({ tokenProvider, blacklist, config, playerRepository }));

    registerAuthSocketHandlers(io);
    registerPlayerSocketHandlers(io);
    registerCardsSocketHandlers(io);
    registerScoreSocketHandlers(io);
    // registerGameSocketHandlers(io); // reactivar cuando esté alineado
};