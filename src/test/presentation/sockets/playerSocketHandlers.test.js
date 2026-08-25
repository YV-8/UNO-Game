jest.mock('../../../container.js', () => ({
    playerService: {
        getAllPlayers: jest.fn(), getPlayerById: jest.fn(),
        updatePlayer: jest.fn(), deletePlayer: jest.fn(),
    },
}));
jest.mock('../../../presentation/sockets/connectionRegistry.js', () => ({
    registerConnection: jest.fn(), removeConnection: jest.fn(), getAllConnections: jest.fn(),
}));

import { playerService } from '../../../container.js';
import { registerConnection, removeConnection, getAllConnections } from '../../../presentation/sockets/connectionRegistry.js';
import { registerPlayerSocketHandlers } from '../../../presentation/sockets/playerSocketHandlers.js';
import Respond from '../../../logic/monads/respond.js';

describe('playerSocketHandlers', () => {
    let io, connectionCb, socket;

    beforeEach(() => {
        jest.clearAllMocks();
        io = { on: jest.fn((event, cb) => { if (event === 'connection') connectionCb = cb; }) };
        socket = {
            id: 's1', user: { id: 1, username: 'ale' }, handlers: {},
            on: jest.fn(function (event, cb) { this.handlers[event] = cb; }),
            emit: jest.fn(), broadcast: { emit: jest.fn() },
        };
        registerPlayerSocketHandlers(io);
        connectionCb(socket);
    });

    test('registers the connection and broadcasts presence on connect', () => {
        expect(registerConnection).toHaveBeenCalledWith('s1', 1, 'ale');
        expect(socket.broadcast.emit).toHaveBeenCalledWith('player-online', { userId: 1, username: 'ale' });
    });

    describe('get-all-players', () => {
        test('emits the full list', async () => {
            playerService.getAllPlayers.mockResolvedValue(Respond.Ok([{ id: 1 }, { id: 2 }]));
            await socket.handlers['get-all-players']();
            expect(socket.emit).toHaveBeenCalledWith('get-all-players', [{ id: 1 }, { id: 2 }]);
        });
    });

    describe('get-player', () => {
        test('emits the requested player by id', async () => {
            playerService.getPlayerById.mockResolvedValue(Respond.Ok({ id: 2, username: 'lis' }));
            await socket.handlers['get-player']({ id: 2 });
            expect(playerService.getPlayerById).toHaveBeenCalledWith(2);
            expect(socket.emit).toHaveBeenCalledWith('get-player', { id: 2, username: 'lis' });
        });
    });

    describe('update-player', () => {
        test('splits id from the rest of the payload and broadcasts the change', async () => {
            playerService.updatePlayer.mockResolvedValue(Respond.Ok({ username: 'lis2' }));
            await socket.handlers['update-player']({ id: 2, username: 'lis2' });
            expect(playerService.updatePlayer).toHaveBeenCalledWith(2, { username: 'lis2' });
            expect(socket.broadcast.emit).toHaveBeenCalledWith('player-updated', { userId: 2, username: 'lis2' });
        });

        test('does not broadcast when the update fails', async () => {
            playerService.updatePlayer.mockResolvedValue(Respond.Err({ statusCode: 400, message: 'Err' }));
            await socket.handlers['update-player']({ id: 2, username: '' });
            expect(socket.broadcast.emit).not.toHaveBeenCalledWith('player-updated', expect.anything());
        });
    });

    describe('delete-player', () => {
        test('emits the result on success', async () => {
            playerService.deletePlayer.mockResolvedValue(Respond.Ok({}));
            await socket.handlers['delete-player']({ id: 2 });
            expect(socket.emit).toHaveBeenCalledWith('delete-player', {});
        });

        test('emits an error when the player does not exist', async () => {
            playerService.deletePlayer.mockResolvedValue(Respond.Err({ statusCode: 404, message: 'Player not found' }));
            await socket.handlers['delete-player']({ id: 99 });
            expect(socket.emit).toHaveBeenCalledWith('error', { event: 'delete-player', message: 'Player not found' });
        });
    });

    describe('get-profile', () => {
        test("emits the caller's own profile", async () => {
            playerService.getPlayerById.mockResolvedValue(Respond.Ok({ username: 'ale' }));
            await socket.handlers['get-profile']();
            expect(playerService.getPlayerById).toHaveBeenCalledWith(1);
            expect(socket.emit).toHaveBeenCalledWith('get-profile', { username: 'ale' });
        });
    });

    describe('update-profile', () => {
        test("updates the caller's own profile and broadcasts", async () => {
            playerService.updatePlayer.mockResolvedValue(Respond.Ok({ username: 'ale2' }));
            await socket.handlers['update-profile']({ username: 'ale2' });
            expect(playerService.updatePlayer).toHaveBeenCalledWith(1, { username: 'ale2' });
            expect(socket.broadcast.emit).toHaveBeenCalledWith('player-updated', { userId: 1, username: 'ale2' });
        });
    });

    test('online-players emits the list built from getAllConnections', () => {
        getAllConnections.mockReturnValue([{ userId: 1, username: 'ale' }, { userId: 2, username: 'lis' }]);
        socket.handlers['online-players']();
        expect(socket.emit).toHaveBeenCalledWith('online-players', [
            { userId: 1, username: 'ale' }, { userId: 2, username: 'lis' },
        ]);
    });

    test('disconnect removes the connection and broadcasts player-offline', () => {
        socket.handlers['disconnect']();
        expect(removeConnection).toHaveBeenCalledWith('s1');
        expect(socket.broadcast.emit).toHaveBeenCalledWith('player-offline', { userId: 1 });
    });
});