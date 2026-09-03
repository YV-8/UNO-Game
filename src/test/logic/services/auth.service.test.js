import bcrypt from 'bcryptjs';
import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import { addToBlacklist } from '../../../middlewares/tokenBlacklist.js';
import * as AuthService from '../../../logic/services/auth.service.js';

jest.mock('../../../dataAccess/repositories/player.repository.js');
jest.mock('../../../middlewares/tokenBlacklist.js');

describe('AuthService', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('register', () => {
        it('should return Err 400 if a required field is missing', async () => {
            const result = await AuthService.register({ username: '', email: 'moni@test.com', password: '123' });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'username, email and password are required',
            });
        });

        it('should return Err 400 if the username already exists', async () => {
            PlayerRepository.findByUsername.mockResolvedValue({ id: 1, username: 'Moni' });
            const result = await AuthService.register({
                username: 'Moni', email: 'moni@test.com', password: 'pass123',
            });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'User already exists' });
            expect(PlayerRepository.create).not.toHaveBeenCalled();
        });

        it('should return Err 400 if the email format is invalid', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            const result = await AuthService.register({
                username: 'moni', email: 'ssjfs-843', password: '123',
            });
            expect(result.error).toMatchObject({ statusCode: 400, message: 'Invalid email format' });
        });

        it('should return Err 400 if the email already exists', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            PlayerRepository.findByEmail.mockResolvedValue({ id: 5, email: 'moni@test.com' });

            const result = await AuthService.register({
                username: 'Moni', email: 'moni@test.com', password: 'pass123',
            });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'Email address is already registered.',
            });
        });

        it('should return Ok with a success message if everything is valid', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            PlayerRepository.findByEmail.mockResolvedValue(null);
            PlayerRepository.create.mockResolvedValue({ id: 1, username: 'Marce', email: 'marce@test.com' });

            const result = await AuthService.register({
                username: 'Marce', email: 'marce@test.com', password: 'pass123',
            });

            expect(result.isOk()).toBe(true);
            expect(result.value).toEqual({ message: 'User registered successfully' });
            expect(PlayerRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ username: 'Marce', email: 'marce@test.com', password: expect.any(String) })
            );
        });
    });

    describe('login', () => {
        it('should return Err 400 if a required field is missing', async () => {
            const result = await AuthService.login({ username: '', password: '123' });
            expect(result.error).toMatchObject({
                statusCode: 400,
                message: 'username and password are required',
            });
        });

        it('should return Err 401 if the user does not exist', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            const result = await AuthService.login({ username: 'nonexistent', password: '123' });
            expect(result.error).toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
        });

        it('should return Err 401 if the password is incorrect', async () => {
            PlayerRepository.findByUsername.mockResolvedValue({ id: 1, username: 'moni', password: '12334pass' });
            const result = await AuthService.login({ username: 'moni', password: 'pass123' });
            expect(result.error).toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
        });

        it('should return Ok with only an access_token if credentials are correct', async () => {
            const hashedPassword = await bcrypt.hash('pass123', 10);
            PlayerRepository.findByUsername.mockResolvedValue({ id: 1, username: 'moni', password: hashedPassword });

            const result = await AuthService.login({ username: 'moni', password: 'pass123' });

            expect(result.isOk()).toBe(true);
            expect(Object.keys(result.value)).toEqual(['access_token']);
            expect(typeof result.value.access_token).toBe('string');
        });
    });

    describe('getProfile', () => {
        it('should return Err 404 if the player does not exist', async () => {
            PlayerRepository.findById.mockResolvedValue(null);
            const result = await AuthService.getProfile(666);
            expect(result.error).toMatchObject({ statusCode: 404, message: 'Player not found' });
        });

        it('should return Ok with the profile if the player exists', async () => {
            const mockPlayer = { id: 666, username: 'amore', email: 'amore@test.com' };
            PlayerRepository.findById.mockResolvedValue(mockPlayer);

            const result = await AuthService.getProfile(666);

            expect(result.value).toEqual({ username: 'amore', email: 'amore@test.com' });
        });
    });

    describe('logout', () => {
        it('should add the token to the blacklist and return Ok', async () => {
            const result = await AuthService.logout('valid.jwt.token');

            expect(addToBlacklist).toHaveBeenCalledWith('valid.jwt.token');
            expect(result.isOk()).toBe(true);
            expect(result.value).toEqual({ message: 'User logged out successfully' });
        });
    });
});