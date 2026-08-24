import { createAuthSocketMiddleware } from './authSocketMiddleware.js';
import { registerAuthSocketHandlers } from './authSocketHandlers.js';
import { registerPlayerSocketHandlers } from './playerSocketHandlers.js';
import { registerGameSocketHandlers } from './gameSocketHandlers.js';
import { tokenProvider, blacklist, config, playerRepository } from '../../container.js';

export const setupSockets = (io) => {
    io.use(createAuthSocketMiddleware({ tokenProvider, blacklist, config, playerRepository }));

    registerAuthSocketHandlers(io);
    registerPlayerSocketHandlers(io);
    registerGameSocketHandlers(io);
};