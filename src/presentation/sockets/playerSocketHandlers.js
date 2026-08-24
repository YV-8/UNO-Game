import { playerService } from '../../container.js';
import { registerConnection, removeConnection, getAllConnections } from './connectionRegistry.js';

const emitResult = (socket, eventName, result) => {
    if (result.isErr()) {
        socket.emit('error', { event: eventName, message: result.error.message });
        return false;
    }
    socket.emit(eventName, result.value);
    return true;
};

export const registerPlayerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        registerConnection(socket.id, socket.user.id, socket.user.username);
        socket.broadcast.emit('player-online', { userId: socket.user.id, username: socket.user.username });

        socket.on('get-profile', async () => {
            const result = await playerService.getPlayerById(socket.user.id);
            emitResult(socket, 'get-profile', result);
        });

        socket.on('update-profile', async (payload) => {
            const result = await playerService.updatePlayer(socket.user.id, payload);
            if (!emitResult(socket, 'update-profile', result)) return;

            socket.broadcast.emit('player-updated', { userId: socket.user.id, username: result.value.username });
        });

        socket.on('online-players', () => {
            const online = [...getAllConnections(io)].map(({ userId, username }) => ({ userId, username }));
            socket.emit('online-players', online);
        });

        socket.on('disconnect', () => {
            removeConnection(socket.id);
            socket.broadcast.emit('player-offline', { userId: socket.user.id });
        });
    });
};