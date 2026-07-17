import { DataTypes } from 'sequelize';
import sequelize from '../db.config.js';

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'player',
  timestamps: true,
});

export default Player;