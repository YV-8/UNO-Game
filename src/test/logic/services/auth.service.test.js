import Result from '../../../logic/monads/respond.js';
import { createAuthValidator } from '../../../logic/validators/authValidator.js';
import { createAuthRules } from '../../../logic/validators/authRules.js';
import { createAuthService } from '../../../logic/services/auth.service.js';

describe('AuthService (DI, sin jest.mock)', () => {
    const buildService = (overrides = {}) => {
        const playerRepository = {
            create: jest.fn(),
            findByUsername: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            ...overrides.playerRepository,
        };
        const hashProvider = {
            hash: jest.fn().mockResolvedValue('hashed_pw'),
            compare: jest.fn(),
            ...overrides.hashProvider,
        };
        const tokenProvider = {
            sign: jest.fn().mockReturnValue('fake.jwt.token'),
            ...overrides.tokenProvider,
        };
        const blacklist = { add: jest.fn(), ...overrides.blacklist };
        const config = { saltRounds: 10, jwtSecret: 'test_secret', jwtExpiresIn: '3h' };

        const authValidator = createAuthValidator({ playerRepository, hashProvider });
        const authRules = createAuthRules(authValidator);
        const service = createAuthService({
            playerRepository, authRules, hashProvider, tokenProvider, blacklist, config, Result,
        });

        return { service, playerRepository, hashProvider, tokenProvider, blacklist };
    };

    describe('register', () => {
        it('should return Err 400 if a required field is missing', async () => {
            const { service } = buildService();
            const result = await service.register({ username: '', email: 'moni@test.com', password: '123' });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'username, email and password are required',
            });
        });

        it('should return Err 400 if the username already exists', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findByUsername.mockResolvedValue({ id: 1, username: 'moni' });

            const result = await service.register({ username: 'moni', email: 'moni@test.com', password: '123456' });

            expect(result.error).toMatchObject({ statusCode: 400, message: 'User already exists' });
            expect(playerRepository.create).not.toHaveBeenCalled();
        });

        it('should return Err 400 if the email format is invalid', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findByUsername.mockResolvedValue(null);

            const result = await service.register({ username: 'moni', email: 'invalid', password: '123456' });

            expect(result.error).toMatchObject({ statusCode: 400, message: 'Invalid email format' });
        });

        it('should return Err 400 if the email already exists', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findByUsername.mockResolvedValue(null);
            playerRepository.findByEmail.mockResolvedValue({ id: 5, email: 'moni@test.com' });

            const result = await service.register({ username: 'moni', email: 'moni@test.com', password: '123456' });

            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'Email address is already registered.',
            });
        });

        it('should register the player and return a success message', async () => {
            const { service, playerRepository, hashProvider } = buildService();
            playerRepository.findByUsername.mockResolvedValue(null);
            playerRepository.findByEmail.mockResolvedValue(null);
            playerRepository.create.mockResolvedValue({ id: 1 });

            const result = await service.register({ username: 'Marce', email: 'marce@test.com', password: 'pass123' });

            expect(hashProvider.hash).toHaveBeenCalledWith('pass123', 10);
            expect(playerRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ username: 'Marce', email: 'marce@test.com', password: 'hashed_pw' })
            );
            expect(result.value).toEqual({ message: 'User registered successfully' });
        });
    });

    describe('login', () => {
        it('should return Err 400 if a required field is missing', async () => {
            const { service } = buildService();
            const result = await service.login({ username: '', password: '123' });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'username and password are required',
            });
        });

        it('should return Err 401 if the user does not exist', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findByUsername.mockResolvedValue(null);

            const result = await service.login({ username: 'nope', password: '123456' });

            expect(result.error).toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
        });

        it('should return Err 401 if the password does not match', async () => {
            const { service, playerRepository, hashProvider } = buildService();
            playerRepository.findByUsername.mockResolvedValue({ id: 1, username: 'moni', password: 'hashed' });
            hashProvider.compare.mockResolvedValue(false);

            const result = await service.login({ username: 'moni', password: 'wrong' });

            expect(result.error).toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
        });

        it('should return Ok with an access_token if credentials are correct', async () => {
            const { service, playerRepository, hashProvider, tokenProvider } = buildService();
            playerRepository.findByUsername.mockResolvedValue({ id: 1, username: 'moni', password: 'hashed' });
            hashProvider.compare.mockResolvedValue(true);

            const result = await service.login({ username: 'moni', password: 'pass123' });

            expect(tokenProvider.sign).toHaveBeenCalledWith(
                { id: 1, username: 'moni' },
                'test_secret',
                { expiresIn: '3h' }
            );
            expect(result.value).toEqual({ access_token: 'fake.jwt.token' });
        });
    });

    describe('getProfile', () => {
        it('should return Err 404 if the player does not exist', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findById.mockResolvedValue(null);

            const result = await service.getProfile(666);

            expect(result.error).toMatchObject({ statusCode: 404, message: 'Player not found' });
        });

        it('should return Ok with the profile if the player exists', async () => {
            const { service, playerRepository } = buildService();
            playerRepository.findById.mockResolvedValue({ id: 666, username: 'amore', email: 'amore@test.com' });

            const result = await service.getProfile(666);

            expect(result.value).toEqual({ username: 'amore', email: 'amore@test.com' });
        });
    });

    describe('logout', () => {
        it('should add the token to the blacklist and return Ok', async () => {
            const { service, blacklist } = buildService();

            const result = await service.logout('valid.jwt.token');

            expect(blacklist.add).toHaveBeenCalledWith('valid.jwt.token');
            expect(result.value).toEqual({ message: 'User logged out successfully' });
        });
    });
});