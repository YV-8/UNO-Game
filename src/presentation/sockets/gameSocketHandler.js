export const setupSocketHandler = (io) => {
    io.on('connection', (socket) => {
        // Client requests to listen to a specific game's events
        socket.on('joinGame', (gameId) => {
            if (gameId) {
                socket.join(`game_${gameId}`);
                console.log(`Socket ${socket.id} joined game_${gameId}`);
            }
        });

        socket.on('leaveGame', (gameId) => {
            if (gameId) {
                socket.leave(`game_${gameId}`);
            }
        });
    });
};
