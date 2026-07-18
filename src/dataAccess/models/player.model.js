const playerModel = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
    }
  }, {
    tableName: 'player',
    timestamps: true
  });

  Player.associate = (models) => {
    Player.hasMany(models.Score, { foreignKey: 'playerId' });
  };

  return Player;
};

export default playerModel;

