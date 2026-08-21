import { Card } from '../models/index.js';

class CardRepository {
    async findAll() {
        return await Card.findAll();
    }

    async findById(id) {
        return await Card.findByPk(id);
    }

    async create(cardData) {
        return await Card.create(cardData);
    }

    async update(id, cardData) {
        const card = await Card.findByPk(id);
        if (!card) return null;
        return await card.update(cardData);
    }

    async delete(id) {
        const card = await Card.findByPk(id);
        if (!card) return false;
        await card.destroy();
        return true;
    }

    async bulkCreate(cardsData) {
        return await Card.bulkCreate(cardsData);
    }

    async findTopDiscardByGameId(gameId) {
        return await Card.findOne({
            where: { gameId, location: 'discard' },
            order: [['discardOrder', 'DESC']],
        });
    }

    async findByPlayerCardHand(gameId, playerId, color, value) {
        return await Card.findOne({
            where: { gameId, playerId, location: 'hand', color, value },
        });
    }

    async findDeckByGameId(gameId) {
        return await Card.findAll({ where: { gameId, location: 'deck' } });
    }

    async findDiscardByGameId(gameId) {
        return await Card.findAll({
            where: { gameId, location: 'discard' },
            order: [['discardOrder', 'DESC']],
        });
    }
    async findHandByGameAndPlayer(gameId, playerId) {
        return await Card.findAll({
            where: {
                gameId, playerId, location: 'hand'
            }
        });
    }

    async bulkUpdate(updates) {
        return await Promise.all(
            updates.map(({ id, data }) => Card.update(data, { where: { id } }))
        );
    }

    async countByGameId(gameId) {
        return await Card.count({ where: { gameId } });
    }
    async countByGameAndPlayer(gameId, playerId, location = 'hand') {
        return await Card.count({
            where: { gameId, playerId, location }
        });
    }
}

export default new CardRepository();