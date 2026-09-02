export const scoreService = ({ scoreRepository, scoreRules, validationresponde, hashProvider, tokenProvider, blacklist, config, respond }) => {

    const getAllScores = async () => {
        const scores = await scoreRepository.findAll();
        return respond.Ok(scores);
    };

    const getScoreById = async (id) => {
        const validation = await scoreRules.validateGetScore({ id });
        if (validation.isErr()) return validation;
        return respond.Ok(validation.value.existingScore);
    };

    const createScore = async ({ playerId, gameId, score }) => {
        const validation = await scoreRules.validateCreateScore({ playerId, gameId, score });
        if (validation.isErr()) return validation;

        const createdScore = await scoreRepository.create({ playerId, gameId, score });
        return respond.Ok(createdScore);
    };

    const updateScore = async (id, data) => {
        const validation = await scoreRules.validateUpdateScore({ id, ...data });
        if (validation.isErr()) return validation;

        const { existingScore, playerId, gameId, score } = validation.value;
        const updatedData = {
            playerId: playerId ?? existingScore.playerId,
            gameId: gameId ?? existingScore.gameId,
            score: score ?? existingScore.score,
        };

        const updatedScore = await scoreRepository.update(id, updatedData);
        return respond.Ok(updatedScore);
    };

    const deleteScore = async (id) => {
        const validation = await scoreRules.validateDeleteScore({ id });
        if (validation.isErr()) return validation;

        const deleted = await scoreRepository.delete(id);
        if (!deleted) return respond.Err({ statusCode: 404, message: 'Score not found' });
        return respond.Ok({});
    };
    const getScores = async (id) => {
        const numGameId = Number(id);
        if (!numGameId) return respond.Err({ statusCode: 400, message: 'ID is required' });

        const [game, activePlayers, scoreRows] = await Promise.all([
            gameRepository.findById(numGameId),
            gamePlayerRepository.findAllByGameId(numGameId),
            scoreRepository.findAllByGameId(numGameId),
        ]);
        if (!game) return respond.Err({ statusCode: 404, message: 'Game not found' });

        const usernameByPlayerId = Object.fromEntries(activePlayers.map((p) => [p.playerId, p.username]));
        const scores = Object.fromEntries(
            scoreRows.map((row) => [usernameByPlayerId[row.playerId] ?? `Player ${row.playerId}`, row.score])
        );

        return respond.Ok({ scores });
    };

    return { getAllScores, getScoreById, createScore, updateScore, deleteScore, getScores };
};