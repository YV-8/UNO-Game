const gameModel = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    'Game',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rules: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      state: {
        type: DataTypes.ENUM('waiting', 'in_progress', 'finished'),
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      currentPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      direction: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
      },
      chosenColor: {
        type: DataTypes.ENUM('red', 'blue', 'yellow', 'green'),
        allowNull: true,
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
    Game.belongsTo(models.Player, { foreignKey: 'creatorId', as: 'creator' });
    Game.belongsTo(models.Player, { foreignKey: 'currentPlayerId', as: 'currentPlayer' });
    Game.hasMany(models.Card, { foreignKey: 'gameId' });
    Game.hasMany(models.Score, { foreignKey: 'gameId' });
    Game.hasMany(models.GamePlayer, { foreignKey: 'gameId' });
    Game.belongsToMany(models.Player, {
      through: models.GamePlayer,
      foreignKey: 'gameId',
      otherKey: 'playerId',
      as: 'players',
    });
  };

  return Game;
};

export default gameModel;
