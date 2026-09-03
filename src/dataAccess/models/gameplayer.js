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
            playerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            turnOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            score: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            hasSaidUno: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            hasLeft: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
                { unique: true, fields: ['gameId', 'playerId']}
            ],
        }
    );

    GamePlayer.associate = (models) => {
        GamePlayer.belongsTo(models.Game, { foreignKey: 'gameId' });
        GamePlayer.belongsTo(models.Player, { foreignKey: 'playerId' });
    };
    return GamePlayer;
};

export default gamePlayerModel;