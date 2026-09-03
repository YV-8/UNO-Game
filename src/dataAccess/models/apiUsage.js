const apiUsageModel = (sequelize, DataTypes) => {
    const ApiUsage = sequelize.define(
        'ApiUsage',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            endpointAccess: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            requestMethod: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            statusCode: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            responseTime: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            timestamp: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: 'api_usage_logs',
            timestamps: false,
        }
    );

    return ApiUsage;
};

export default apiUsageModel;