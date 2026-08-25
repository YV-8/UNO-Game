import { emitResult } from '../../../presentation/sockets/socketHelpers.js';
import Respond from '../../../logic/monads/respond.js';

describe('emitResult', () => {
    let socket;

    beforeEach(() => {
        socket = { emit: jest.fn() };
    });

    test('emits the value and returns true on Ok', () => {
        const ok = emitResult(socket, 'my-event', Respond.Ok({ a: 1 }));
        expect(socket.emit).toHaveBeenCalledWith('my-event', { a: 1 });
        expect(ok).toBe(true);
    });

    test('emits an error event and returns false on Err', () => {
        const ok = emitResult(socket, 'my-event', Respond.Err({ statusCode: 400, message: 'Bad' }));
        expect(socket.emit).toHaveBeenCalledWith('error', { event: 'my-event', message: 'Bad' });
        expect(ok).toBe(false);
    });
});