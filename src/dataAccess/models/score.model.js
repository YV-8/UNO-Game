const scoreModel = (sequelize, DataTypes) => {
    const Score = sequelize.define(
        'Score',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            playerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            score: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'scores',
            timestamps: false,
        }
    );

    Score.associate = (models) => {
        Score.belongsTo(models.Player, { foreignKey: 'playerId' });
        Score.belongsTo(models.Game, { foreignKey: 'gameId' });
    };

    return Score;
};

export default scoreModel;