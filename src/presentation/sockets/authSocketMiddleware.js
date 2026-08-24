export const createAuthSocketMiddleware = ({ tokenProvider, blacklist, config, playerRepository }) => {
    return async (socket, next) => {
        const token = socket.handshake.auth?.token
            ?? socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication token is required'));
        }

        if (blacklist.has(token)) {
            return next(new Error('Token has been invalidated'));
        }

        try {
            const decoded = tokenProvider.verify(token, config.jwtSecret);
            const player = await playerRepository.findById(decoded.id);
            if (!player) {
                return next(new Error('Player not found'));
            }

            socket.user = { id: player.id, username: player.username };
            socket.token = token;
            return next();
        } catch (err) {
            return next(new Error('Invalid or expired token'));
        }
    };
};