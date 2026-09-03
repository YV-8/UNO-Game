import PlayerRepository from '../../../dataAccess/repositories/player.repository.js';
import * as AuthService from '../../../logic/services/auth.service.js';
import { verifyAccessToken } from '../../../helpers/verifyToken.js';
import { addToBlacklist } from '../../../helpers/tokenBlacklist.js';
import { appError } from '../../../middlewares/appError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../../helpers/verifyToken.js');
jest.mock('../../../helpers/tokenBlacklist.js');
jest.mock('../../../dataAccess/repositories/player.repository.js');

describe('PlayerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Register Auth -> createPlayer', () => {

        it('should throw error 400 missing fields', async () => {
            await expect(
                AuthService.register({ username: '', email: 'moni@test.com', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'username, email and password are required'
            });
        });

        it('should throw error 400 invalid email', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            await expect(
                AuthService.register({ username: 'moni', email: 'ssjfs-843', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'Invalid email format'
            });

            expect(PlayerRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error 400 if email alredy exist', async () => {
            PlayerRepository.findByEmail.mockResolvedValue({
                id: 5, email: 'moni@test.com'});

            await expect(
                AuthService.register({
                    username: 'Moni', email: 'moni@test.com', password: 'pass123'
                })
            ).rejects.toMatchObject({
                statusCode: 400, message: 'Email address is already registered.'
            });//cambiar a 409 por reglas de error
        });

        it('should throw error 400 already exist user', async () => {
            PlayerRepository.findByUsername.mockResolvedValue({
                username:'Moni'});

            await expect(
                AuthService.register({
                    username: 'Moni', email: 'moni@test.com', password: 'pass123'
                })
            ).rejects.toMatchObject({
                statusCode: 400, message: 'User already exists'
            });
        });

        it('should throw the player is valid', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            PlayerRepository.findByEmail.mockResolvedValue(null);
            PlayerRepository.create.mockResolvedValue({
                id: 1,
                username: 'Marce', email: 'marce@test.com'
            });

            await AuthService.register({
                username: 'Marce',
                email: 'marce@test.com', password: 'pass123'
            });
            expect(PlayerRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                username: 'Marce', email: 'marce@test.com', password: expect.any(String)
                //expect.any(String) para el password hasheado
            }));
        });

    });

    describe('Login Auth -> loginPlayer', () => {
        it('should throw error 400 miss a field need', async () => {
            await expect(
                AuthService.login({ username: '', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'username and password are required'
            });
        });

        it('should throw error 401 the user doesnt exist', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            await expect(
                AuthService.login({ username: 'nonexistent', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('should throw error 401 incorrect password', async () => {
            const mockPlayer = { id: 1, username: 'moni', password: '12334pass' };
            PlayerRepository.findByUsername.mockResolvedValue(mockPlayer);

            await expect(
                AuthService.login({ username: 'moni', password: 'pass123' })
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('should throw a token the credentials are corrects', async () => {
            const mockPlayer = { id: 1, username: 'moni', password: await bcrypt.hash('pass123', 10) };
            PlayerRepository.findByUsername.mockResolvedValue(mockPlayer);

            const result = await AuthService.login({ username: 'moni', password: 'pass123' });

            expect(result).toHaveProperty('access_token');
            expect(typeof result.access_token).toBe('string');
        });
    });

    describe('getProfile Auth -> getProfile', () => {
        it('should throw error 401 ivalid token ' , async () => {
            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });
            await expect(
                AuthService.getProfile('invalidToken')
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid token'
            });
        });

        it('should throw error 404 not exist player', async () => {
            const validToken = 'valid.jwt.token';
            verifyAccessToken.mockReturnValue({ id: 666, username: 'amore' });
            PlayerRepository.findById.mockResolvedValue(null);

            await expect(
                AuthService.getProfile(validToken)
            ).rejects.toMatchObject({
                statusCode: 404,
                message: 'Player not found'
            });
        });

        it('should throw the profile the user is valid', async () => {
            const validToken = 'valid.jwt.token';
            const mockPlayer = { id: 666, username: 'amore', email: 'amore@test.com' };
            verifyAccessToken.mockReturnValue({ id: 666, username: 'amore' });
            PlayerRepository.findById.mockResolvedValue(mockPlayer);

            const result = await AuthService.getProfile(validToken);

            expect(result).toEqual({
                username: 'amore',
                email: 'amore@test.com',
            });
        });
    });
    describe('Logout', () => {
        it('should throw error 400 miss token', async () => {
            verifyAccessToken.mockImplementation(() => {
                throw new appError('access_token is required', 400);
            });

            await expect(AuthService.logout()).rejects.toMatchObject({
                statusCode: 400,
                message: 'access_token is required',
            });
        });

        it('should throw error 401 ivalid token', async () => {

            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            await expect(AuthService.logout('badToken')).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid token',
            });
            expect(addToBlacklist).not.toHaveBeenCalled();
        });

        it('should throw delete player', async () => {
            const validToken = 'valid.jwt.token';
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });

            const result = await AuthService.logout(validToken);

            expect(addToBlacklist).toHaveBeenCalledWith(validToken);
            expect(result).toEqual({});
        });
    });
});
