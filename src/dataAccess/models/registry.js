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
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
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
        }
    );
    Registry.associate = (models) => {
        Registry.belongsTo(models.Game, { foreignKey: 'gameId' });
        Registry.belongsTo(models.Player, { foreignKey: 'playerId' });
    };
    return Registry;
}
export default registryModel;