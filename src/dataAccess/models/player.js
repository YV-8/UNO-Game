const playerModel = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }, {
    tableName: 'player',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['username'],
        name: 'player_username_unique'
      }
    ]
  });

  Player.associate = (models) => {
    Player.hasMany(models.Score, { foreignKey: 'playerId' });
  };

  return Player;
};

export default playerModel;

