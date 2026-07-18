import {Card} from '../models/index.js';

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
}

export default new CardRepository();