import { GamePlayer } from '../models/index.js';

class GamePlayerRepository {
    async findAllByGameId(gameId) {
        return await GamePlayer.findAll({
            where: { gameId },
            order: [['turnOrder', 'ASC']],
        });
    }

    async findByGameAndPlayer(gameId, playerId) {
        return await GamePlayer.findOne({ where: { gameId, playerId } });
    }

    async countByGameId(gameId) {
        return await GamePlayer.count({ where: { gameId } });
    }

    async create(gamePlayerData) {
        return await GamePlayer.create(gamePlayerData);
    }

    async update(id, gamePlayerData) {
        const gamePlayer = await GamePlayer.findByPk(id);
        if (!gamePlayer) return null;
        return await gamePlayer.update(gamePlayerData);
    }

    async delete(id) {
        const gamePlayer = await GamePlayer.findByPk(id);
        if (!gamePlayer) return false;
        await gamePlayer.destroy();
        return true;
    }

    async countActiveByGameId(gameId) {
        return await GamePlayer.count({
            where: {
                gameId: gameId,
                hasLeft: false
            }
        });
    }
}

export default new GamePlayerRepository();
