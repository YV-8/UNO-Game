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