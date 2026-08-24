import { authService } from '../../container.js';
import { removeConnection } from './connectionRegistry.js';

const emitResult = (socket, eventName, result) => {
    if (result.isErr()) {
        socket.emit('error', { event: eventName, message: result.error.message });
        return false;
    }
    socket.emit(eventName, result.value);
    return true;
};

export const registerAuthSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        socket.on('logout', async () => {
            const result = await authService.logout(socket.token);
            if (!emitResult(socket, 'logout', result)) return;

            removeConnection(socket.id);
            socket.disconnect(true);
        });
    });
};