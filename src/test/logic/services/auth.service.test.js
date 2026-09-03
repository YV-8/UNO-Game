import { authService as createAuthService } from '../../../logic/services/auth.service.js';
import Result from '../../../logic/monads/respond.js';

describe('AuthService Unit Tests', () => {
    let playerRepository, authRules, hashProvider, tokenProvider, blacklist, config, authService;

    beforeEach(() => {
        playerRepository = { create: jest.fn() };
        hashProvider = { hash: jest.fn() };
        tokenProvider = { sign: jest.fn() };
        blacklist = { add: jest.fn() };
        config = { saltRounds: 10, jwtSecret: 'secret', jwtExpiresIn: '1h' };

        authRules = {
            validateRegister: jest.fn(),
            validateLogin: jest.fn(),
            validateGetProfile: jest.fn(),
        };

        authService = createAuthService({
            playerRepository, authRules, hashProvider, tokenProvider, blacklist, config, respond: Result,
        });
    });

    describe('register', () => {
        test('returns Err if validation fails', async () => {
            authRules.validateRegister.mockResolvedValue(Result.Err({ statusCode: 400, message: 'Err' }));
            const result = await authService.register({ username: '', email: '', password: '' });
            expect(result.isErr()).toBe(true);
        });

        test('hashes the password and creates the player', async () => {
            authRules.validateRegister.mockResolvedValue(Result.Ok({ username: 'ale', email: 'ale@test.com', password: 'pass123' }));
            hashProvider.hash.mockResolvedValue('hashed123');

            const result = await authService.register({ username: 'ale', email: 'ale@test.com', password: 'pass123' });

            expect(hashProvider.hash).toHaveBeenCalledWith('pass123', 10);
            expect(playerRepository.create).toHaveBeenCalledWith({
                username: 'ale', email: 'ale@test.com', password: 'hashed123',
            });
            expect(result.value).toEqual({ message: 'User registered successfully' });
        });
    });

    describe('login', () => {
        test('returns Err if validation fails', async () => {
            authRules.validateLogin.mockResolvedValue(Result.Err({ statusCode: 401, message: 'Invalid credentials' }));
            const result = await authService.login({ username: 'ale', password: 'wrong' });
            expect(result.isErr()).toBe(true);
        });

        test('returns an access token on success', async () => {
            authRules.validateLogin.mockResolvedValue(Result.Ok({ player: { id: 1, username: 'ale' } }));
            tokenProvider.sign.mockReturnValue('signed.jwt.token');

            const result = await authService.login({ username: 'ale', password: 'pass123' });

            expect(tokenProvider.sign).toHaveBeenCalledWith(
                { id: 1, username: 'ale' }, 'secret', { expiresIn: '1h' }
            );
            expect(result.value).toEqual({ access_token: 'signed.jwt.token' });
        });
    });

    describe('getProfile', () => {
        test('returns Err if the player does not exist', async () => {
            authRules.validateGetProfile.mockResolvedValue(Result.Err({ statusCode: 404, message: 'Not found' }));
            const result = await authService.getProfile(99);
            expect(result.isErr()).toBe(true);
        });

        test('returns username and email', async () => {
            authRules.validateGetProfile.mockResolvedValue(Result.Ok({ player: { username: 'ale', email: 'ale@test.com' } }));
            const result = await authService.getProfile(1);
            expect(result.value).toEqual({ username: 'ale', email: 'ale@test.com' });
        });
    });

    describe('logout', () => {
        test('blacklists the token', async () => {
            const result = await authService.logout('some.jwt.token');
            expect(blacklist.add).toHaveBeenCalledWith('some.jwt.token');
            expect(result.value).toEqual({ message: 'User logged out successfully' });
        });
    });
});