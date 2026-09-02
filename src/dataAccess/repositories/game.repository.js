import {Game} from '../models/index.js';

class GameRepository {
  async findAll() {
    return await Game.findAll();
  }

  async findById(id) {
    return await Game.findByPk(id, { include: ['creator'] });
  }

  async findByName(name) {
    return await Game.findOne({ where: { name } });
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

  async findByIdWithCurrentPlayer(id){
    return await Game.findByPk(id, {
      include: [
        {
          association: 'currentPlayer'
        }
      ]
    })
  }
}

export default new GameRepository();
