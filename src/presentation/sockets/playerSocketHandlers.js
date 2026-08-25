import { playerService } from '../../container.js';
import { registerConnection, removeConnection, getAllConnections } from './connectionRegistry.js';
import { emitResult } from './socketHelpers.js';

export const registerPlayerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        registerConnection(socket.id, socket.user.id, socket.user.username);
        socket.broadcast.emit('player-online', { userId: socket.user.id, username: socket.user.username });

        // --- Espejo 1:1 del CRUD administrativo de player.controller.js ---
        socket.on('get-all-players', async () => {
            const result = await playerService.getAllPlayers();
            emitResult(socket, 'get-all-players', result);
        });

        socket.on('get-player', async ({ id }) => {
            const result = await playerService.getPlayerById(id);
            emitResult(socket, 'get-player', result);
        });

        socket.on('update-player', async ({ id, ...data }) => {
            const result = await playerService.updatePlayer(id, data);
            if (!emitResult(socket, 'update-player', result)) return;
            socket.broadcast.emit('player-updated', { userId: id, username: result.value.username });
        });

        socket.on('delete-player', async ({ id }) => {
            const result = await playerService.deletePlayer(id);
            emitResult(socket, 'delete-player', result);
        });

        // --- Perfil propio + presencia (atado a socket.user, no a un id externo) ---
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