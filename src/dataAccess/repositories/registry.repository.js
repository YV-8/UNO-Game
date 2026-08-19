import {Registry} from '../models/index.js';

const registryRepository = {
    create: async (data) => Registry.create(data),

    findByGameId: async (gameId) => Registry.findAll({
        where: { gameId },
        order: [['id', 'ASC']],
    }),

    findByPlayerAndGame: async (gameId, playerId) => Registry.findAll({
        where: { gameId, playerId },
        order: [['id', 'ASC']],
    }),

    findLastMoveByGameId: async (gameId) => Registry.findOne({
        where: { gameId },
        order: [['id', 'DESC']],
    }),

    deleteByGameId: async (gameId) => Registry.destroy({ where: { gameId } }),
};

export default registryRepository;