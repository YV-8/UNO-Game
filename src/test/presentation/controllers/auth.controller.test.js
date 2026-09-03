import * as AuthController from '../../../presentation/controllers/auth.controller.js';
import { authService } from '../../../container.js';
import Result from '../../../logic/monads/respond.js';
import { mockRequest, mockResponse } from '../../helpers/mockExpress.js';

jest.mock('../../../container.js', () => ({
    authService: {
        register: jest.fn(),
        login: jest.fn(),
        getProfile: jest.fn(),
        logout: jest.fn(),
    },
}));

describe('AuthController', () => {
    let res;
    beforeEach(() => {
        jest.clearAllMocks();
        res = mockResponse();
    });

    it('register: should respond 201 with the success message', async () => {
        authService.register.mockResolvedValue(Result.Ok({ message: 'User registered successfully' }));
        const req = mockRequest({ body: { username: 'moni', email: 'moni@test.com', password: '123456' } });

        await AuthController.register(req, res);

        expect(authService.register).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('register: should respond 400 with { error } on failure', async () => {
        authService.register.mockResolvedValue(Result.Err({ statusCode: 400, message: 'User already exists' }));
        const req = mockRequest({ body: { username: 'moni' } });

        await AuthController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });

    it('login: should respond 200 with access_token', async () => {
        authService.login.mockResolvedValue(Result.Ok({ access_token: 'jwt.token' }));
        const req = mockRequest({ body: { username: 'moni', password: '123456' } });

        await AuthController.login(req, res);

        expect(res.json).toHaveBeenCalledWith({ access_token: 'jwt.token' });
    });

    it('getProfile: should use req.player.id', async () => {
        authService.getProfile.mockResolvedValue(Result.Ok({ username: 'moni', email: 'moni@test.com' }));
        const req = mockRequest({ player: { id: 1 } });

        await AuthController.getProfile(req, res);

        expect(authService.getProfile).toHaveBeenCalledWith(1);
    });

    it('logout: should use req.token', async () => {
        authService.logout.mockResolvedValue(Result.Ok({ message: 'User logged out successfully' }));
        const req = mockRequest({ token: 'valid.jwt.token' });

        await AuthController.logout(req, res);

        expect(authService.logout).toHaveBeenCalledWith('valid.jwt.token');
    });
});