import { DataTypes,Op } from 'sequelize';
import sequelize from '../database.js';
import playerModel from './player.js';
import gameModel from './game.js';
import gamePlayerModel from './gameplayer.js';
import cardModel from './cards.js';
import scoreModel from './score.js';
import registry from './registry.js';

const createModels = (sequelize) => {
    const models = {};

    models.Player = playerModel(sequelize, DataTypes);
    models.Game = gameModel(sequelize, DataTypes);
    models.GamePlayer = gamePlayerModel(sequelize, DataTypes);
    models.Card = cardModel(sequelize, DataTypes);
    models.Score = scoreModel(sequelize, DataTypes);
    models.Registry = registry(sequelize, DataTypes);

    models.sequelize = sequelize;

    Object.keys(models).forEach((name) => {
        if (models[name] && typeof models[name].associate === 'function') {
            models[name].associate(models);
        }
    });

    return models;
};
const models = createModels(sequelize);
export const { Player, Game, Card, Score, GamePlayer, Registry } = models;

export default models;