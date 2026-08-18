import { DataTypes } from "sequelize";
import sequelize from "../database";

const registryModel = (sequelize, DataTypes) => {
    const Registry = sequelize.define(
        'Registry',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            move: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            details: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: "No details",
            },
            timestamp:{
                type: DataTypes.JSON,
                dafaultValue:DataTypes.NOW,
            },
            gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            playerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "moves",
            timestamps: false,
            indexes: [
                { unique: true, fields: ['gameId', 'playerId']}
            ],
        }
    );
}
export default Registry;