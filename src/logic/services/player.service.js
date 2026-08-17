export const playerService = ({ playerRepository, playerRules, hashProvider, config, respond }) => {

  const getAllPlayers = async () => {
    const players = await playerRepository.findAll();
    return respond.Ok(players);
  };

  const getPlayerById = async (id) => {
    const validation = await playerRules.validateGetPlayer({ id });
    if (validation.isErr()) return validation;
    return respond.Ok(validation.value.player);
  };

  const updatePlayer = async (id, data) => {
    const validation = await playerRules.validateUpdatePlayer({ id, ...data });
    if (validation.isErr()) return validation;

    const { player, username, email, password } = validation.value;
    const updatedData = {
      username: username ?? player.username,
      email: email ?? player.email,
    };
    if (password) {
      updatedData.password = await hashProvider.hash(password, config.saltRounds);
    }

    const updatedPlayer = await playerRepository.update(id, updatedData);
    return respond.Ok(updatedPlayer);
  };

  const deletePlayer = async (id) => {
    const validation = await playerRules.validateDeletePlayer({ id });
    if (validation.isErr()) return validation;

    const deleted = await playerRepository.delete(id);
    if (!deleted) return respond.Err({ statusCode: 404, message: 'Player not found' });
    return respond.Ok({});
  };

  return { getAllPlayers, getPlayerById, updatePlayer, deletePlayer };
};