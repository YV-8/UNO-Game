import {Player} from '../models/index.js';

class PlayerRepository {
  async findAll() {
    return await Player.findAll();
  }

  async findById(id) {
    return await Player.findByPk(id);
  }

  async findByUsername(username) {
    return await Player.scope('withPassword').findOne({ where: { username } });
  }

  async findByEmail(email) {
    return await Player.findOne({ where: { email } });
  }

  async create(playerData) {
    return await Player.create(playerData);
  }

  async update(id, playerData) {
    const player = await Player.findByPk(id);
    if (!player) return null;
    return await player.update(playerData);
  }

  async delete(id) {
    const player = await Player.findByPk(id);
    if (!player) return false;
    await player.destroy();
    return true;
  }
}

export default new PlayerRepository();
