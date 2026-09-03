import {
    registerConnection, setConnectionGame, removeConnection,
    getSocketsInGame, getAllConnections, _resetConnectionsForTests,
} from '../../../presentation/sockets/connectionRegistry.js';

describe('connectionRegistry', () => {
    afterEach(() => {
        _resetConnectionsForTests();
    });

    const buildIo = (socketsById) => ({
        sockets: { sockets: new Map(Object.entries(socketsById)), adapter: { rooms: new Map() } },
    });

    test('registerConnection stores userId and username', () => {
        registerConnection('s1', 1, 'ale');
        const io = buildIo({ s1: { id: 's1' } });
        expect([...getAllConnections(io)][0]).toEqual({ socket: { id: 's1' }, userId: 1, username: 'ale' });
    });

    test('registerConnection defaults username to null when omitted', () => {
        registerConnection('s1', 1);
        const io = buildIo({ s1: { id: 's1' } });
        expect([...getAllConnections(io)][0].username).toBeNull();
    });

    test('setConnectionGame updates gameId and getSocketsInGame finds it', () => {
        registerConnection('s1', 1, 'ale');
        setConnectionGame('s1', 42);
        const io = buildIo({ s1: { id: 's1' } });
        io.sockets.adapter.rooms.set('game-42', new Set(['s1']));

        expect([...getSocketsInGame(io, 42)][0].userId).toBe(1);
    });

    test('setConnectionGame is a no-op for an unknown connection', () => {
        expect(() => setConnectionGame('unknown', 42)).not.toThrow();
    });

    test('removeConnection deletes the entry', () => {
        registerConnection('s1', 1, 'ale');
        removeConnection('s1');
        const io = buildIo({ s1: { id: 's1' } });
        expect([...getAllConnections(io)]).toEqual([]);
    });

    describe('getSocketsInGame', () => {
        test('yields only sockets in the given game room', () => {
            registerConnection('s1', 1, 'ale');
            registerConnection('s2', 2, 'lis');
            const io = buildIo({ s1: { id: 's1' }, s2: { id: 's2' } });
            io.sockets.adapter.rooms.set('game-1', new Set(['s1']));

            const result = [...getSocketsInGame(io, 1)];
            expect(result).toHaveLength(1);
            expect(result[0].userId).toBe(1);
        });

        test('yields nothing when the room does not exist', () => {
            expect([...getSocketsInGame(buildIo({}), 999)]).toEqual([]);
        });
    });

    describe('getAllConnections', () => {
        test('yields every registered connection with a live socket', () => {
            registerConnection('s1', 1, 'ale');
            registerConnection('s2', 2, 'lis');
            const io = buildIo({ s1: { id: 's1' }, s2: { id: 's2' } });

            expect([...getAllConnections(io)]).toHaveLength(2);
        });

        test('skips connections whose socket left io.sockets.sockets', () => {
            registerConnection('s1', 1, 'ale');
            expect([...getAllConnections(buildIo({}))]).toEqual([]);
        });
    });
});