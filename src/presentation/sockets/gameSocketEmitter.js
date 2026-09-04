export const emitGameStateUpdated = (io, gameId) => {
    if (!io || !gameId) return;
    io.to(`game_${gameId}`).emit('gameStateUpdated');
};
