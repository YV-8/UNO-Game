import Registry from '../models/registry.js'; // Ajusta la ruta a tu modelo

const registryRepository = {

    // Crear un nuevo registro de movimiento
    create: async (data) => {
        return await Registry.create(data);
    },

    // Obtener todo el historial de movimientos de un juego específico
    findByGameId: async (gameId) => {
        return await Registry.findAll({
            where: { gameId },
            order: [['id', 'ASC']],
        });
    },

    // Obtener los movimientos de un jugador en un juego particular
    findByPlayerAndGame: async (gameId, playerId) => {
        return await Registry.findAll({
            where: { gameId, playerId },
            order: [['id', 'ASC']],
        });
    },

    // Obtener el último movimiento realizado en una partida
    findLastMoveByGameId: async (gameId) => {
        return await Registry.findOne({
            where: { gameId },
            order: [['id', 'DESC']],
        });
    },

    // Eliminar los registros asociados a un juego terminado
    deleteByGameId: async (gameId) => {
        return await Registry.destroy({
            where: { gameId },
        });
    },
};

export default registryRepository;