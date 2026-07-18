import { DataTypes } from 'sequelize';
import sequelize from '../database.js';
import playerModel from './player.model.js';
import gameModel from './game.model.js';
import cardModel from './cards.model.js';
import scoreModel from './score.model.js';

const createModels = (sequelize) => {
    const models = {};

    models.Player = playerModel(sequelize, DataTypes);
    models.Game = gameModel(sequelize, DataTypes);
    models.Card = cardModel(sequelize, DataTypes);
    models.Score = scoreModel(sequelize, DataTypes);

    models.sequelize = sequelize;

    Object.keys(models).forEach((name) => {
        if (models[name] && typeof models[name].associate === 'function') {
            models[name].associate(models);
        }
    });

    return models;
};
const models = createModels(sequelize);
export const { Player, Game, Card, Score } = models;

export default models;