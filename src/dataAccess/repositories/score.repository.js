import { Score } from '../models/index.js';

class ScoreRepository {
    async findAll() {
        return await Score.findAll();
    }

    async findById(id) {
        return await Score.findByPk(id);
    }

    async create(scoreData) {
        return await Score.create(scoreData);
    }

    async update(id, scoreData) {
        const score = await Score.findByPk(id);
        if (!score) return null;
        return await score.update(scoreData);
    }

    async delete(id) {
        const score = await Score.findByPk(id);
        if (!score) return false;
        await score.destroy();
        return true;
    }
    async findAllByGameId(gameId) {
        return await Score.findAll({ where: { gameId } });
    }

    async findByGameAndPlayer(gameId, playerId) {
        return await Score.findOne({ where: { gameId, playerId } });
    }
}

export default new ScoreRepository();