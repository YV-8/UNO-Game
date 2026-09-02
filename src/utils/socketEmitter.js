export const socketEmitter = {
    io: null,
    setIo: (ioInstance) => { 
        socketEmitter.io = ioInstance; 
    },
    emitToGame: (gameId, event, data = {}) => {
        if (socketEmitter.io) {
            socketEmitter.io.to(`game_${gameId}`).emit(event, data);
        }
    }
};
