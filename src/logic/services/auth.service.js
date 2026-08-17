export const createAuthService = ({
    playerRepository, authRules, hashProvider, tokenProvider, blacklist, config, Result,
}) => {

    const register = async ({ username, email, password }) => {
        const result = await authRules.validateRegister({ username, email, password });
        if (result.isErr()) return result;

        const hashedPassword = await hashProvider.hash(password, config.saltRounds);
        await playerRepository.create({ username, email, password: hashedPassword });

        return Result.Ok({ message: 'User registered successfully' });
    };

    const login = async ({ username, password }) => {
        const result = await authRules.validateLogin({ username, password });
        if (result.isErr()) return result;

        const { player } = result.value;
        const token = tokenProvider.sign(
            { id: player.id, username: player.username },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        return Result.Ok({ access_token: token });
    };

    const getProfile = async (playerId) => {
        const result = await authRules.validateGetProfile({ playerId });
        if (result.isErr()) return result;

        const { player } = result.value;
        return Result.Ok({ username: player.username, email: player.email });
    };

    const logout = async (token) => {
        blacklist.add(token);
        return Result.Ok({ message: 'User logged out successfully' });
    };

    return { register, login, getProfile, logout };
};