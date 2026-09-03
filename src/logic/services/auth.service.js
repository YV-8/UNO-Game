export const authService = ({
    playerRepository, authRules, hashProvider, tokenProvider, blacklist, config, respond,
}) => {

    const register = async ({ username, email, password }) => {
        const validation = await authRules.validateRegister({ username, email, password });
        if (validation.isErr()) return validation;

        const hashedPassword = await hashProvider.hash(password, config.saltRounds);
        await playerRepository.create({ username, email, password: hashedPassword });

        return respond.Ok({ message: 'User registered successfully' });
    };

    const login = async ({ username, password }) => {
        const validation = await authRules.validateLogin({ username, password });
        if (validation.isErr()) return validation;

        const { player } = validation.value;
        const token = tokenProvider.sign(
            { id: player.id, username: player.username },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        return respond.Ok({ access_token: token });
    };

    const getProfile = async (playerId) => {
        const validation = await authRules.validateGetProfile({ playerId });
        if (validation.isErr()) return validation;

        const { player } = validation.value;
        return respond.Ok({ username: player.username, email: player.email });
    };

    const logout = async (token) => {
        blacklist.add(token);
        return respond.Ok({ message: 'User logged out successfully' });
    };

    return { register, login, getProfile, logout };
};