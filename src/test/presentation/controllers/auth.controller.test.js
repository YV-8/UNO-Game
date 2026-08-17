import * as AuthController from '../../../presentation/controllers/auth.controller.js';
import * as AuthService from '../../../logic/services/auth.service.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../logic/services/auth.service.js');

describe('AuthController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    describe('register', () => {
        it('should respond 201 with { message }', async () => {
            const req = mockRequest({ body: { username: 'moni', email: 'moni@test.com', password: '123456' } });
            AuthService.register.mockResolvedValue(Result.Ok({ message: 'User registered successfully' }));

            await AuthController.register(req, res);

            expect(AuthService.register).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
        });

        it('should respond 400 with { error } if it fails', async () => {
            const req = mockRequest({ body: { username: 'moni' } });
            AuthService.register.mockResolvedValue(
                Result.Err({ statusCode: 400, message: 'User already exists' })
            );

            await AuthController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
        });
    });

    describe('login', () => {
        it('should respond 200 with only access_token', async () => {
            const req = mockRequest({ body: { username: 'moni', password: '123456' } });
            AuthService.login.mockResolvedValue(Result.Ok({ access_token: 'jwt.token.here' }));

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ access_token: 'jwt.token.here' });
        });

        it('should respond 401 with { error } if credentials are invalid', async () => {
            const req = mockRequest({ body: { username: 'moni', password: 'wrong' } });
            AuthService.login.mockResolvedValue(Result.Err({ statusCode: 401, message: 'Invalid credentials' }));

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });
    });

    describe('getProfile', () => {
        it('should use req.player.id (set by the authenticate middleware)', async () => {
            const req = mockRequest({ player: { id: 1, username: 'moni' } });
            AuthService.getProfile.mockResolvedValue(Result.Ok({ username: 'moni', email: 'moni@test.com' }));

            await AuthController.getProfile(req, res);

            expect(AuthService.getProfile).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ username: 'moni', email: 'moni@test.com' });
        });
    });

    describe('logout', () => {
        it('should use req.token (set by the authenticate middleware)', async () => {
            const req = mockRequest({ token: 'valid.jwt.token' });
            AuthService.logout.mockResolvedValue(Result.Ok({ message: 'User logged out successfully' }));

            await AuthController.logout(req, res);

            expect(AuthService.logout).toHaveBeenCalledWith('valid.jwt.token');
            expect(res.json).toHaveBeenCalledWith({ message: 'User logged out successfully' });
        });
    });
});