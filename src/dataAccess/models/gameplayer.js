const gamePlayerModel = (sequelize, DataTypes) => {
    const GamePlayer = sequelize.define(
        'GamePlayer',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            turnOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultVaLUE: 0,
            },
            score: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            joinedAt: {
                type:DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'game_players',
            timestamps: false,
            indexes: [
                { unique: true, fields: ['gameId', 'userId']}
            ],
        }
    );

    GamePlayer.associate = (models) => {
        GamePlayer.belongsTo(models.Game, { foreignKey: 'gameId' });
        GamePlayer.belongsTo(models.User, { foreignKey: 'userId' });
    };
    return GamePlayer;
};

export default gamePlayerModel;