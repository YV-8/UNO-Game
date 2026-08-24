const connections = new Map(); // socketId -> { userId, username, gameId }

export const registerConnection = (socketId, userId, username = null) => {
    connections.set(socketId, { userId, username, gameId: null });
};

export const setConnectionGame = (socketId, gameId) => {
    const entry = connections.get(socketId);
    if (entry) entry.gameId = gameId;
};

export const removeConnection = (socketId) => {
    connections.delete(socketId);
};

export function* getSocketsInGame(io, gameId) {
    const room = io.sockets.adapter.rooms.get(`game-${gameId}`);
    if (!room) return;

    for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        const connection = connections.get(socketId);
        if (socket && connection) {
            yield { socket, userId: connection.userId };
        }
    }
}

export function* getAllConnections(io) {
    for (const [socketId, { userId, username }] of connections.entries()) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) yield { socket, userId, username };
    }
}

export const _resetConnectionsForTests = () => connections.clear();