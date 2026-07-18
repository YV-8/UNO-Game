import Game from '../models/game.model.js';
import './dataAccess/models/index.js';

class GameRepository {
  async findAll() {
    return await Game.findAll();
  }

  async findById(id) {
    return await Game.findByPk(id);
  }

  async findByTitle(title) {
    return await Game.findOne({ where: { title } });
  }

  async create(gameData) {
    return await Game.create(gameData);
  }

  async update(id, gameData) {
    const game = await Game.findByPk(id);
    if (!game) return null;
    return await game.update(gameData);
  }

  async delete(id) {
    const game = await Game.findByPk(id);
    if (!game) return false;
    await game.destroy();
    return true;
  }
}

export default new GameRepository();
