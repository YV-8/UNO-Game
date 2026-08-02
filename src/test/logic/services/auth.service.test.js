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

        it('debe retornar error 400 si falta un campo requerido', async () => {
            await expect(
                AuthService.register({ username: '', email: 'moni@test.com', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'username, email and password are required'
            });
        });

        it('debe retornar error 400 si el email es inválido', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            await expect(
                AuthService.register({ username: 'moni', email: 'ssjfs-843', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'Invalid email format'
            });

            expect(PlayerRepository.create).not.toHaveBeenCalled();
        });

        it('debe retornar error 400 si el email ya existe', async () => {
            PlayerRepository.findByEmail.mockResolvedValue({
                id: 5, email: 'moni@test.com'
            });

            await expect(
                AuthService.register({
                    username: 'Moni', email: 'moni@test.com', password: 'pass123'
                })
            ).rejects.toMatchObject({
                statusCode: 400, message: 'Email address is already registered.'
            });
        });

        it('debe registrar el jugador si todo es válido', async () => {
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
        it('debe retornar error 400 si falta un campo requerido', async () => {
            await expect(
                AuthService.login({ username: '', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'username and password are required'
            });
        });

        it('debe retornar error 401 si el usuario no existe', async () => {
            PlayerRepository.findByUsername.mockResolvedValue(null);
            await expect(
                AuthService.login({ username: 'nonexistent', password: '123' })
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('debe retornar error 401 si la contraseña es incorrecta', async () => {
            const mockPlayer = { id: 1, username: 'moni', password: '12334pass' };
            PlayerRepository.findByUsername.mockResolvedValue(mockPlayer);

            await expect(
                AuthService.login({ username: 'moni', password: 'pass123' })
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('debe retornar un token si las credenciales son correctas', async () => {
            const mockPlayer = { id: 1, username: 'moni', password: await bcrypt.hash('pass123', 10) };
            PlayerRepository.findByUsername.mockResolvedValue(mockPlayer);

            const result = await AuthService.login({ username: 'moni', password: 'pass123' });

            expect(result).toHaveProperty('access_token');
            expect(typeof result.access_token).toBe('string');
        });
    });

    describe('getProfile Auth -> getProfile', () => {
        it('debe retornar error 401 si el token es inválido', async () => {
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

        it('debe retornar error 404 si el jugador no existe', async () => {
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

        it('debe retornar el perfil del jugador si el token es válido', async () => {
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
        it('debe lanzar error 400 si no se pasa el token', async () => {
            verifyAccessToken.mockImplementation(() => {
                throw new appError('access_token is required', 400);
            });

            await expect(AuthService.logout()).rejects.toMatchObject({
                statusCode: 400,
                message: 'access_token is required',
            });
        });

        it('debe lanzar error 401 si el token es inválido', async () => {

            verifyAccessToken.mockImplementation(() => {
                throw new appError('Invalid token', 401);
            });

            await expect(AuthService.logout('badToken')).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid token',
            });
            expect(addToBlacklist).not.toHaveBeenCalled();
        });

        it('debe eliminar el jugador', async () => {
            const validToken = 'valid.jwt.token';
            verifyAccessToken.mockReturnValue({ id: 1, username: 'moni' });

            const result = await AuthService.logout(validToken);

            expect(addToBlacklist).toHaveBeenCalledWith(validToken);
            expect(result).toEqual({});
        });
    });
});
