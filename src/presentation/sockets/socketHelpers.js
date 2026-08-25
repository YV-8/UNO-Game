export const emitResult = (socket, eventName, result) => {
    if (result.isErr()) {
        socket.emit('error', { event: eventName, message: result.error.message });
        return false;
    }
    socket.emit(eventName, result.value);
    return true;
};