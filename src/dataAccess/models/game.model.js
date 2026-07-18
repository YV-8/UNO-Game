import { Score } from '../Models/index.js';
const gameModel = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    'Game',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(('active', 'waiting', 'inactive', 'finished'),),
        allowNull: false,
        defaultValue: 'waiting',
      },
      maxPlayers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'games',
      timestamps: false,
    }
  );

  Game.associate = (models) => {
    Game.hasMany(models.Card, { foreignKey: 'gameId' });
    Game.hasMany(models.Score, { foreignKey: 'gameId' });
  };

  return Game;
};

export default gameModel;