const cardModel = (sequelize, DataTypes) => {
    const Card = sequelize.define(
        'Card',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            color: {
                type: DataTypes.ENUM('red', 'blue', 'yellow', 'green'),
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'cards',
            timestamps: false,
        }
    );

    Card.associate = (models) => {
        Card.belongsTo(models.Game, { foreignKey: 'gameId' });
    };

    return Card;
};

export default cardModel;